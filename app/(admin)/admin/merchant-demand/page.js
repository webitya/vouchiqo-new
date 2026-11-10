"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, MessageSquare, PhoneCall } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import FormSelect from "@/components/shared/form/FormSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/fetcher";
import { showError, showSuccess } from "@/lib/toast";

export default function MerchantDemandReport() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");

  const [selectedLead, setSelectedLead] = useState(null);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-demand", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await apiFetch(
        `/api/admin/merchant-demand?${params.toString()}`,
      );
      return res.data;
    },
  });

  const leads = data?.demands || [];

  const updateMutation = useMutation({
    mutationFn: async ({ demandId, payload }) => {
      return apiFetch("/api/admin/merchant-demand", {
        method: "PUT",
        body: JSON.stringify({ demandId, ...payload }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["merchant-demand"]);
      setOutreachModalOpen(false);
      setSelectedLead(null);
      showSuccess("Lead outreach status updated!");
    },
    onError: () => showError("Failed to update lead."),
  });

  const openOutreachModal = (lead) => {
    setSelectedLead(lead);
    const count = lead.submissionCount || 1;
    const template =
      lead.status === "previously_listed"
        ? `Hi ${lead.businessName || "Partner"}, we've received ${count} customer request(s) requesting your expired offers on Vouchiqo. We'd love to win you back!`
        : `Hi ${lead.businessName || "Merchant"}, we've noticed high customer demand for your brand in ${lead.city || "Ranchi"} with ${count} requests. Let's get you listed on Vouchiqo!`;
    setMessageText(template);
    setOutreachModalOpen(true);
  };

  const columns = [
    {
      key: "businessName",
      header: "Brand Name",
      sortable: true,
      cell: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {r.businessName}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {r.city || "Ranchi"}, {r.state || "Jharkhand"}
          </span>
        </div>
      ),
    },
    {
      key: "submissionCount",
      header: "Customer Demand",
      sortable: true,
      cell: (r) => (
        <span className="font-bold text-[#e85d04]">
          {r.submissionCount || 1} Customer Requests
        </span>
      ),
    },
    {
      key: "status",
      header: "Listing History",
      cell: (r) => (
        <StatusBadge
          status={r.status === "never_listed" ? "new" : "approved"}
          size="sm"
        />
      ),
    },
    {
      key: "outreachStatus",
      header: "Outreach Status",
      cell: (r) => (
        <StatusBadge status={r.outreachStatus || "not_contacted"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            onClick={() => openOutreachModal(r)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg h-7 px-2.5 gap-1 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Contact Lead
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateMutation.mutate({
                demandId: r._id,
                payload: { outreachStatus: "contacted" },
              })
            }
            className="text-[10px] font-bold rounded-lg border-slate-200 h-7 px-2.5 gap-1 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Mark
            Contacted
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Merchant Demand Report"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> High-Demand Merchant
            Lead Generation
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Aggregated unlisted &amp; churned merchant leads submitted by
            customers via expired offer revivals.
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left">
          <DataTable
            columns={columns}
            data={leads}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Search merchant leads by brand name, city..."
            searchKeys={["businessName", "city", "state"]}
            rightActions={
              <FormSelect
                value={status}
                onValueChange={setStatus}
                options={[
                  { value: "all", label: "All Demand Leads" },
                  { value: "never_listed", label: "Never Listed (Unclaimed)" },
                  {
                    value: "previously_listed",
                    label: "Previously Listed (Churned)",
                  },
                ]}
                triggerClassName="w-48 bg-white h-8 text-xs border-slate-200 font-medium"
              />
            }
            defaultPageSize={10}
            emptyState="No merchant demand leads found."
          />
        </Card>
      </div>

      <Dialog open={outreachModalOpen} onOpenChange={setOutreachModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-left shadow-xl">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Lead Outreach
              Template
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold">
              Send outreach notice to {selectedLead?.businessName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="text-xs bg-slate-50 border-slate-200 rounded-xl min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOutreachModalOpen(false)}
                className="text-xs font-bold border-slate-200 rounded-xl h-9 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedLead?._id) return;
                  updateMutation.mutate({
                    demandId: selectedLead._id,
                    payload: { outreachStatus: "contacted" },
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-9 px-5 cursor-pointer"
              >
                Send &amp; Log Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
