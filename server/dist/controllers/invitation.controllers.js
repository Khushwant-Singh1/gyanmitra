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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidInviteToken = exports.createInvitation = exports.createInvitationReqFields = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const invitation_models_1 = require("../models/invitation.models");
const mailer_services_1 = require("../services/mailer.services");
const constants_1 = require("../constants");
const emailTemplates_utils_1 = require("../utils/emailTemplates.utils");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const ApiResponse_utils_1 = require("../utils/ApiResponse.utils");
const crypto_1 = __importDefault(require("crypto"));
const user_models_1 = require("../models/user.models");
exports.createInvitationReqFields = ['email', 'message', 'receiverRole'];
exports.createInvitation = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, message, receiverRole } = req.body;
    const isEmailExists = yield invitation_models_1.Invitation.exists({ receiverEmail: email });
    const isUserExits = yield user_models_1.User.exists({ email });
    if (isUserExits)
        throw new ApiError_utils_1.ApiError(401, 'the user email is already exists');
    if (isEmailExists)
        throw new ApiError_utils_1.ApiError(401, 'the invited email is already exists');
    if (req.user.role === constants_1.ADMINISTRATOR_ROLE.Owner &&
        receiverRole === constants_1.ADMINISTRATOR_ROLE.Owner)
        throw new ApiError_utils_1.ApiError(401, 'owner cant invite owner');
    else if (req.user.role === constants_1.ADMINISTRATOR_ROLE.Admin &&
        receiverRole !== constants_1.ADMINISTRATOR_ROLE.Editor)
        throw new ApiError_utils_1.ApiError(401, 'admin can invite only editor');
    const invitation = yield invitation_models_1.Invitation.create({
        inviterId: req.user._id,
        receiverEmail: email,
        receiverRole: receiverRole,
        message,
    });
    if (!invitation)
        throw new ApiError_utils_1.ApiError(500, 'could not create invitation');
    const token = yield invitation.generateInvitationToken();
    const invitationUrl = `${process.env.CLIENT_URL}/administrator/sign-up/${token}`;
    const emailSended = yield (0, mailer_services_1.sendEmail)({
        to: email,
        subject: constants_1.EMAIL_SUBJECTS.Invitation,
        emailTemplate: yield (0, emailTemplates_utils_1.invitationTemplate)(message, invitationUrl, req.user.firstName + ' ' + req.user.lastName, req.user.role, receiverRole),
    });
    if (!emailSended)
        throw new ApiError_utils_1.ApiError(500, 'Error on sending email');
    const invitationUpdated = yield invitation_models_1.Invitation.findByIdAndUpdate(invitation._id, { messageId: emailSended.messageId }, { new: true }).select('-token');
    if (!invitationUpdated)
        throw new ApiError_utils_1.ApiError(500, 'Could not update the email message id');
    return res
        .status(201)
        .send(new ApiResponse_utils_1.ApiResponse(201, invitationUpdated, 'successfully created invitation'));
}));
exports.isValidInviteToken = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params._token;
    const hashedToken = crypto_1.default
        .createHmac('sha256', process.env.INVITATION_SECRET_KEY)
        .update(token)
        .digest('hex');
    const invitation = yield invitation_models_1.Invitation.findOne({
        'token.data': hashedToken,
        'token.expiresAt': { $gt: Date.now() },
    }).select('-token');
    if (!invitation)
        throw new ApiError_utils_1.ApiError(400, 'Token is invalid or expired');
    res
        .status(200)
        .send(new ApiResponse_utils_1.ApiResponse(200, invitation, 'Invitation token is valid and not expired'));
}));
