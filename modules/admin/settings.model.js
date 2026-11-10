import mongoose, { Schema } from "mongoose";

const platformSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    collection: "platform_settings",
  },
);

const PlatformSetting =
  mongoose.models.PlatformSetting ??
  mongoose.model("PlatformSetting", platformSettingSchema);
export default PlatformSetting;
