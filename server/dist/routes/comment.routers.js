"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const comment_controllers_1 = require("../controllers/comment.controllers");
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const router = (0, express_1.Router)();
router.get('/', (0, auth_middlewares_1.VerifyJWT)([constants_1.USER_ROLE.Admin, constants_1.USER_ROLE.Owner]), comment_controllers_1.getAllComments);
router
    .route('/:_id')
    .post((0, auth_middlewares_1.VerifyJWT)([
    constants_1.USER_ROLE.Admin,
    constants_1.USER_ROLE.Viewer,
    constants_1.USER_ROLE.Editor,
    constants_1.USER_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['message'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), comment_controllers_1.postComment)
    .put((0, auth_middlewares_1.VerifyJWT)([
    constants_1.USER_ROLE.Admin,
    constants_1.USER_ROLE.Viewer,
    constants_1.USER_ROLE.Editor,
    constants_1.USER_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['message'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), comment_controllers_1.editComment)
    .delete((0, auth_middlewares_1.VerifyJWT)([
    constants_1.USER_ROLE.Admin,
    constants_1.USER_ROLE.Viewer,
    constants_1.USER_ROLE.Editor,
    constants_1.USER_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), comment_controllers_1.deleteComment);
exports.default = router;
