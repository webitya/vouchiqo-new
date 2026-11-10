"use client";

import { Download, Eye, FileText, CheckCircle2, Receipt, Calendar, CreditCard, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/shared/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showSuccess } from "@/lib/toast";

export default function BillingHistoryTable({ invoices = [] }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const columns = [
    {
      key: "id",
      header: "Invoice ID",
      cell: (r) => (
        <span className="font-mono text-xs font-medium text-slate-700">
          {r.id}
        </span>
      ),
    },
    {
      key: "period",
      header: "Date & Period",
      sortable: true,
      cell: (r) => (
        <span className="text-xs text-slate-600 font-normal">
          {r.period || "Aug 2026"}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Package / Add-On",
      cell: (r) => (
        <span className="text-xs font-medium text-slate-800">{r.plan}</span>
      ),
    },
    {
      key: "gstBreakdown",
      header: "Base + 18% GST Breakdown",
      cell: (r) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-600 font-normal">
            Base: {r.basePrice || r.amount}
          </span>
          <span className="text-blue-600 font-normal text-[11px]">
            + 18% GST: {r.gstBreakdown || "Included"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Total Amount Paid",
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-900 text-xs">{r.amount}</span>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 text-[10px] font-medium py-0 px-1.5 shadow-none">
            {r.status || "Paid"}
          </Badge>
        </div>
      ),
    },
    {
      key: "gstInvoice",
      header: "GSTIN Invoice",
      cell: (r) =>
        r.gstInvoice?.startsWith("GSTIN-") ? (
          <span className="font-mono text-[10px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
            {r.gstInvoice}
          </span>
        ) : (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-400 border-slate-200/60 text-[10px] font-normal shadow-none"
          >
            N/A (B2C Receipt)
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedInvoice(r)}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 h-7 px-2 rounded-lg cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" /> View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              showSuccess(`Downloading ${r.id} Official GST Tax Invoice PDF…`)
            }
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 px-2 rounded-lg cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden text-left font-sans">
      <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-sans text-xs font-semibold text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <span>Invoice &amp; Billing History (Live Transactions)</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Download official GST tax invoices with itemized 18% GST breakdown
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            showSuccess("Downloading all GST tax invoices in a ZIP archive…")
          }
          className="text-xs h-8 py-1 px-3 font-medium rounded-lg border-slate-200 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-none text-slate-700 hover:bg-slate-50"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          Download Invoices
        </Button>
      </div>

      <div className="p-3">
        <DataTable
          columns={columns}
          data={invoices}
          searchable={false}
          defaultPageSize={10}
        />
      </div>

      {/* Sleek Compact Invoice Details Modal */}
      <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md w-full bg-white p-5 rounded-xl border border-slate-200 text-left font-sans shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <DialogTitle className="text-sm font-semibold text-slate-800">
                  Tax Invoice Details
                </DialogTitle>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                Payment Completed
              </Badge>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-3.5 py-1 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-normal">Invoice Number:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-normal">Billing Period / Date:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.period || "Aug 2026"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-normal">Purchased Item:</span>
                  <span className="font-medium text-slate-900">{selectedInvoice.plan}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Itemized GST Breakdown</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-normal">Base Amount:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.basePrice || selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-normal">CGST (9%):</span>
                  <span className="font-medium text-slate-800">Calculated</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-normal">SGST (9%):</span>
                  <span className="font-medium text-slate-800">Calculated</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100 font-semibold text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-sm font-semibold text-blue-600">{selectedInvoice.amount}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Payment Method &amp; Tax Info</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-normal">Payment Method:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" /> Razorpay Direct / UPI
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-normal">GSTIN Status:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.gstInvoice || "B2C Receipt"}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="h-8 text-xs font-medium rounded-lg text-slate-600 border-slate-200"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    showSuccess(`Downloading ${selectedInvoice.id} Official Tax Invoice PDF…`);
                    setSelectedInvoice(null);
                  }}
                  className="h-8 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <FileText className="w-3.5 h-3.5" /> Download Tax Invoice PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
