import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
    regNumber: { type: String, unique: true }, // Auto-generated: GM-2026-001
    fullName: { type: String, required: true },
    schoolCollege: { type: String },
    mobileNumber: { type: String },
    emailId: { type: String },
    answer: { type: String },
    uploadFileUrl: { type: String }, // Multer se aaya hua file path
    address: { type: String },
    status: { type: String, enum: ["pending", "pass", "fail"], default: "pending" },
    rank: { type: String },
    competition: { type: Schema.Types.ObjectId, ref: "Competition" }
}, { timestamps: true });

export const Participant = mongoose.model("Participant", participantSchema);