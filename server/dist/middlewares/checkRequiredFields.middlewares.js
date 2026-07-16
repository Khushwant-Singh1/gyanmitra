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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequiredFields = exports.FIELD_SOURCE = void 0;
const asyncHandler_utils_1 = require("../utils/asyncHandler.utils");
const ApiError_utils_1 = require("../utils/ApiError.utils");
var FIELD_SOURCE;
(function (FIELD_SOURCE) {
    FIELD_SOURCE["body"] = "body";
    FIELD_SOURCE["params"] = "params";
    FIELD_SOURCE["query"] = "query";
})(FIELD_SOURCE || (exports.FIELD_SOURCE = FIELD_SOURCE = {}));
const checkRequiredFields = (requiredFields, source = FIELD_SOURCE.body) => (0, asyncHandler_utils_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req[source];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0)
        throw new ApiError_utils_1.ApiError(400, `Missing required fields: ${missingFields}`, missingFields);
    next();
}));
exports.checkRequiredFields = checkRequiredFields;
