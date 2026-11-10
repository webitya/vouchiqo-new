"use client";

import { Loader2, MessageSquareHeart, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FEEDBACK_TAGS = [
  "Fast Document Upload",
  "Clear Step-by-Step Guidance",
  "Easy Location Pinning",
  "Simple Operating Hours Setup",
  "Clear KYC Instructions",
  "Mobile Friendly Experience",
  "Need More Tooltips / Help",
  "Overall Super Smooth",
];

const STAR_LABELS = {
  1: "Needs Significant Improvement",
  2: "Somewhat Difficult",
  3: "Good / Standard Experience",
  4: "Very Smooth & Fast",
  5: "Exceptional & Effortless!",
};

export default function ProcessFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  onDismiss,
  isSubmitting = false,
  title = "How was your profile setup experience?",
  subtitle = "You've completed your business profile. Help us make the partner journey even smoother!",
  merchantName = "",
}) {
  const [starRating, setStarRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [scaleScore, setScaleScore] = useState(85);
  const [selectedTags, setSelectedTags] = useState([
    "Clear Step-by-Step Guidance",
    "Overall Super Smooth",
  ]);
  const [comment, setComment] = useState("");

  const activeStar = hoveredStar || starRating;

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const getScaleDescriptor = useMemo(() => {
    if (scaleScore < 35)
      return {
        label: "Complex",
        color: "text-rose-600",
        barColor: "bg-rose-500",
      };
    if (scaleScore < 70)
      return {
        label: "Moderate",
        color: "text-amber-600",
        barColor: "bg-amber-500",
      };
    return {
      label: "Effortless & Intuitive",
      color: "text-emerald-600",
      barColor: "bg-emerald-500",
    };
  }, [scaleScore]);

  const handleSubmit = () => {
    onSubmit?.({
      starRating,
      scaleScore,
      selectedTags,
      comment: comment.trim(),
    });
  };

  const handleClose = () => {
    onClose?.();
    onDismiss?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl font-sans max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Top-Right Close Button */}
        <div className="flex items-start justify-between gap-3 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-normal leading-normal mt-0.5">
                {merchantName ? `${merchantName} • ` : ""}
                {subtitle}
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {/* 1. Interactive 1-5 Star Rating */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 text-center space-y-1">
            <span className="text-xs font-medium text-slate-600 block">
              Overall Setup Rating
            </span>
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none bg-transparent border-0"
                >
                  <Star
                    className={
                      "w-6 h-6 transition-colors " +
                      (star <= activeStar
                        ? "fill-amber-400 text-amber-500"
                        : "text-slate-300 hover:text-slate-400")
                    }
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-slate-700 min-h-[16px]">
              {STAR_LABELS[activeStar] || "Select your rating"}
            </p>
          </div>

          {/* 2. Interactive Progress Bar Scaling */}
          <div className="bg-white border border-slate-200/70 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-slate-600">
                Setup Ease &amp; Satisfaction
              </span>
              <span className={`font-medium ${getScaleDescriptor.color}`}>
                {scaleScore}% • {getScaleDescriptor.label}
              </span>
            </div>

            {/* Custom interactive slider */}
            <div className="relative w-full">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scaleScore}
                onChange={(e) => setScaleScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
            </div>

            {/* Dynamic visual progress fill */}
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getScaleDescriptor.barColor}`}
                style={{ width: `${scaleScore}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-normal px-0.5">
              <span>0% (Complex)</span>
              <span>50% (Average)</span>
              <span>100% (Effortless)</span>
            </div>
          </div>

          {/* 3. Quick Sentiment Badges */}
          <div className="space-y-1.5">
            <span className="text-xs font-normal text-slate-600 block">
              What highlights stood out to you?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={
                      "text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer " +
                      (isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-normal")
                    }
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Comment Textarea */}
          <div className="space-y-1">
            <span className="text-xs font-normal text-slate-600 block">
              Additional Suggestions (Optional)
            </span>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what we can do better or what feature you'd love to see next..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none font-normal text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs font-normal text-slate-500 hover:text-slate-800 h-8 px-3 rounded-lg cursor-pointer"
          >
            Later
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 px-4 rounded-lg border-0 shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
