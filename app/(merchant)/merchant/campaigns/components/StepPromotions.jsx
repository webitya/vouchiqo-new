import { Home, Mail, Volume2 } from "lucide-react";

const PROMOTION_OPTIONS = [
  {
    key: "homepageSlot",
    title: "Pin in Homepage Hero Section",
    description:
      "Elevates your attached offers to priority placement in the hero carousel.",
    icon: Home,
  },
  {
    key: "pushNotification",
    title: "Send Brand Push Notification",
    description:
      "Broadcast an instant notification alert to all users who follow your store.",
    icon: Volume2,
  },
  {
    key: "newsletter",
    title: "Include in Weekly Newsletter digest",
    description:
      "Feature this campaign in the weekly digest sent to Ranchi and local regional shoppers.",
    icon: Mail,
  },
];

export default function StepPromotions({ settings, onSettingChange }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
        Step 3: Campaign promotions
      </h4>
      <p className="text-xs text-brand-subtext font-semibold">
        Set promotion triggers to maximize reach. Some add-on costs may apply.
      </p>

      <div className="space-y-3">
        {PROMOTION_OPTIONS.map(({ key, title, description, icon: Icon }) => (
          <div
            key={key}
            className="flex justify-between items-center p-4 border border-brand-border rounded-xl bg-brand-surface"
          >
            <div className="flex gap-3">
              <Icon className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-brand-navy block">
                  {title}
                </span>
                <span className="text-[10px] text-brand-subtext block font-medium">
                  {description}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!!settings[key]}
              onChange={(e) => onSettingChange(key, e.target.checked)}
              className="w-4 h-4 cursor-pointer text-brand-blue"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
