import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  Tag,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StepDetails from "./StepDetails";
import StepListings from "./StepListings";
import StepPromotions from "./StepPromotions";
import StepSchedule from "./StepSchedule";
import WizardStepper from "./WizardStepper";

const STEPS = [
  { step: 1, label: "Details", icon: FileText },
  { step: 2, label: "Listings", icon: Ticket },
  { step: 3, label: "Promotions", icon: Tag },
  { step: 4, label: "Schedule", icon: Calendar },
];

export default function CampaignWizard({
  wizardStep,
  setWizardStep,
  campaignData,
  updateField,
  coupons,
  loadingCoupons,
  toggleCouponAttachment,
  startOpen,
  setStartOpen,
  endOpen,
  setEndOpen,
  handleBack,
  handleNext,
  handleCreateSubmit,
  isPending,
}) {
  return (
    <div className="space-y-4">
      {/* Stepper Header */}
      <WizardStepper
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        steps={STEPS}
      />

      {/* Step Content */}
      <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm">
        {wizardStep === 1 && (
          <StepDetails data={campaignData} updateField={updateField} />
        )}

        {wizardStep === 2 && (
          <StepListings
            coupons={coupons}
            loadingCoupons={loadingCoupons}
            selectedIds={campaignData.couponIds}
            onToggle={toggleCouponAttachment}
          />
        )}

        {wizardStep === 3 && (
          <StepPromotions
            settings={campaignData.settings}
            onSettingChange={(key, val) =>
              updateField("settings", { ...campaignData.settings, [key]: val })
            }
          />
        )}

        {wizardStep === 4 && (
          <StepSchedule
            campaignData={campaignData}
            updateField={updateField}
            startOpen={startOpen}
            setStartOpen={setStartOpen}
            endOpen={endOpen}
            setEndOpen={setEndOpen}
          />
        )}

        {/* Action Controls */}
        <div className="flex justify-between border-t border-brand-border pt-4 mt-6">
          {wizardStep > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="btn-tertiary text-xs py-2 px-4 flex items-center gap-1.5 border border-brand-border rounded-lg h-auto shadow-none font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {wizardStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5 border-0 h-auto shadow-none font-bold"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => handleCreateSubmit("draft")}
                disabled={isPending}
                className="btn-tertiary text-xs py-2 px-5 border border-brand-border rounded-lg h-auto font-bold"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleCreateSubmit("live")}
                disabled={isPending}
                className="btn-primary text-xs py-2 px-6 border-0 h-auto shadow-none font-bold"
              >
                {isPending ? "Creating..." : "Launch Campaign"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
