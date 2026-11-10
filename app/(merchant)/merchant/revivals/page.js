"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Gift, X } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import StatusBadge from "@/components/shared/data/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/fetcher";
import { showError, showSuccess } from "@/lib/toast";

import {
  AlternativeModal,
  DeclineModal,
} from "./components/RevivalResolutionDialogs";

export default function MerchantRevivals() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [alternativeModalOpen, setAlternativeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: merchant } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const res = await apiFetch("/api/merchants/me");
      return res.data;
    },
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["merchant-revival-requests", merchant?._id],
    queryFn: async () => {
      const res = await apiFetch("/api/merchant/revivals");
      return res.data?.revivals || [];
    },
    enabled: !!merchant?.businessName,
  });

  const { data: activeCoupons = [] } = useQuery({
    queryKey: ["merchant-active-coupons", merchant?._id],
    queryFn: async () => {
      if (!merchant?._id) return [];
      const res = await apiFetch(`/api/coupons?merchantId=${merchant._id}`);
      return res.data?.coupons || [];
    },
    enabled: !!merchant?._id,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ revivalId, outcomeStatus, payload = {} }) => {
      return apiFetch("/api/merchant/revivals/resolve", {
        method: "POST",
        body: JSON.stringify({ revivalId, outcomeStatus, ...payload }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["merchant-revival-requests"]);
      setDeclineModalOpen(false);
      setAlternativeModalOpen(false);
      setSelectedRequest(null);
      setDeclineReason("");
      showSuccess("Revival request resolved successfully!");
    },
    onError: () => showError("Failed to resolve request."),
  });

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "pending")
      return !r.outcomeStatus || r.outcomeStatus === "pending";
    if (activeTab === "resolved")
      return r.outcomeStatus && r.outcomeStatus !== "pending";
    return true;
  });

  const columns = [
    {
      key: "couponTitle",
      header: "Offer & Code",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.couponTitle || "Expired Offer"}
          </span>
          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
            {row.couponCode || "REVIVAL"}
          </span>
        </div>
      ),
    },
    {
      key: "customerEmail",
      header: "Customer",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {row.customerEmail || "Anonymous"}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Customer Request Note",
      cell: (row) => (
        <span className="text-slate-600 italic text-xs truncate max-w-[200px] block">
          {row.reason || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Requested Date",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(row.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      key: "outcomeStatus",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.outcomeStatus || "pending"} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Resolution Actions",
      cell: (row) => {
        const isResolved = row.outcomeStatus && row.outcomeStatus !== "pending";
        if (isResolved)
          return (
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Completed
            </span>
          );

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              onClick={() =>
                resolveMutation.mutate({
                  revivalId: row._id,
                  outcomeStatus: "resolved_regenerated",
                })
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg h-7 px-2.5 gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" /> Re-Issue
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedRequest(row);
                setAlternativeModalOpen(true);
              }}
              className="text-[10px] font-bold rounded-lg border-slate-200 h-7 px-2.5 gap-1 cursor-pointer"
            >
              <Gift className="w-3 h-3 text-blue-600" /> Alt Deal
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedRequest(row);
                setDeclineModalOpen(true);
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold rounded-lg h-7 px-2.5 gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Decline
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      title="Expired Coupon Revivals"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Expired Coupon Revivals
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review customer requests to regenerate or substitute expired
              promotion codes.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="text-xs font-bold rounded-lg py-1 px-3"
              >
                All ({requests.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="text-xs font-bold rounded-lg py-1 px-3"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="text-xs font-bold rounded-lg py-1 px-3"
              >
                Resolved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 text-left">
          <DataTable
            columns={columns}
            data={filteredRequests}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Search revival requests by title, email..."
            defaultPageSize={10}
            emptyState="No revival requests found matching current filter."
          />
        </Card>
      </div>

      <DeclineModal
        open={declineModalOpen}
        onOpenChange={setDeclineModalOpen}
        selectedRequest={selectedRequest}
        declineReason={declineReason}
        setDeclineReason={setDeclineReason}
        onSubmit={() =>
          resolveMutation.mutate({
            revivalId: selectedRequest._id,
            outcomeStatus: "declined",
            payload: { declineReason },
          })
        }
        isPending={resolveMutation.isPending}
      />

      <AlternativeModal
        open={alternativeModalOpen}
        onOpenChange={setAlternativeModalOpen}
        selectedRequest={selectedRequest}
        activeCoupons={activeCoupons}
        onSelectAlternative={(altId) =>
          resolveMutation.mutate({
            revivalId: selectedRequest._id,
            outcomeStatus: "resolved_alternative",
            payload: { alternativeOfferId: altId },
          })
        }
        isPending={resolveMutation.isPending}
      />
    </DashboardLayout>
  );
}
