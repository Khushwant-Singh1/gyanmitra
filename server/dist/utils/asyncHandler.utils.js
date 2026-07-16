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
exports.AsyncHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_utils_1 = require("./ApiError.utils");
const asyncHandler = (fn) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fn(req, res, next);
    }
    catch (err) {
        if (process.env.IS_DEVELOPMENT)
            console.error('from async handler: ', err.message);
        // Handle Mongoose Validation Errors
        if (err instanceof mongoose_1.default.Error.ValidationError) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'Validation Error',
                errors: err.errors,
            });
        }
        // Handle Mongoose Cast Errors (e.g., invalid ObjectId)
        if (err instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: `Invalid ${err.path}: ${err.value}`,
            });
        }
        // Handle Mongoose Duplicate Key Errors (e.g., duplicate)
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const value = err.keyValue[field];
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: `Duplicate value for field ${field}: "${value}". Please use a different value.`,
            });
        }
        // Handle custom errors with statusCode
        if (err instanceof ApiError_utils_1.ApiError) {
            return res.status(err.statusCode).json({
                success: err.success,
                message: err.message,
                errors: err.errors,
                statusCode: err.statusCode,
            });
        }
        // Handle other errors (500 Internal Server Error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            statusCode: 500,
        });
    }
});
exports.AsyncHandler = asyncHandler;
