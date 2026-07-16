"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const UserController = __importStar(require("../controllers/Users/index"));
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const router = (0, express_1.Router)();
router.post('/sign-in', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(UserController.USER_SIGN_IN_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), UserController.signIn);
router.post('/sign-out', UserController.signOut);
router.post('/viewer', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(UserController.VIEWER_SIGN_UP_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), UserController.viewerSignup);
router.post('/viewer/verify-email/:_token', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_token'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), UserController.verifyEmailWithToken);
router.post('/viewer/resend-verification', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['userId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.query), (0, validateObjectId_middlewares_1.validateObjectId)(['userId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.query), UserController.reSendEmailVerification);
router.post('/admin/:_token', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(UserController.ADMINISTRATOR_SIGN_UP_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_token'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), UserController.administratorSignUp);
exports.default = router;
