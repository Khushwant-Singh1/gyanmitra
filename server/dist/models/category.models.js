"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100,
        unique: true,
        lowercase: true,
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: constants_1.MODELS.Category,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    index: {
        type: Number,
        required: true,
    },
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)(constants_1.MODELS.Category, CategorySchema);
