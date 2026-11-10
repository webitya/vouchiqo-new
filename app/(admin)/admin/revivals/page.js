"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/shared/data/DataTable";
import FormSelect from "@/components/shared/form/FormSelect";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRealtime } from "@/hooks/use-realtime";
import { apiFetch } from "@/lib/fetcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";

import { getRevivalColumns } from "./components/RevivalTableColumns";
import WinBackModal from "./components/WinBackModal";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending Audit" },
  { value: "approved", label: "Approved & Live" },
  { value: "rejected", label: "Rejected" },
];

export default function RevivalManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRevival, setSelectedRevival] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch live revival data from backend API
  const {
    data: responseData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-revivals", statusFilter],
    queryFn: async () => {
      const url =
        statusFilter === "all"
          ? "/api/revivals"
          : `/api/revivals?status=${statusFilter}`;
      const json = await apiFetch(url);
      return json.data || { revivals: [] };
    },
  });

  const revivals = responseData?.revivals || [];

  // Listen for real-time revival submissions via Socket.IO
  useRealtime(SOCKET_EVENTS.REVIVAL_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-revivals"] });
  });

  const handleReviewClick = useCallback((row) => {
    setSelectedRevival(row);
    setModalOpen(true);
  }, []);

  const columns = useMemo(
    () => getRevivalColumns({ onReviewClick: handleReviewClick }),
    [handleReviewClick],
  );

  const filterActions = (
    <FormSelect
      value={statusFilter}
      onValueChange={setStatusFilter}
      placeholder="Status Filter"
      options={STATUS_OPTIONS}
      triggerClassName="w-44 h-8 text-xs bg-white border-slate-200 shadow-2xs font-semibold"
    />
  );

  return (
    <DashboardLayout
      title="Master Revival Queue & Intelligence"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full pb-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" /> Master Revival
              Queue &amp; Intelligence
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Live expired coupon revival requests, merchant outreach &amp;
              audit workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LiveIndicator />
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-8 px-3 rounded-lg cursor-pointer shadow-2xs"
            >
              <Link href="/admin/merchant-demand">
                Merchant Demand Report →
              </Link>
            </Button>
          </div>
        </div>

        {/* Master Submissions Queue Table using Reusable DataTable */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 overflow-hidden text-left">
          <DataTable
            columns={columns}
            data={revivals}
            loading={isLoading}
            searchable={true}
            searchPlaceholder="Search revival requests by merchant name, title..."
            rightActions={filterActions}
            defaultPageSize={10}
            emptyState="No revival requests found."
          />
        </Card>
      </div>

      {/* Review Modal Chunk */}
      <WinBackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        revival={selectedRevival}
        onStatusUpdated={() => refetch()}
      />
    </DashboardLayout>
  );
}
