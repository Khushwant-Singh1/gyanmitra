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
exports.reSendEmailVerification = exports.verifyEmailWithToken = exports.viewerSignup = exports.VIEWER_SIGN_UP_REQ_FIELDS = exports.administratorSignUp = exports.signOut = exports.ADMINISTRATOR_SIGN_UP_REQ_FIELDS = exports.signIn = exports.USER_SIGN_IN_REQ_FIELDS = void 0;
const asyncHandler_utils_1 = require("../../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../../utils/ApiError.utils");
const constants_1 = require("../../constants");
const ApiResponse_utils_1 = require("../../utils/ApiResponse.utils");
const crypto_1 = __importDefault(require("crypto"));
const invitation_models_1 = require("../../models/invitation.models");
const user_models_1 = require("../../models/user.models");
const constants_2 = require("../../constants");
const mailer_services_1 = require("../../services/mailer.services");
const emailTemplates_utils_1 = require("../../utils/emailTemplates.utils");
exports.USER_SIGN_IN_REQ_FIELDS = ['email', 'password'];
exports.signIn = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_models_1.User.findOne({
        email,
    });
    if (!user)
        throw new ApiError_utils_1.ApiError(401, 'either password or email wrong', [
            'unauthorized request',
        ]);
    const isPasswordCorrect = yield user.comparePassword(password);
    if (!isPasswordCorrect)
        throw new ApiError_utils_1.ApiError(401, 'either password or email wrong', [
            'unauthorized request',
        ]);
    const accessToken = yield user.generateAccessToken();
    const cleanUser = yield user_models_1.User.findById(user._id).select(constants_1.USER_FIELDS_TO_HIDE);
    return res
        .status(201)
        .cookie('access_token', accessToken, constants_2.COOKIE_OPTION)
        .send(new ApiResponse_utils_1.ApiResponse(201, { user: cleanUser, accessToken }, 'User signIn success'));
}));
exports.ADMINISTRATOR_SIGN_UP_REQ_FIELDS = [
    'password',
    'firstName',
    'lastName',
];
exports.signOut = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .clearCookie('access_token', constants_2.COOKIE_OPTION)
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, {}, 'User sign out success'));
}));
exports.administratorSignUp = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, firstName, lastName } = req.body;
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
    const userExits = yield user_models_1.User.findOne({
        email: invitation.receiverEmail,
    });
    if (userExits)
        throw new ApiError_utils_1.ApiError(401, 'user email already exits');
    const userCreate = yield user_models_1.User.create({
        password,
        firstName: firstName,
        lastName: lastName,
        email: invitation.receiverEmail,
        inviterId: invitation.inviterId,
        isEmailVerified: true,
        role: invitation.receiverRole,
    });
    const accessToken = yield userCreate.generateAccessToken();
    const user = yield user_models_1.User.findById(userCreate._id).select(constants_1.USER_FIELDS_TO_HIDE);
    if (!user)
        throw new ApiError_utils_1.ApiError(500, 'Could not find user created');
    invitation.registeredAdministratorId = user._id;
    invitation.save();
    res
        .status(201)
        .cookie('access_token', accessToken, constants_2.COOKIE_OPTION)
        .json(new ApiResponse_utils_1.ApiResponse(201, { user: user, accessToken }, 'Successfully created user'));
}));
exports.VIEWER_SIGN_UP_REQ_FIELDS = [
    'firstName',
    'lastName',
    'email',
    'password',
];
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
exports.viewerSignup = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || typeof firstName !== 'string') {
        return next(new ApiError_utils_1.ApiError(400, 'First name is required and must be a string'));
    }
    if (!lastName || typeof lastName !== 'string') {
        return next(new ApiError_utils_1.ApiError(400, 'Last name is required and must be a string'));
    }
    if (!email || !isValidEmail(email)) {
        return next(new ApiError_utils_1.ApiError(400, 'A valid email address is required'));
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
        return next(new ApiError_utils_1.ApiError(400, 'Password must be at least 6 characters'));
    }
    const isEmailExits = yield user_models_1.User.exists({ email });
    if (isEmailExits)
        throw new ApiError_utils_1.ApiError(400, 'The user already exits with email');
    const viewer = yield user_models_1.User.create({
        firstName,
        lastName,
        email,
        password,
        role: constants_1.USER_ROLE.Viewer,
    });
    const accessToken = yield viewer.generateAccessToken();
    const cleanViewer = yield user_models_1.User.findById(viewer._id).select(constants_1.USER_FIELDS_TO_HIDE);
    if (!cleanViewer)
        throw new ApiError_utils_1.ApiError(500, 'Problem on creating user');
    return res
        .status(200)
        .cookie('access_token', accessToken, constants_2.COOKIE_OPTION)
        .json(new ApiResponse_utils_1.ApiResponse(200, { user: cleanViewer }, 'successfully created user'));
}));
exports.verifyEmailWithToken = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params._token;
    const hashedToken = crypto_1.default
        .createHmac('sha256', process.env.EMAIL_SECRET_KEY)
        .update(token)
        .digest('hex');
    const viewer = yield user_models_1.User.findOne({
        'emailVerification.token': hashedToken,
        'emailVerification.expiry': { $gt: new Date(Date.now()) },
    });
    if (!viewer)
        throw new ApiError_utils_1.ApiError(401, 'Unauthorized request, time out or invalid token');
    const accessToken = yield viewer.generateAccessToken();
    const cleanViewer = yield user_models_1.User.findByIdAndUpdate(viewer._id, {
        $unset: { emailVerification: '' },
        isEmailVerified: true,
        last_email_verified: Date.now(),
    }, { new: true }).select(constants_1.USER_FIELDS_TO_HIDE);
    if (!cleanViewer)
        throw new ApiError_utils_1.ApiError(500, 'Problem in updating user');
    return res
        .status(200)
        .cookie('access_token', accessToken, constants_2.COOKIE_OPTION)
        .json(new ApiResponse_utils_1.ApiResponse(200, { user: cleanViewer }, 'successfully user email verified'));
}));
exports.reSendEmailVerification = (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    const user = yield user_models_1.User.findById(userId);
    if (!user)
        throw new ApiError_utils_1.ApiError(400, 'User ID do not exits');
    if (user.isEmailVerified && !user.emailVerification)
        throw new ApiError_utils_1.ApiError(400, 'User email already verified, and there is older email verification');
    const token = yield user.generateEmailToken();
    const cleanUser = yield user_models_1.User.findById(userId).select(constants_1.USER_FIELDS_TO_HIDE);
    const sendmail = yield (0, mailer_services_1.sendEmail)({
        to: user.email,
        subject: constants_1.EMAIL_SUBJECTS.Verification,
        emailTemplate: yield (0, emailTemplates_utils_1.verificationTemplate)(token),
    });
    return res
        .status(200)
        .json(new ApiResponse_utils_1.ApiResponse(200, { user: cleanUser, email: sendmail }, 'successfully sended email verification'));
}));
