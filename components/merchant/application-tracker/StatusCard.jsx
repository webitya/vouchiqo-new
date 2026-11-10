"use client";

import { Building2, FileText, HelpCircle, MapPin } from "lucide-react";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * StatusCard — Clean application status card matching Shadcn & website design.
 */
export default function StatusCard({
  application = {},
  onViewDetails,
  onContactSupport,
}) {
  const {
    applicationId = "VQ-2026-89421",
    businessName = "Merchant Partner",
    category = "Retail Deals",
    city = "Ranchi",
    state = "Jharkhand",
    status = "under_review",
    submittedAt,
    estimatedCompletion = "Within 2-4 hours",
  } = application;

  const formatDate = (d) => {
    if (!d) return "Recently";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(d);
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden text-left font-sans">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between p-4 sm:p-5">
        <div>
          <CardTitle className="text-xs font-medium text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Application Summary
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5 font-normal">
            Real-time verification details for your merchant profile
          </CardDescription>
        </div>
        <StatusBadge status={status} size="sm" />
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Grid Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-normal text-slate-400 block">
              Application ID
            </span>
            <span className="font-medium text-blue-600 text-xs">
              #{applicationId}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-normal text-slate-400 block">
              Business Name
            </span>
            <span className="font-medium text-slate-900 truncate block">
              {businessName}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-normal text-slate-400 block">
              Submitted On
            </span>
            <span className="font-normal text-slate-700">
              {formatDate(submittedAt)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-normal text-slate-400 block">
              Est. Completion
            </span>
            <span className="font-normal text-blue-600">
              {estimatedCompletion}
            </span>
          </div>
        </div>

        {/* Category + Location Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-normal px-2.5 py-0.5 flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" /> {category}
          </Badge>
          {city && (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-normal px-2.5 py-0.5 flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> {city}, {state}
            </Badge>
          )}
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="text-xs font-normal rounded-lg cursor-pointer border-slate-200 shadow-none text-slate-800 hover:bg-slate-50"
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onContactSupport}
            className="text-xs font-normal text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
