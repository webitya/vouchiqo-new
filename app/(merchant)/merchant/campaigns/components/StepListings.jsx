import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StepListings({
  coupons,
  loadingCoupons,
  selectedIds,
  onToggle,
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
        Step 2: Attach active coupon listings
      </h4>
      <p className="text-xs text-brand-subtext font-semibold">
        Select one or more active discount listings to group under this
        campaign.
      </p>

      <div className="border border-brand-border rounded-lg overflow-hidden bg-brand-surface">
        <Table className="w-full text-xs">
          <TableHeader className="bg-slate-50 border-b border-brand-border">
            <TableRow>
              <TableHead className="w-12 p-3 text-center">Select</TableHead>
              <TableHead className="p-3">Title</TableHead>
              <TableHead className="p-3">Promo Code</TableHead>
              <TableHead className="p-3">Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCoupons ? (
              <TableRow>
                <TableCell colSpan={4} className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-subtext mx-auto" />
                </TableCell>
              </TableRow>
            ) : coupons.length > 0 ? (
              coupons.map((c) => (
                <TableRow
                  key={c._id}
                  className="hover:bg-slate-100/50 border-b border-brand-border"
                >
                  <TableCell className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c._id)}
                      onChange={() => onToggle(c._id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="p-3 font-bold text-brand-navy">
                    {c.title}
                  </TableCell>
                  <TableCell className="p-3 font-mono uppercase">
                    {c.code}
                  </TableCell>
                  <TableCell className="p-3">
                    {new Date(c.expiresAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="p-8 text-center text-brand-subtext"
                >
                  No active listings found. Please create a coupon listing
                  first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
