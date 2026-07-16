import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../utils/asyncHandler.utils';
import { IJwtRequest } from '../middlewares/auth.middlewares';
import { ApiError } from '../utils/ApiError.utils';
import { ApiResponse } from '../utils/ApiResponse.utils';
import { Competition } from '../models/competition.models';
import { Participant } from '../models/participant.models';
import { isValidObjectId } from 'mongoose';

/**
 * 1. Get All Competitions (Public & Admin Dashboard)
 *
 */
export const getAllCompetitions = AsyncHandler(
  async (req: Request, res: Response) => {
    const competitions = await Competition.find({}).sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, competitions, "Competitions fetched successfully"));
  }
);

/**
 * 2. Get Single Competition by Slug (For Details Page)
 *
 */
export const getCompetitionBySlug = AsyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const competition = await Competition.findOne({ slug });

    if (!competition) throw new ApiError(404, "Competition details not found");

    return res
      .status(200)
      .json(new ApiResponse(200, competition, "Competition fetched successfully"));
  }
);

/**
 * 3. Check Student Result Portal
 *
 */
export const checkStudentResult = AsyncHandler(
  async (req: Request, res: Response) => {
    const { regNumber, mobileNumber } = req.body;

    if (!regNumber || !mobileNumber) throw new ApiError(400, "Please provide all details");

    const participant = await Participant.findOne({ regNumber, mobileNumber });

    if (!participant) {
      throw new ApiError(404, "Invalid Registration Number or Mobile Number");
    }

    const resultData = {
      fullName: participant.fullName,
      status: participant.status,
      rank: participant.rank || "Pending",
      regNumber: participant.regNumber
    };

    return res
      .status(200)
      .json(new ApiResponse(200, resultData, "Result fetched successfully"));
  }
);

/**
 * 4. Register Participant with Unique ID (Fix for TS Error 18049)
 *
 */
export const registerParticipant = AsyncHandler(
  async (req: Request, res: Response) => {
    // 1. competitionId ko alag karein taaki use schema ke 'competition' field mein map kar sakein
    const { competitionId, ...otherData } = req.body; 
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Duplicate registration check (competitionId ka use karke)
    const alreadyRegistered = await Participant.findOne({ 
        competition: competitionId, 
        mobileNumber: req.body.mobileNumber 
    });
    if (alreadyRegistered) throw new ApiError(409, "Already registered for this competition");

    // 3. Reg Number generation logic
    const lastParticipant = await Participant.findOne().sort({ createdAt: -1 });
    let nextCount = 1;
    if (lastParticipant && lastParticipant.regNumber) {
      const parts = lastParticipant.regNumber.split('-');
      if (parts.length >= 3) nextCount = parseInt(parts[2]) + 1;
    }
    const regNumber = `GM-2026-${String(nextCount).padStart(3, '0')}`;

    // 4. Save to DB: 'competition' field mein competitionId pass karna ZAROORI hai
    const participant = await Participant.create({
      ...otherData,           // Baaki saara data (fullName, email, etc.)
      competition: competitionId, // Yeh link karega student ko competition se
      regNumber,
      uploadFileUrl: filePath 
    });

    return res.status(201).json(new ApiResponse(201, participant, "Registration Successful"));
  }
);

/**
 * 5. Create Competition Hub (Admin Only)
 *
 */
export const createCompetition = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    const { slug } = req.body;
    const slugExists = await Competition.exists({ slug });
    if (slugExists) throw new ApiError(409, 'Slug already exists');

    const competition = await Competition.create(req.body);
    return res.status(201).json(new ApiResponse(201, competition, 'Created successfully'));
  }
);

/**
 * 6. Update Competition Details
 *
 */
export const updateCompetition = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    const { _id } = req.params;
    const { slug } = req.body;

    const slugExists = await Competition.findOne({ slug, _id: { $ne: _id } });
    if (slugExists) throw new ApiError(409, "Slug already in use");

    const competition = await Competition.findByIdAndUpdate(_id, { $set: req.body }, { new: true });
    if (!competition) throw new ApiError(404, "Not found");

    return res.status(200).json(new ApiResponse(200, competition, "Updated successfully"));
  }
);

/**
 * 7. Get Participants for Admin Modal
 */
// apps/server/src/controllers/competition.controller.ts
export const getParticipantsByComp = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    const participants = await Participant.find({ competition: req.params._id })
      .sort({ createdAt: -1 });
    // Ismein 'uploadFileUrl' automatically include ho jayega
    return res.status(200).json(new ApiResponse(200, participants, 'Participants fetched'));
  }
);

/**
 * 8. Bulk action Result Announce (Admin)
 */
export const announceResults = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    const { participantIds, status } = req.body;
    await Participant.updateMany({ _id: { $in: participantIds } }, { $set: { status } });
    return res.status(200).json(new ApiResponse(200, {}, 'Results updated'));
  }
);

export const updateParticipantRank = AsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rank } = req.body;

    // Participant model mein rank update
    const participant = await Participant.findByIdAndUpdate(
      id,
      { $set: { rank } },
      { new: true }
    );

    if (!participant) throw new ApiError(404, "Participant not found");

    return res.status(200).json(
      new ApiResponse(200, participant, "Rank updated successfully")
    );
  }
);

/**
 * 9. Delete Competition
 */
export const deleteCompetition = AsyncHandler(
  async (req: IJwtRequest, res: Response) => {
    await Competition.findByIdAndDelete(req.params._id);
    await Participant.deleteMany({ competition: req.params._id });
    return res.status(200).json(new ApiResponse(200, {}, "Deleted successfully"));
  }
);

/**
 * 10. Get Single Active Competition for Home Page Card (UPDATED)
 */
export const getActiveCompetitionForHome = AsyncHandler(
  async (req: Request, res: Response) => {
    // 1. Pehle "Open" status wala dhoondo (Case sensitive check karein)
    let competition = await Competition.findOne({ 
      status: { $regex: /open/i } // 'open' ya 'Open' dono chalenge
    }).sort({ createdAt: -1 });

    // 2. Agar koi "Open" nahi hai, toh bina kisi filter ke LATEST uthao
    if (!competition) {
      competition = await Competition.findOne().sort({ createdAt: -1 });
    }

    // 3. Agar database hi khali hai
    if (!competition) {
      return res.status(200).json(new ApiResponse(200, null, "No competition found in DB"));
    }

    return res.status(200).json(new ApiResponse(200, competition, "Competition fetched successfully"));
  }
);