"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const mediaFile_controllers_1 = require("../controllers/mediaFile.controllers");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const router = (0, express_1.Router)();
router
    .route('/:_id')
    .get((0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), mediaFile_controllers_1.getFileDetail)
    .delete((0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), mediaFile_controllers_1.deleteFile);
router.post('/', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), multer_middlewares_1.upload.single('file'), mediaFile_controllers_1.uploadFile);
router.get('/', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['file_types'], checkRequiredFields_middlewares_1.FIELD_SOURCE.query), mediaFile_controllers_1.getFiles);
exports.default = router;
