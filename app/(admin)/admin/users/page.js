"use client";

import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  Ban,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/shared/data";
import ConfirmDeleteModal from "@/components/shared/modals/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAdminUsers,
  useDeleteAdminUser,
  useExportSubscribers,
  useToggleUserStatus,
} from "@/hooks/use-admin";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { cn } from "@/lib/utils";

// ── Skeleton components ───────────────────────────────────────────────────────

/** Single animated shimmer cell */
function SkeletonCell({ className = "" }) {
  return (
    <div
      className={cn(
        "h-3 rounded-md bg-slate-200 animate-pulse",
        className,
      )}
    />
  );
}

/** One skeleton table row matching the 7-column layout */
function SkeletonRow({ index }) {
  return (
    <tr
      className="border-b border-slate-100"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Customer & Email */}
      <td className="p-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 rounded-md bg-slate-200 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonCell className="w-28" />
            <SkeletonCell className="w-36 h-2" />
          </div>
        </div>
      </td>
      {/* Role */}
      <td className="p-3.5"><SkeletonCell className="w-16 h-4" /></td>
      {/* Savings & Claims */}
      <td className="p-3.5">
        <div className="space-y-1.5">
          <SkeletonCell className="w-20" />
          <SkeletonCell className="w-24 h-2" />
        </div>
      </td>
      {/* Registered */}
      <td className="p-3.5"><SkeletonCell className="w-20" /></td>
      {/* Newsletter */}
      <td className="p-3.5"><SkeletonCell className="w-16 h-4" /></td>
      {/* Status */}
      <td className="p-3.5"><SkeletonCell className="w-14 h-4" /></td>
      {/* Actions */}
      <td className="p-3.5">
        <div className="flex items-center justify-end gap-1">
          <div className="w-6.5 h-6.5 rounded-md bg-slate-200 animate-pulse" />
          <div className="w-6.5 h-6.5 rounded-md bg-slate-200 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

/** Full skeleton table — shown on initial load */
function SkeletonTable({ rows = 8 }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/60">
            {["Customer & Email", "Role", "Savings & Claims", "Registered", "Newsletter", "Status", "Action"].map((h) => (
              <th key={h} className="p-3.5 text-[10.5px] font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** KPI card skeleton */
function SkeletonKPICard() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-8 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

// ── Row colour themes ─────────────────────────────────────────────────────────

const ROW_COLOR_THEMES = [
  { row: "bg-blue-100/65 hover:bg-blue-100/90 border-l-[3.5px] border-l-blue-600 border-b border-blue-200/80 text-slate-900" },
  { row: "bg-emerald-100/65 hover:bg-emerald-100/90 border-l-[3.5px] border-l-emerald-600 border-b border-emerald-200/80 text-slate-900" },
  { row: "bg-amber-100/65 hover:bg-amber-100/90 border-l-[3.5px] border-l-amber-600 border-b border-amber-200/80 text-slate-900" },
  { row: "bg-purple-100/65 hover:bg-purple-100/90 border-l-[3.5px] border-l-purple-600 border-b border-purple-200/80 text-slate-900" },
  { row: "bg-indigo-100/65 hover:bg-indigo-100/90 border-l-[3.5px] border-l-indigo-600 border-b border-indigo-200/80 text-slate-900" },
  { row: "bg-rose-100/65 hover:bg-rose-100/90 border-l-[3.5px] border-l-rose-600 border-b border-rose-200/80 text-slate-900" },
  { row: "bg-teal-100/65 hover:bg-teal-100/90 border-l-[3.5px] border-l-teal-600 border-b border-teal-200/80 text-slate-900" },
  { row: "bg-orange-100/65 hover:bg-orange-100/90 border-l-[3.5px] border-l-orange-600 border-b border-orange-200/80 text-slate-900" },
];

// ── Page component ────────────────────────────────────────────────────────────

export default function UserManagement() {
  const queryClient = useQueryClient();

  // Real-time socket listeners
  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.users() });
  });
  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  });

  // ── Filter state ────────────────────────────────────────────────────────
  const [isActive, setIsActive] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [rawSearch, setRawSearch] = useState("");
  const [deleteAuthId, setDeleteAuthId] = useState(null);

  // useDeferredValue lets React keep the UI responsive during typing
  const search = useDeferredValue(rawSearch);

  // 400 ms server-side debounce — avoids firing a query on every keystroke
  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const handleSearchChange = (e) => {
    setRawSearch(e.target.value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setDebouncedSearch(e.target.value),
      400,
    );
  };

  // True while the user has typed something but the debounce hasn't fired yet
  const isTyping = rawSearch !== debouncedSearch;

  const filters = {
    role: "customer",
    isActive: activeTab === "active" ? "true" : activeTab === "suspended" ? "false" : isActive,
    search: debouncedSearch,
  };

  const {
    data: users = [],
    isFetching,
    isLoading,       // true only on the very first load (no cached data yet)
    refetch,
  } = useAdminUsers(filters);

  const { mutate: toggleStatus } = useToggleUserStatus();
  const { mutate: exportSubs, isPending: exporting } = useExportSubscribers();
  const deleteUserMutation = useDeleteAdminUser();

  // Combined loading indicator: typing debounce OR network request in flight
  const isSearchLoading = isTyping || isFetching;

  // ── Derived data ────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (activeTab === "subscribers") {
      return users.filter((u) => u.emailNotifications !== false);
    }
    return users;
  }, [users, activeTab]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const subscribers = users.filter((u) => u.emailNotifications !== false).length;
    const suspended = users.filter((u) => !u.isActive).length;
    return { total, active, subscribers, suspended };
  }, [users]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleDeleteUser = () => {
    if (!deleteAuthId) return;
    deleteUserMutation.mutate(deleteAuthId, {
      onSuccess: () => {
        setDeleteAuthId(null);
        refetch();
      },
    });
  };

  const handleExport = () => {
    exportSubs(undefined, {
      onSuccess: (subs) => {
        if (!subs?.length) return toast.error("No subscribers to export.");
        const headers = ["Name", "Email", "Date Joined"];
        const rows = subs.map(
          (s) =>
            `"${(s.name || "User").replace(/"/g, '""')}","${s.email || ""}","${
              s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"
            }"`,
        );
        const csv = `\uFEFF${[headers.join(","), ...rows].join("\n")}`;
        const url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        );
        const a = Object.assign(document.createElement("a"), {
          href: url,
          download: `vouchiqo_subscribers_${new Date().toISOString().split("T")[0]}.csv`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Subscriber CSV exported successfully!");
      },
    });
  };

  const getCustomerRowColor = (row, index) => {
    const theme = ROW_COLOR_THEMES[index % ROW_COLOR_THEMES.length];
    return cn("transition-all", theme.row);
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Customer & Email",
        sortable: true,
        cell: (user) => {
          const initials = (user.name || user.email || "CU")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
              <div className="w-6.5 h-6.5 rounded-md bg-white text-slate-800 border border-slate-300/90 flex items-center justify-center font-medium text-[10px] shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 text-[11.5px] leading-tight truncate">
                  {user.name || "Customer User"}
                </p>
                <p className="text-[9.5px] text-slate-600 font-normal truncate mt-0.5 leading-none">
                  {user.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role",
        cell: () => (
          <span className="px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border border-slate-300/90 shadow-2xs inline-block bg-white/95 text-slate-800">
            CUSTOMER
          </span>
        ),
      },
      {
        key: "activity",
        header: "Savings & Claims",
        cell: (user) => (
          <div className="flex flex-col text-xs py-0.5">
            <span className="font-medium text-emerald-800 text-[11px] leading-tight">
              ₹{user.totalSavings || 0} saved
            </span>
            <span className="text-[9.5px] text-slate-600 font-normal mt-0.5 leading-none">
              {user.couponsSaved || 0} claimed offers
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Registered",
        sortable: true,
        cell: (user) => (
          <span className="text-slate-600 font-normal text-[10.5px] whitespace-nowrap">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "emailNotifications",
        header: "Newsletter",
        cell: (user) => (
          <span
            className={`px-2 py-0.5 text-[9.5px] font-medium rounded-md border shadow-2xs inline-block ${
              user.emailNotifications !== false
                ? "bg-white/95 text-blue-700 border-blue-200"
                : "bg-white/95 text-slate-500 border-slate-200"
            }`}
          >
            {user.emailNotifications !== false ? "Subscribed" : "Opted-out"}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "Status",
        sortable: true,
        cell: (user) => (
          <span
            className={`px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider rounded-md border shadow-2xs inline-block ${
              user.isActive
                ? "bg-white/95 text-emerald-700 border-emerald-300"
                : "bg-white/95 text-rose-700 border-rose-300"
            }`}
          >
            {user.isActive ? "Active" : "Suspended"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "right",
        cell: (user) => (
          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleStatus({ authId: user.authId, isActive: user.isActive })
                  }
                  className={`h-6.5 w-6.5 p-0 flex items-center justify-center rounded-md cursor-pointer shadow-2xs transition-colors shrink-0 ${
                    user.isActive
                      ? "border-amber-200 text-amber-700 bg-white hover:bg-amber-50"
                      : "border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50"
                  }`}
                >
                  {user.isActive ? <Ban className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  <span className="sr-only">
                    {user.isActive ? "Suspend User" : "Activate User"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                {user.isActive ? "Suspend User Account" : "Activate User Account"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 w-6.5 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200 rounded-md cursor-pointer shadow-2xs transition-colors shrink-0"
                  onClick={() => setDeleteAuthId(user.authId || user._id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete User</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                Delete Customer Permanently
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [toggleStatus],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="User Management"
      user={{ name: "Platform Admin", role: "admin" }}
    >
      <TooltipProvider delayDuration={100}>
        <div className="space-y-3 font-sans w-full pb-12 text-left">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h1 className="text-base sm:text-lg font-medium tracking-tight text-slate-900">
                Customer User Directory
              </h1>
              <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
                Manage registered customer shopper accounts, savings, redemptions, and account access status.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="gap-1.5 h-7.5 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-2xs shrink-0"
              >
                {exporting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3 h-3" />
                )}
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* ── KPI Cards (skeleton on initial load) ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map((i) => <SkeletonKPICard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: "all",
                  label: "Total Customers",
                  value: stats.total,
                  color: "blue",
                  icon: <Users className="w-3.5 h-3.5" />,
                  active: activeTab === "all" && !isActive,
                  onClick: () => { setActiveTab("all"); setIsActive(""); },
                },
                {
                  id: "active",
                  label: "Active Shoppers",
                  value: stats.active,
                  color: "emerald",
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  active: activeTab === "active" || isActive === "true",
                  onClick: () => { setActiveTab("active"); setIsActive("true"); },
                },
                {
                  id: "subscribers",
                  label: "Subscribers",
                  value: stats.subscribers,
                  color: "purple",
                  icon: <Mail className="w-3.5 h-3.5" />,
                  active: activeTab === "subscribers",
                  onClick: () => { setActiveTab("subscribers"); setIsActive(""); },
                },
                {
                  id: "suspended",
                  label: "Suspended Accounts",
                  value: stats.suspended,
                  color: "rose",
                  icon: <Ban className="w-3.5 h-3.5" />,
                  active: activeTab === "suspended" || isActive === "false",
                  onClick: () => { setActiveTab("suspended"); setIsActive("false"); },
                },
              ].map((card) => (
                <Card
                  key={card.id}
                  onClick={card.onClick}
                  className={cn(
                    "rounded-xl border p-2.5 cursor-pointer transition-all duration-200 shadow-2xs font-sans",
                    card.active
                      ? `bg-${card.color}-50/70 border-${card.color}-300 ring-1 ring-${card.color}-300`
                      : "bg-white border-slate-200/80 hover:border-slate-300",
                  )}
                >
                  <CardContent className="p-0 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                        {card.label}
                      </span>
                      <span className={`text-base font-medium mt-0.5 block leading-none text-${card.color === "blue" ? "slate-900" : card.color + "-700"}`}>
                        {card.value}
                      </span>
                    </div>
                    <div className={`w-7 h-7 rounded-lg bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-200/60 flex items-center justify-center shrink-0`}>
                      {card.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Main Table Card ── */}
          <Card className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs font-sans overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-3">

              {/* Search input with inline spinner */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                {isSearchLoading ? (
                  <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 pointer-events-none animate-spin" />
                ) : (
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                )}
                <Input
                  placeholder="Search customer name or email…"
                  value={rawSearch}
                  onChange={handleSearchChange}
                  className={cn(
                    "pl-8 text-[11px] h-7.5 rounded-lg border-slate-200 bg-white transition-all duration-200",
                    isSearchLoading && "border-blue-300 ring-1 ring-blue-200",
                  )}
                />
              </div>

              {/* Status tabs + searching pill */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Searching status pill — visible while debounce is pending or fetch is in flight */}
                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 transition-all duration-300",
                    isSearchLoading && debouncedSearch
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 pointer-events-none -translate-y-1",
                  )}
                  aria-live="polite"
                  aria-label="Search in progress"
                >
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Searching…</span>
                </div>

                {/* Tab filters */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 select-none">
                  {[
                    { id: "all",         label: "All",         count: stats.total,       desc: "View all registered customer accounts" },
                    { id: "active",      label: "Active",      count: stats.active,      desc: "Filter to active shoppers with login access" },
                    { id: "subscribers", label: "Subscribers", count: stats.subscribers, desc: "Filter to customers subscribed to newsletter & emails" },
                    { id: "suspended",   label: "Suspended",   count: stats.suspended,   desc: "Filter to suspended or blocked accounts" },
                  ].map((tab) => (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === "all" || tab.id === "subscribers") setIsActive("");
                            else if (tab.id === "active") setIsActive("true");
                            else if (tab.id === "suspended") setIsActive("false");
                          }}
                          className={cn(
                            "text-[10.5px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 border-0",
                            activeTab === tab.id
                              ? "bg-white text-blue-600 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800 bg-transparent",
                          )}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={cn(
                              "text-[9px] px-1 rounded-full",
                              activeTab === tab.id
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-200/70 text-slate-600",
                            )}
                          >
                            {tab.count}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10.5px] font-normal py-1 px-2 bg-slate-900 text-white rounded-md shadow-md">
                        {tab.desc}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Table area ── */}
            {isLoading ? (
              // Initial full skeleton — no data cached yet
              <SkeletonTable rows={8} />
            ) : (
              <div className="w-full overflow-x-auto">
                {/* Skeleton overlay rows during search refetch */}
                {isFetching ? (
                  <SkeletonTable rows={5} />
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredUsers}
                    loading={false}
                    searchable={false}
                    defaultPageSize={15}
                    getRowClassName={getCustomerRowColor}
                    emptyState={
                      debouncedSearch || isActive
                        ? "No customer accounts match your current search."
                        : "No registered customer accounts found."
                    }
                  />
                )}
              </div>
            )}
          </Card>

          {/* ── Confirm Delete Modal ── */}
          <ConfirmDeleteModal
            open={!!deleteAuthId}
            onOpenChange={(open) => !open && setDeleteAuthId(null)}
            title="Delete Customer Account & All Data"
            description="This action cannot be undone. This will permanently delete the customer account, all claimed coupons, redemptions, and user credentials from the database."
            onConfirm={handleDeleteUser}
            isPending={deleteUserMutation.isPending}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}