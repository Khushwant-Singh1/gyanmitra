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
exports.User = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("../constants");
exports.userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    emailVerification: {
        type: {
            token: { type: String },
            expiry: { type: Date },
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        required: true,
    },
    deactivatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: constants_1.MODELS.User },
    inviterId: { type: mongoose_1.Schema.Types.ObjectId, ref: constants_1.MODELS.User },
}, { timestamps: true });
exports.userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        try {
            this.password = yield bcrypt_1.default.hash(this.password, 10);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
exports.userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
exports.userSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: user.email,
            user_role: user.role,
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        });
        yield user.save();
        return token;
    });
};
exports.userSchema.methods.generateEmailToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = crypto_1.default
            .randomBytes(16)
            .toString('hex')
            .toUpperCase()
            .slice(0, 6);
        const hashedToken = crypto_1.default
            .createHmac('sha256', process.env.EMAIL_SECRET_KEY)
            .update(token)
            .digest('hex');
        const tokenExpiryTime = parseInt(process.env.EMAIL_TOKEN_EXPIRY);
        user.emailVerification = {
            token: hashedToken,
            expiry: new Date(Date.now() + tokenExpiryTime * 60 * 1000),
        };
        yield user.save();
        return token;
    });
};
exports.User = (0, mongoose_1.model)(constants_1.MODELS.User, exports.userSchema);
