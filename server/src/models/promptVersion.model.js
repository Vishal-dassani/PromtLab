import mongoose from "mongoose";

const clarificationQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const promptVersionSchema = new mongoose.Schema(
  {
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    optimizedPrompt: {
      type: String,
      required: true,
    },
    clarificationQuestions: {
      type: [clarificationQuestionSchema],
      default: [],
    },
    userAnswers: {
      type: Map,
      of: String,
      default: {},
    },
    assumptions: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    action: {
      type: String,
      enum: ["initial", "answer_questions", "recreate"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    provider: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

promptVersionSchema.index({ promptId: 1, versionNumber: 1 }, { unique: true });

export default mongoose.model("PromptVersion", promptVersionSchema);
