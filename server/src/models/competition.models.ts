import mongoose, { Schema } from "mongoose";

const competitionSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    introduction: { type: String },
    howToParticipate: { type: String }, // HTML from ReactQuill
    startDate: { type: Date },
    deadline: { type: Date },
    resultDate: { type: Date },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    status: { type: String, enum: ["Open", "Closed", "Result"], default: "Open" }
}, { timestamps: true });

export const Competition = mongoose.model("Competition", competitionSchema);