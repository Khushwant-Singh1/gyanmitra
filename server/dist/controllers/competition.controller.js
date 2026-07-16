"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveCompetitionForHome = exports.deleteCompetition = exports.updateParticipantRank = exports.announceResults = exports.getParticipantsByComp = exports.updateCompetition = exports.createCompetition = exports.registerParticipant = exports.checkStudentResult = exports.getCompetitionBySlug = exports.getAllCompetitions = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const competition_models_1 = require("../models/competition.models");
const participant_models_1 = require("../models/participant.models");
/**
 * 1. Get All Competitions (Public & Admin Dashboard)
 *
 */
exports.getAllCompetitions = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const competitions = yield competition_models_1.Competition.find({}).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, competitions, "Competitions fetched successfully"));
}));
/**
 * 2. Get Single Competition by Slug (For Details Page)
 *
 */
exports.getCompetitionBySlug = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const competition = yield competition_models_1.Competition.findOne({ slug });
    if (!competition)
        throw new ApiError_utils_1.ApiError(404, "Competition details not found");
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, competition, "Competition fetched successfully"));
}));
/**
 * 3. Check Student Result Portal
 *
 */
exports.checkStudentResult = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { regNumber, mobileNumber } = req.body;
    if (!regNumber || !mobileNumber)
        throw new ApiError_utils_1.ApiError(400, "Please provide all details");
    const participant = yield participant_models_1.Participant.findOne({ regNumber, mobileNumber });
    if (!participant) {
        throw new ApiError_utils_1.ApiError(404, "Invalid Registration Number or Mobile Number");
    }
    const resultData = {
        fullName: participant.fullName,
        status: participant.status,
        rank: participant.rank || "Pending",
        regNumber: participant.regNumber
    };
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, resultData, "Result fetched successfully"));
}));
/**
 * 4. Register Participant with Unique ID (Fix for TS Error 18049)
 *
 */
exports.registerParticipant = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. competitionId ko alag karein taaki use schema ke 'competition' field mein map kar sakein
    const _a = req.body, { competitionId } = _a, otherData = __rest(_a, ["competitionId"]);
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    // 2. Duplicate registration check (competitionId ka use karke)
    const alreadyRegistered = yield participant_models_1.Participant.findOne({
        competition: competitionId,
        mobileNumber: req.body.mobileNumber
    });
    if (alreadyRegistered)
        throw new ApiError_utils_1.ApiError(409, "Already registered for this competition");
    // 3. Reg Number generation logic
    const lastParticipant = yield participant_models_1.Participant.findOne().sort({ createdAt: -1 });
    let nextCount = 1;
    if (lastParticipant && lastParticipant.regNumber) {
        const parts = lastParticipant.regNumber.split('-');
        if (parts.length >= 3)
            nextCount = parseInt(parts[2]) + 1;
    }
    const regNumber = `GM-2026-${String(nextCount).padStart(3, '0')}`;
    // 4. Save to DB: 'competition' field mein competitionId pass karna ZAROORI hai
    const participant = yield participant_models_1.Participant.create(Object.assign(Object.assign({}, otherData), { competition: competitionId, // Yeh link karega student ko competition se
        regNumber, uploadFileUrl: filePath }));
    return res.status(201).json(new ApiResponse_utils_1.ApiResponse(201, participant, "Registration Successful"));
}));
/**
 * 5. Create Competition Hub (Admin Only)
 *
 */
exports.createCompetition = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.body;
    const slugExists = yield competition_models_1.Competition.exists({ slug });
    if (slugExists)
        throw new ApiError_utils_1.ApiError(409, 'Slug already exists');
    const competition = yield competition_models_1.Competition.create(req.body);
    return res.status(201).json(new ApiResponse_utils_1.ApiResponse(201, competition, 'Created successfully'));
}));
/**
 * 6. Update Competition Details
 *
 */
exports.updateCompetition = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const { slug } = req.body;
    const slugExists = yield competition_models_1.Competition.findOne({ slug, _id: { $ne: _id } });
    if (slugExists)
        throw new ApiError_utils_1.ApiError(409, "Slug already in use");
    const competition = yield competition_models_1.Competition.findByIdAndUpdate(_id, { $set: req.body }, { new: true });
    if (!competition)
        throw new ApiError_utils_1.ApiError(404, "Not found");
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, competition, "Updated successfully"));
}));
/**
 * 7. Get Participants for Admin Modal
 */
// apps/server/src/controllers/competition.controller.ts
exports.getParticipantsByComp = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = yield participant_models_1.Participant.find({ competition: req.params._id })
        .sort({ createdAt: -1 });
    // Ismein 'uploadFileUrl' automatically include ho jayega
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, participants, 'Participants fetched'));
}));
/**
 * 8. Bulk action Result Announce (Admin)
 */
exports.announceResults = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participantIds, status } = req.body;
    yield participant_models_1.Participant.updateMany({ _id: { $in: participantIds } }, { $set: { status } });
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, {}, 'Results updated'));
}));
exports.updateParticipantRank = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { rank } = req.body;
    // Participant model mein rank update
    const participant = yield participant_models_1.Participant.findByIdAndUpdate(id, { $set: { rank } }, { new: true });
    if (!participant)
        throw new ApiError_utils_1.ApiError(404, "Participant not found");
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, participant, "Rank updated successfully"));
}));
/**
 * 9. Delete Competition
 */
exports.deleteCompetition = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield competition_models_1.Competition.findByIdAndDelete(req.params._id);
    yield participant_models_1.Participant.deleteMany({ competition: req.params._id });
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, {}, "Deleted successfully"));
}));
/**
 * 10. Get Single Active Competition for Home Page Card (UPDATED)
 */
exports.getActiveCompetitionForHome = (0, asyncHandler_utils_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Pehle "Open" status wala dhoondo (Case sensitive check karein)
    let competition = yield competition_models_1.Competition.findOne({
        status: { $regex: /open/i } // 'open' ya 'Open' dono chalenge
    }).sort({ createdAt: -1 });
    // 2. Agar koi "Open" nahi hai, toh bina kisi filter ke LATEST uthao
    if (!competition) {
        competition = yield competition_models_1.Competition.findOne().sort({ createdAt: -1 });
    }
    // 3. Agar database hi khali hai
    if (!competition) {
        return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, null, "No competition found in DB"));
    }
    return res.status(200).json(new ApiResponse_utils_1.ApiResponse(200, competition, "Competition fetched successfully"));
}));
