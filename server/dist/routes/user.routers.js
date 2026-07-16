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
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const invitation_controllers_1 = require("../controllers/invitation.controllers");
const router = (0, express_1.Router)();
router.get('/home', UserController.getHomePageContent);
router.post('/invite', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner, constants_1.ADMINISTRATOR_ROLE.Admin]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(invitation_controllers_1.createInvitationReqFields, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), invitation_controllers_1.createInvitation);
router.get('/invite/validate/:_token', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_token'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), invitation_controllers_1.isValidInviteToken);
router.get('/me', (0, auth_middlewares_1.TryVerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Owner,
    constants_1.USER_ROLE.Viewer,
]), UserController.getCurrentUserSession);
router.get('/dashboard', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), UserController.getDashboardContent);
router.get('/', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), UserController.getAllUsers);
router.get('/name', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Owner,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Editor,
]), UserController.getUsersName);
exports.default = router;
