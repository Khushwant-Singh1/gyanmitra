"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = void 0;
const ApiError_utils_1 = require("../utils/ApiError.utils");
const checkRequiredFields_middlewares_1 = require("./checkRequiredFields.middlewares");
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const mongoose_1 = require("mongoose");
const validateObjectId = (fieldNames, source = checkRequiredFields_middlewares_1.FIELD_SOURCE.body) => (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => {
    for (const field of fieldNames) {
        const id = req[source][field];
        if (id === undefined) {
            console.error(`error: validateObjectId: Field '${field}' is not found in ${source}`);
        }
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            throw new ApiError_utils_1.ApiError(400, `Invalid ${field} format`, [
                `INVALID_${field.toUpperCase()}`,
            ]);
        }
    }
    next();
});
exports.validateObjectId = validateObjectId;
