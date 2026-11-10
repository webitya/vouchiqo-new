"use client";

import {
  Baby,
  Car,
  Check,
  ChevronRight,
  Dumbbell,
  Gamepad2,
  Gem,
  GraduationCap,
  Heart,
  Home,
  Plane,
  Shirt,
  ShoppingCart,
  Smartphone,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// 15 Standard Brand Categories with prominent Lucide icons & color accents
const CATEGORIES = [
  {
    key: "fashion",
    label: "Fashion & Clothing",
    icon: Shirt,
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    key: "food",
    label: "Food & Dining",
    icon: UtensilsCrossed,
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    key: "electronics",
    label: "Electronics & Tech",
    icon: Smartphone,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    key: "beauty",
    label: "Beauty & Wellness",
    icon: Heart,
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    key: "travel",
    label: "Travel & Hotels",
    icon: Plane,
    color: "bg-sky-50 text-sky-600 border-sky-100",
  },
  {
    key: "home",
    label: "Home & Living",
    icon: Home,
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    key: "home-improvement",
    label: "Home Improvement",
    icon: Wrench,
    color: "bg-stone-50 text-stone-600 border-stone-100",
  },
  {
    key: "fitness",
    label: "Fitness & Healthcare",
    icon: Dumbbell,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    key: "education",
    label: "Education & Courses",
    icon: GraduationCap,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    key: "kids-baby",
    label: "Kids & Baby Products",
    icon: Baby,
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    key: "jewellery",
    label: "Jewellery & Gems",
    icon: Gem,
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
  {
    key: "automotive",
    label: "Automobile & Services",
    icon: Car,
    color: "bg-red-50 text-red-600 border-red-100",
  },
  {
    key: "entertainment",
    label: "Gaming & Fun",
    icon: Gamepad2,
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    key: "grocery",
    label: "Grocery & Essentials",
    icon: ShoppingCart,
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    key: "finance",
    label: "Finance & Insurance",
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onSaveComplete,
  initialGender = "",
  initialInterests = [],
}) {
  const [gender, setGender] = useState(initialGender);
  const [selectedInterests, setSelectedInterests] = useState(initialInterests);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialGender) setGender(initialGender);
    if (initialInterests && initialInterests.length > 0) {
      setSelectedInterests(initialInterests);
    }
  }, [initialGender, initialInterests]);

  const toggleInterest = (key) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    if (!gender) {
      return toast.error("Please select a gender preference to continue.");
    }
    if (selectedInterests.length < 3) {
      return toast.error(
        "Please select three or more category interests to proceed.",
      );
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          interests: selectedInterests,
          isOnboarded: true,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(
          payload.message || "Failed to save onboarding settings",
        );
      }

      toast.success("Preferences saved successfully!");
      if (onSaveComplete) {
        onSaveComplete(selectedInterests);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isContinueEnabled = gender && selectedInterests.length >= 3;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-1.5rem)] sm:max-w-[540px] md:max-w-[620px] lg:max-w-[700px] border border-slate-200 bg-white p-4 sm:p-5 rounded-2xl shadow-xl overflow-y-auto max-h-[92vh] transition-all outline-none text-left font-sans z-[350]"
      >
        {/* Header with Welcome Message */}
        <DialogHeader className="space-y-1 text-center pb-1">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Welcome to Vouchiqo!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-normal max-w-md mx-auto leading-tight">
            Welcome to Vouchiqo! Select your shopping preferences to discover
            customized discounts &amp; regional deals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Section 1: Shopping Preference (Gender) using Lucide Icons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                1. WHO ARE YOU SHOPPING FOR? *
              </Label>
              {gender && (
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-medium">
                  Selected
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: "men",
                  label: "Men",
                  icon: User,
                  iconColor: "text-blue-600",
                },
                {
                  value: "women",
                  label: "Women",
                  icon: Heart,
                  iconColor: "text-pink-600",
                },
                {
                  value: "not_preferred",
                  label: "Everyone",
                  icon: Users,
                  iconColor: "text-amber-600",
                },
              ].map((item) => {
                const isSelected = gender === item.value;
                const GenderIcon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGender(item.value)}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-semibold h-10 gap-2 select-none active:scale-[0.98] ${
                      isSelected
                        ? "bg-orange-50/70 border-[#e85d04] text-[#e85d04] shadow-2xs ring-1 ring-[#e85d04]/30"
                        : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <GenderIcon
                      className={`w-3.5 h-3.5 ${isSelected ? "text-[#e85d04]" : item.iconColor}`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Interest Categories Compact Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  2. SELECT YOUR FAVORITE CATEGORIES *
                </Label>
                <p className="text-[10px] text-slate-500 font-normal">
                  Pick at least 3 categories to build your feed (
                  {selectedInterests.length} selected)
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-medium text-slate-600 bg-slate-50 border-slate-200"
              >
                Min 3 Required
              </Badge>
            </div>

            {/* Compact Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedInterests.includes(cat.key);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleInterest(cat.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left active:scale-[0.97] ${
                      isSelected
                        ? "bg-orange-50/70 border-[#e85d04] text-slate-900 ring-1 ring-[#e85d04]/40 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${cat.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-semibold whitespace-normal leading-snug flex-1">
                      {cat.label}
                    </span>

                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#e85d04] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isContinueEnabled || isSaving}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border-0 cursor-pointer transition-all h-9.5 ${
              isContinueEnabled
                ? "bg-[#e85d04] hover:bg-orange-600 text-white shadow-2xs active:scale-[0.99]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? "Saving Preferences..." : "Continue to Customized Feed"}
            {!isSaving && <ChevronRight className="w-3.5 h-3.5 ml-0.5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
