import { Check, X, ArrowRight } from "lucide-react";
import MobileTableCard from "@/components/shared/data/MobileTableCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MerchantApprovalsTable({ merchants, onAction }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <Table className="w-full text-xs">
          <TableHeader className="bg-brand-surface border-b border-brand-border hover:bg-transparent">
            <TableRow className="hover:bg-transparent border-b border-brand-border">
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Brand Details
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Contact Info
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Registered Location
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                Submitted Date
              </TableHead>
              <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                Moderation Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
            {merchants.map((merchant) => (
              <TableRow
                key={merchant._id}
                className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
              >
                <TableCell className="p-4 h-auto">
                  <div className="flex flex-col">
                    <span className="font-bold text-brand-navy">
                      {merchant.businessName}
                    </span>
                    {merchant.website && (
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-brand-blue hover:underline font-bold mt-0.5"
                      >
                        {merchant.website
                          .replace("https://", "")
                          .replace("http://", "")}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-4 text-brand-text">
                  {merchant.contactEmail || "No email"}
                </TableCell>
                <TableCell className="p-4 text-brand-text">
                  {merchant.location
                    ? `${merchant.location.city || ""}, ${merchant.location.country || "IN"}`
                    : "IN"}
                </TableCell>
                <TableCell className="p-4 text-brand-subtext">
                  {merchant.createdAt
                    ? new Date(merchant.createdAt).toLocaleDateString()
                    : "Pending"}
                </TableCell>
                <TableCell className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="icon"
                      onClick={() => onAction(merchant._id, "approve")}
                      className="bg-brand-success/15 text-brand-success hover:bg-brand-success hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => onAction(merchant._id, "reject")}
                      className="bg-brand-error/15 text-brand-error hover:bg-brand-error hover:text-white border-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-none"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Reference Card Design */}
      <div className="md:hidden space-y-3 p-3 bg-slate-50/50 dark:bg-slate-950/20">
        {merchants.map((merchant) => (
          <MobileTableCard
            key={merchant._id}
            avatarText={merchant.businessName}
            avatarBg="bg-blue-600"
            badge="MERCHANT APPLICATION"
            title={merchant.businessName}
            subtitle={
              merchant.website
                ? merchant.website
                    .replace("https://", "")
                    .replace("http://", "")
                : "Partner Brand"
            }
            fields={[
              {
                label: "CONTACT",
                value: merchant.contactEmail || "No email",
              },
              {
                label: "LOCATION",
                value: merchant.location
                  ? `${merchant.location.city || ""}${merchant.location.country ? `, ${merchant.location.country}` : ""}`
                  : "India",
              },
              {
                label: "STATUS",
                value: "Pending Review",
                isStatus: true,
                statusType: "pending",
              },
              {
                label: "SUBMITTED",
                value: merchant.createdAt
                  ? new Date(merchant.createdAt).toLocaleDateString()
                  : "Pending",
              },
            ]}
            actions={
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onAction(merchant._id, "reject")}
                  className="w-24 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer select-none"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onAction(merchant._id, "approve")}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl py-2.5 px-4 flex items-center justify-between text-xs transition-colors cursor-pointer select-none"
                >
                  <span>Approve Brand</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
