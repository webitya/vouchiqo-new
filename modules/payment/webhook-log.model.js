import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },

    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    signature: { type: String },
    verified: { type: Boolean, default: false },

    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    error: { type: String },

    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes
webhookLogSchema.index({ processed: 1 });
webhookLogSchema.index({ createdAt: -1 });

export const WebhookLog =
  mongoose.models.WebhookLog || mongoose.model("WebhookLog", webhookLogSchema);
export default WebhookLog;
