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
exports.Invitation = exports.InvitationSchema = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("../constants");
exports.InvitationSchema = new mongoose_1.Schema({
    inviterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
        required: true,
    },
    receiverEmail: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    messageId: {
        type: String,
    },
    receiverRole: {
        type: String,
        enum: [constants_1.ADMINISTRATOR_ROLE.Admin, constants_1.ADMINISTRATOR_ROLE.Editor],
        required: true,
    },
    registeredAdministratorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.User,
    },
    message: {
        type: String,
        required: true,
    },
    token: {
        data: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
    },
}, { timestamps: true });
exports.InvitationSchema.methods.generateInvitationToken =
    function () {
        return __awaiter(this, void 0, void 0, function* () {
            const invitation = this;
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const hashedToken = crypto_1.default
                .createHmac('sha256', process.env.INVITATION_SECRET_KEY)
                .update(token)
                .digest('hex');
            const tokenExpiryTime = parseInt(process.env.INVITATION_TOKEN_EXPIRY);
            if (isNaN(tokenExpiryTime)) {
                throw new Error('Invalid token expiry value in environment variables.');
            }
            invitation.token.expiresAt = new Date(Date.now() + tokenExpiryTime * 60 * 1000);
            invitation.token.data = hashedToken;
            yield invitation.save();
            return token;
        });
    };
exports.Invitation = (0, mongoose_1.model)(constants_1.MODELS.Invitation, exports.InvitationSchema);
