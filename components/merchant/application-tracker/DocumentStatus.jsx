"use client";

import { CheckCircle2, Clock, FileCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * DocumentStatus — verification status grid for uploaded documents using black, blue, and white.
 */
export default function DocumentStatus({ documents = [] }) {
  if (documents.length === 0) return null;

  const getDocBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-normal gap-1 px-2 py-0.5 shadow-none">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-normal gap-1 px-2 py-0.5 shadow-none">
            <XCircle className="w-3 h-3 text-red-600" /> Needs Action
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-normal gap-1 px-2 py-0.5 shadow-none">
            <Clock className="w-3 h-3 text-slate-500" /> Under Audit
          </Badge>
        );
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden text-left font-sans">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between p-4 sm:p-5">
        <CardTitle className="text-xs font-medium tracking-normal text-slate-900 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" /> Submitted Documents
        </CardTitle>
        <span className="text-xs text-slate-500 font-normal">
          {documents.filter((d) => d.status === "verified").length}/
          {documents.length} Verified
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors",
                doc.status === "verified"
                  ? "border-blue-200 bg-blue-50/20"
                  : doc.status === "rejected"
                    ? "border-red-200 bg-red-50/20"
                    : "border-slate-200 bg-slate-50/40",
              )}
            >
              <div className="space-y-0.5 min-w-0">
                <span className="font-medium text-slate-900 truncate block">
                  {doc.name}
                </span>
                {doc.type && (
                  <span className="text-[10px] text-slate-500 block font-normal">
                    {doc.type}
                  </span>
                )}
              </div>

              <div className="shrink-0">{getDocBadge(doc.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
