import { Calendar, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CampaignList({ campaigns, onCreateClick }) {
  return (
    <div className="space-y-6">
      {/* Header Title with Button */}
      <div className="flex justify-between items-center bg-brand-bg border border-brand-border p-5 rounded-xl shadow-sm">
        <div>
          <h3 className="font-heading text-base font-bold text-brand-navy">
            Campaign Management
          </h3>
          <p className="text-xs text-brand-subtext mt-0.5 font-semibold">
            Launch flash events, Diwali festivals, or clearance sales. Attach
            existing coupons to aggregate views.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 border-0 h-auto cursor-pointer shadow-none font-bold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* List Table */}
      <div className="bg-brand-bg border border-brand-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-brand-navy tracking-tight uppercase">
            Active promotional campaigns
          </h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <Table className="w-full text-xs">
            <TableHeader className="bg-slate-50 border-b border-brand-border hover:bg-transparent">
              <TableRow className="hover:bg-transparent">
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Campaign Title
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Campaign Type
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Coupons Attached
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider h-auto">
                  Schedule Period
                </TableHead>
                <TableHead className="p-4 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
              {campaigns.length > 0 ? (
                campaigns.map((c) => (
                  <TableRow
                    key={c._id}
                    className="hover:bg-brand-surface/40 transition-colors border-b border-brand-border last:border-b-0"
                  >
                    <TableCell className="p-4 font-bold text-brand-navy h-auto">
                      {c.name}
                    </TableCell>
                    <TableCell className="p-4 capitalize">
                      {c.type} Sale
                    </TableCell>
                    <TableCell className="p-4">
                      {c.couponIds?.length || 0} coupons
                    </TableCell>
                    <TableCell className="p-4 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                      <span>
                        {c.startDate
                          ? new Date(c.startDate).toLocaleDateString()
                          : "Immediate"}{" "}
                        -{" "}
                        {c.endDate
                          ? new Date(c.endDate).toLocaleDateString()
                          : "Unlimited"}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <Badge
                        className={`rounded-full border-0 font-bold text-[10px] py-0.5 px-2 hover:bg-transparent shadow-none ${
                          c.status === "live"
                            ? "bg-brand-success/10 text-brand-success"
                            : c.status === "scheduled"
                              ? "bg-brand-warning/10 text-brand-warning"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-10 text-center text-brand-subtext"
                  >
                    No promotional campaigns configured yet. Click "+ Create
                    Campaign" above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
