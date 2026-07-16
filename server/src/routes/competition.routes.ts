import { Router } from 'express';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import { ADMINISTRATOR_ROLE } from '../constants';
import { upload } from '../middlewares/multer.middlewares'; // Import Multer
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';
import {
  createCompetition,
  announceResults,
  registerParticipant,
  getParticipantsByComp,
  getAllCompetitions,
  deleteCompetition,
  updateCompetition,
  getCompetitionBySlug,
  checkStudentResult,
  updateParticipantRank,
  getActiveCompetitionForHome,
  
} from '../controllers/competition.controller';

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES (Student Side)
// ==========================================
router.get('/active-hub', getActiveCompetitionForHome);
router.get('/all', getAllCompetitions); 
router.get('/slug/:slug', getCompetitionBySlug);

// FIXED: Multer (upload.single) validation se PEHLE aayega
router.post(
  '/register',
  upload.single('uploadFile'), 
  checkRequiredFields(
    ['fullName', 'schoolCollege', 'mobileNumber', 'emailId', 'answer', 'competitionId'], 
    FIELD_SOURCE.body
  ),
  registerParticipant
);

router.post('/check-result', checkStudentResult);

// ==========================================
// 2. PROTECTED ROUTES (Admin Side)
// ==========================================

router.post(
  '/create',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  checkRequiredFields(
    ['title', 'slug', 'introduction', 'startDate', 'deadline'], 
    FIELD_SOURCE.body
  ),
  createCompetition
);

router.patch(
  '/update-results',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  checkRequiredFields(['participantIds', 'status'], FIELD_SOURCE.body),
  announceResults
);

router.get(
  '/participants/:_id',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  getParticipantsByComp
);

router.delete(
  '/:_id',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner]), 
  validateObjectId(['_id'], FIELD_SOURCE.params),
  deleteCompetition
);

router.patch(
  '/:_id',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  updateCompetition
);

router.patch(
  '/participant/:id/rank', 
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  checkRequiredFields(['rank'], FIELD_SOURCE.body),
  updateParticipantRank // Controller niche dekhein
);

export default router;