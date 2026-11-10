"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Layers,
  ListOrdered,
  Megaphone,
  PieChart,
  Radio,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminFetchCampaignQueue,
  adminReviewCampaign,
} from "@/lib/api-helpers";
import AddOnsTab from "./components/AddOnsTab";
import AnalyticsRevenueTab from "./components/AnalyticsRevenueTab";
import CalendarTab from "./components/CalendarTab";
import LiveMonitoringTab from "./components/LiveMonitoringTab";
import QueueTab from "./components/QueueTab";

export default function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("queue");

  // Fetch real-time campaigns for admin
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      return await adminFetchCampaignQueue();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ campaignId, status, notes }) => {
      return await adminReviewCampaign(campaignId, {
        status,
        requestNotes: notes,
        adminNotes: notes,
      });
    },
    onSuccess: () => {
      toast.success("Campaign status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update campaign status.");
    },
  });

  const handleUpdateStatus = useCallback(
    (campaignId, status, notes) => {
      updateStatusMutation.mutate({ campaignId, status, notes });
    },
    [updateStatusMutation],
  );

  if (isLoading) {
    return (
      <DashboardLayout
        title="Admin Campaign Control Room"
        user={{ role: "admin" }}
      >
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const pendingCount = campaigns.filter(
    (c) => c.status === "pending_review" || c.status === "pending",
  ).length;

  return (
    <DashboardLayout
      title="Admin Campaign Control Room"
      user={{ role: "admin" }}
    >
      <div className="flex flex-col gap-6 text-left font-sans w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Rocket className="w-6 h-6 text-[#e85d04]" /> Admin Campaign
              Control Room
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Quality control, 4-point verification checklist, scheduling &amp;
              add-on activations.
            </p>
          </div>
          <Badge className="bg-[#e85d04] text-white font-bold text-xs px-3 py-1.5 border-0">
            {pendingCount} Pending Review
          </Badge>
        </div>

        {/* Master Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-slate-100/80 p-1.5 rounded-2xl h-auto gap-1">
            <TabsTrigger
              value="queue"
              className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-2xs cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5 mr-1 text-orange-600" />{" "}
              Review Queue
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" /> Calendar
              &amp; Schedule
            </TabsTrigger>
            <TabsTrigger
              value="addons"
              className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-2xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-600" /> Add-On
              Activations
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-2xs cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Live
              Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-xl text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-2xs cursor-pointer"
            >
              <PieChart className="w-3.5 h-3.5 mr-1 text-amber-600" /> Analytics
              &amp; Revenue
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="queue">
              <QueueTab
                campaigns={campaigns}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updateStatusMutation.isPending}
              />
            </TabsContent>
            <TabsContent value="calendar">
              <CalendarTab campaigns={campaigns} />
            </TabsContent>
            <TabsContent value="addons">
              <AddOnsTab />
            </TabsContent>
            <TabsContent value="live">
              <LiveMonitoringTab
                campaigns={campaigns}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updateStatusMutation.isPending}
              />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsRevenueTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
