import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guestSessionHash: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    originalInput: {
      type: String,
      required: true,
      maxlength: 20_000,
    },
    context: {
      type: String,
      default: "",
      maxlength: 10_000,
    },
    context: {
      type: String,
      default: "",
      maxlength: 10_000,
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromptVersion",
      default: null,
    },
    category: {
      type: String,
      enum: ["development", "writing", "design", "research", "business"],
      default: "development",
    },
    targetModel: {
      type: String,
      default: "gemini",
      maxlength: 100,
    },
    outputStyle: {
      type: String,
      enum: ["detailed", "concise", "structured"],
      default: "structured",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

promptSchema.index({ userId: 1, updatedAt: -1 });
promptSchema.index(
  { guestSessionHash: 1 },
  {
    unique: true,
    partialFilterExpression: { guestSessionHash: { $type: "string" } },
  },
);

export default mongoose.model("Prompt", promptSchema);
