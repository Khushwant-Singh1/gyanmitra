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
exports.TryVerifyJWT = exports.VerifyJWT = void 0;
const constants_1 = require("../constants");
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../utils/ApiError.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_models_1 = require("../models/user.models");
const VerifyJWT = (allowedRoles) => (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.cookies['access_token'] ||
        ((_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
    if (!token)
        throw new ApiError_utils_1.ApiError(401, 'Unauthorized request');
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        throw new ApiError_utils_1.ApiError(401, 'Invalid or expired token');
    }
    if (!allowedRoles.includes(decodedToken.user_role))
        throw new ApiError_utils_1.ApiError(401, `provide user role is not allowed`, [
            'INVALID USER ROLE',
        ]);
    const user = yield user_models_1.User.findOne({
        _id: decodedToken._id,
        role: decodedToken.user_role,
    }).select(constants_1.USER_FIELDS_TO_HIDE);
    if (!user)
        throw new ApiError_utils_1.ApiError(401, 'Unauthorized request');
    if (user.isBlocked)
        throw new ApiError_utils_1.ApiError(401, 'user is blocked', ['USER_BLOCKED']);
    if (!user.isEmailVerified)
        throw new ApiError_utils_1.ApiError(401, 'user email is not verified', [
            'USER_EMAIL_NOT_VERIFIED',
        ]);
    req.user = user;
    return next();
}));
exports.VerifyJWT = VerifyJWT;
const TryVerifyJWT = (allowedRoles) => (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.cookies['access_token'] ||
        ((_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
    if (!token) {
        req.user = null;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        req.user = null;
        return next();
    }
    if (!allowedRoles.includes(decodedToken.user_role)) {
        req.user = null;
        return next();
    }
    const user = yield user_models_1.User.findOne({
        _id: decodedToken._id,
        role: decodedToken.user_role,
    }).select(constants_1.USER_FIELDS_TO_HIDE);
    if (!user) {
        req.user = null;
        return next();
    }
    if (user.isBlocked) {
        req.user = null;
        return next();
    }
    req.user = user;
    return next();
}));
exports.TryVerifyJWT = TryVerifyJWT;
