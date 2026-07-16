"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const multer_middlewares_1 = require("../middlewares/multer.middlewares"); // Import Multer
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const competition_controller_1 = require("../controllers/competition.controller");
const router = (0, express_1.Router)();
// ==========================================
// 1. PUBLIC ROUTES (Student Side)
// ==========================================
router.get('/active-hub', competition_controller_1.getActiveCompetitionForHome);
router.get('/all', competition_controller_1.getAllCompetitions);
router.get('/slug/:slug', competition_controller_1.getCompetitionBySlug);
// FIXED: Multer (upload.single) validation se PEHLE aayega
router.post('/register', multer_middlewares_1.upload.single('uploadFile'), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['fullName', 'schoolCollege', 'mobileNumber', 'emailId', 'answer', 'competitionId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), competition_controller_1.registerParticipant);
router.post('/check-result', competition_controller_1.checkStudentResult);
// ==========================================
// 2. PROTECTED ROUTES (Admin Side)
// ==========================================
router.post('/create', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['title', 'slug', 'introduction', 'startDate', 'deadline'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), competition_controller_1.createCompetition);
router.patch('/update-results', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['participantIds', 'status'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), competition_controller_1.announceResults);
router.get('/participants/:_id', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), competition_controller_1.getParticipantsByComp);
router.delete('/:_id', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), competition_controller_1.deleteCompetition);
router.patch('/:_id', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), competition_controller_1.updateCompetition);
router.patch('/participant/:id/rank', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['rank'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), competition_controller_1.updateParticipantRank // Controller niche dekhein
);
exports.default = router;
