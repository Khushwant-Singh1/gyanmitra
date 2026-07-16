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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ApiError_utils_1 = require("../utils/ApiError.utils");
// Regular expression for validating email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isValidEmail(options.to)) {
        throw new ApiError_utils_1.ApiError(400, 'Invalid email address format.');
    }
    const mailOptions = {
        to: options.to,
        subject: options.subject,
        text: options.emailTemplate.text,
        html: options.emailTemplate.html,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new ApiError_utils_1.ApiError(500, 'Problem on sending mail');
    }
});
exports.sendEmail = sendEmail;
