"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import MobileTableCard from "./MobileTableCard";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 150, 200];

/* ─────────────────────────────────────────────────────────────────────────────
 * MobileLoadingCards — sleek card skeletons for mobile view during data load
 * ───────────────────────────────────────────────────────────────────────────── */
function MobileLoadingCards() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`mob-loading-${i}`}
          className="rounded-2xl border border-slate-200/90 p-3.5 space-y-2.5 bg-white shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0 bg-slate-200" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 rounded bg-slate-200" />
              <Skeleton className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-md bg-slate-100" />
            <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DataTable — a full-featured, responsive data table with integrated loading states.
 *
 * Column definition:
 * @typedef {{ key: string, header: string, sortable?: boolean, width?: string, cell?: (row) => React.ReactNode }} Column
 *
 * @param {Column[]}          columns            - column definitions
 * @param {object[]}          data               - array of row data objects
 * @param {boolean}           [loading=false]    - full initial loading state (skeleton + spinner overlay)
 * @param {boolean}           [refetching=false] - background re-fetch (lighter overlay, data still visible)
 * @param {boolean}           [searchable=true]  - show internal search bar
 * @param {boolean}           [externalSearch=false] - skip internal search (parent controls filtering)
 * @param {string}            [searchPlaceholder="Search..."]
 * @param {string[]}          [searchKeys]       - which keys to search (defaults to all non-function columns)
 * @param {string}            [loadingMessage]   - custom loading message
 * @param {number}            [defaultPageSize=10]
 * @param {React.ReactNode}   [emptyState]       - custom empty state node
 * @param {string}            [className]
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  refetching = false,
  searchable = true,
  externalSearch = false,
  searchPlaceholder = "Search…",
  searchKeys,
  loadingMessage = "Loading data…",
  defaultPageSize = 10,
  emptyState,
  rightActions,
  getRowClassName,
  className,
  renderMobileCard,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const resolvedSearchKeys = useMemo(
    () =>
      searchKeys ??
      columns
        .filter((c) => !c.cell || typeof c.cell !== "function")
        .map((c) => c.key),
    [searchKeys, columns],
  );

  // Internal filtering — skipped when externalSearch=true (parent manages it)
  const filtered = useMemo(() => {
    if (externalSearch || !search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      resolvedSearchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, search, resolvedSearchKeys, externalSearch]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Decide which rows count badge to show
  const showResultCount = searchable && !loading && !externalSearch;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      {(searchable || rightActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {searchable ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-subtext pointer-events-none" />
                <Input
                  value={search}
                  onChange={handleSearch}
                  placeholder={searchPlaceholder}
                  disabled={loading}
                  className="pl-8 h-8 text-xs border-brand-border bg-brand-bg text-brand-text placeholder:text-brand-subtext/60 disabled:opacity-50"
                />
              </div>
              {showResultCount && (
                <span className="text-xs text-brand-subtext shrink-0">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {rightActions && (
            <div className="flex items-center gap-2 shrink-0">{rightActions}</div>
          )}
        </div>
      )}

      {/* ── Desktop Table ───────────────────────────────────────────────────── */}
      <div className="hidden md:block rounded-lg border border-brand-border overflow-hidden">
        {/* Relative wrapper so the overlay can be absolute-positioned */}
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-surface border-brand-border hover:bg-brand-surface">
                {columns.map((col, colIdx) => {
                  const dataKey = col.key || col.accessorKey;
                  return (
                    <TableHead
                      key={colIdx}
                      style={col.width ? { width: col.width } : undefined}
                      className={cn(
                        "text-[10px] font-medium text-slate-500 uppercase tracking-wider py-2 px-2.5",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                      )}
                    >
                      {col.sortable && dataKey ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(dataKey)}
                          className={cn(
                            "flex items-center gap-1 hover:text-brand-text transition-colors cursor-pointer",
                            col.align === "center" && "justify-center mx-auto",
                            col.align === "right" && "justify-end ml-auto",
                          )}
                        >
                          {col.header}
                          <ArrowUpDown
                            className={cn(
                              "w-3 h-3",
                              sortKey === dataKey ? "text-brand-blue" : "text-brand-border",
                            )}
                          />
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                /* Pure skeleton table rows — no rounded spinners */
                Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="border-b border-slate-100 hover:bg-transparent">
                    {columns.map((col, c) => (
                      <TableCell
                        key={c}
                        className={cn(
                          "py-3 px-3",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {c === 0 ? (
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="w-7 h-7 rounded-md shrink-0 bg-slate-200" />
                            <div className="space-y-1 flex-1 min-w-0">
                              <Skeleton
                                className={cn(
                                  "h-3.5 rounded bg-slate-200",
                                  i % 2 === 0 ? "w-36" : "w-28",
                                )}
                              />
                              <Skeleton className="h-2.5 w-20 rounded bg-slate-100" />
                            </div>
                          </div>
                        ) : c === columns.length - 1 ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <Skeleton className="h-7 w-7 rounded-lg bg-slate-100" />
                            <Skeleton className="h-7 w-7 rounded-lg bg-slate-100" />
                          </div>
                        ) : (
                          <Skeleton
                            className={cn(
                              "h-5 rounded-md bg-slate-100",
                              c === 1 ? "w-20" : c === 2 ? "w-16" : "w-24",
                            )}
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : refetching ? (
                /* Background re-fetch — subtle top shimmer line without circular spinner */
                <>
                  <TableRow className="border-0">
                    <TableCell colSpan={columns.length} className="p-0 border-0">
                      <div className="h-0.5 w-full bg-blue-500 animate-pulse" />
                    </TableCell>
                  </TableRow>
                  {paged.map((row, rowIndex) => {
                    const customRowClass = getRowClassName ? getRowClassName(row, rowIndex) : "";
                    return (
                      <TableRow
                        key={row.id ?? row._id ?? `row-${rowIndex}`}
                        className={cn(
                          "border-brand-border transition-colors opacity-60",
                          customRowClass || "hover:bg-brand-surface/60",
                        )}
                      >
                        {columns.map((col, colIdx) => {
                          const dataKey = col.key || col.accessorKey;
                          return (
                            <TableCell
                              key={colIdx}
                              className={cn(
                                "py-2 px-2.5 text-xs text-brand-text",
                                col.align === "center" && "text-center",
                                col.align === "right" && "text-right",
                              )}
                            >
                              {col.cell ? col.cell(row) : (row[dataKey] ?? "—")}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-14 text-center"
                  >
                    {emptyState ? (
                      typeof emptyState === "string" ? (
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-slate-300" />
                          <p className="text-xs font-medium text-slate-400">
                            {emptyState}
                          </p>
                        </div>
                      ) : (
                        emptyState
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-medium text-slate-400">
                          No results found.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row, rowIndex) => {
                  const customRowClass = getRowClassName ? getRowClassName(row, rowIndex) : "";
                  return (
                    <TableRow
                      key={row.id ?? row._id ?? `row-${rowIndex}`}
                      className={cn(
                        "border-brand-border transition-colors",
                        customRowClass || "hover:bg-brand-surface/60",
                      )}
                    >
                      {columns.map((col, colIdx) => {
                        const dataKey = col.key || col.accessorKey;
                        return (
                          <TableCell
                            key={colIdx}
                            className={cn(
                              "py-2 px-2.5 text-xs text-brand-text",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right",
                            )}
                          >
                            {col.cell ? col.cell(row) : (row[dataKey] ?? "—")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Mobile Card View ────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-2.5">
        {loading ? (
          <MobileLoadingCards />
        ) : refetching ? (
          <>
            <div className="h-1 w-full bg-blue-600/20 overflow-hidden rounded-full my-1">
              <div className="h-full bg-blue-600 animate-pulse w-full" />
            </div>
            {paged.map((row, rowIndex) => _renderMobileRow(row, rowIndex, columns, renderMobileCard))}
          </>
        ) : paged.length === 0 ? (
          emptyState ? (
            typeof emptyState === "string" ? (
              <div className="py-14 flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-400">
                  {emptyState}
                </p>
              </div>
            ) : (
              emptyState
            )
          ) : (
            <div className="py-14 flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium text-slate-400">
                No results found.
              </p>
            </div>
          )
        ) : (
          paged.map((row, rowIndex) => _renderMobileRow(row, rowIndex, columns, renderMobileCard))
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-brand-subtext">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs border-brand-border bg-brand-bg focus:ring-brand-blue/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-bg border-brand-border">
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-brand-subtext mr-2">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-brand-border text-brand-subtext hover:text-brand-text shadow-none cursor-pointer"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mobile row renderer (extracted to avoid duplication) ────────────────── */
function _renderMobileRow(row, rowIndex, columns, renderMobileCard) {
  if (renderMobileCard) {
    return (
      <div key={row.id ?? row._id ?? `mob-card-${rowIndex}`}>
        {renderMobileCard(row, rowIndex)}
      </div>
    );
  }

  const titleCol =
    columns.find((c) => {
      const k = (c.key || c.accessorKey || "").toLowerCase();
      return (
        k.includes("name") ||
        k.includes("title") ||
        k.includes("brand") ||
        k.includes("merchant") ||
        k.includes("customer")
      );
    }) || columns[0];

  const titleKey = titleCol ? titleCol.key || titleCol.accessorKey : null;
  const rawTitle = titleKey ? row[titleKey] : null;
  const isStringTitle = typeof rawTitle === "string" && rawTitle.trim().length > 0;
  const cardTitle = isStringTitle
    ? rawTitle
    : titleCol && titleCol.cell
      ? titleCol.cell(row)
      : `Item #${rowIndex + 1}`;

  const subtitleCol = columns.find((c) => {
    const k = (c.key || c.accessorKey || "").toLowerCase();
    return (
      c !== titleCol &&
      (k.includes("category") ||
        k.includes("email") ||
        k.includes("plan") ||
        k.includes("type") ||
        k.includes("role") ||
        k.includes("slot"))
    );
  });
  const subKey = subtitleCol ? subtitleCol.key || subtitleCol.accessorKey : null;
  const cardSubtitle =
    subtitleCol && subtitleCol.cell
      ? subtitleCol.cell(row)
      : subKey
        ? String(row[subKey] ?? "")
        : null;

  const statusCol = columns.find((c) => {
    const h = String(c.header || "").toLowerCase();
    const k = String(c.key || c.accessorKey || "").toLowerCase();
    return h.includes("status") || k.includes("status");
  });

  const actionCol = columns.find((c) => {
    const h = String(c.header || "").toLowerCase();
    const k = String(c.key || c.accessorKey || "").toLowerCase();
    return (
      h.includes("action") ||
      k.includes("action") ||
      h.includes("review") ||
      k.includes("review") ||
      h.includes("manage")
    );
  });

  const rightHeader = statusCol
    ? statusCol.cell
      ? statusCol.cell(row)
      : undefined
    : undefined;

  const actionsFooter = actionCol && actionCol.cell ? actionCol.cell(row) : undefined;

  const otherCols = columns.filter(
    (c) => c !== titleCol && c !== subtitleCol && c !== statusCol && c !== actionCol,
  );

  const fields = otherCols.map((col) => {
    const h = String(col.header || "").toLowerCase();
    const dataKey = col.key || col.accessorKey;
    const val = col.cell ? col.cell(row) : (row[dataKey] ?? "—");
    const isAmount =
      h.includes("amount") ||
      h.includes("price") ||
      h.includes("revenue") ||
      h.includes("mrr") ||
      h.includes("arpu") ||
      h.includes("discount");
    const isCode = h.includes("code") || h.includes("id") || h.includes("coupon");
    return { label: col.header, value: val, isAmount, isCode };
  });

  return (
    <MobileTableCard
      key={row.id ?? row._id ?? `mob-row-${rowIndex}`}
      avatarText={isStringTitle ? rawTitle : undefined}
      badge={typeof cardSubtitle === "string" && cardSubtitle.length < 25 ? cardSubtitle : undefined}
      title={cardTitle}
      subtitle={typeof cardSubtitle === "string" && cardSubtitle.length >= 25 ? cardSubtitle : undefined}
      rightHeader={rightHeader}
      fields={fields}
      actions={actionsFooter}
    />
  );
}