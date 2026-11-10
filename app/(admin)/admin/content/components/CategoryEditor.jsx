"use client";

import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategoryEditor({
  categories,
  newCategory,
  setNewCategory,
  handleAddCategory,
  handleToggleCategoryActive,
  handleRemoveCategory,
}) {
  return (
    <Card className="bg-white border border-brand-border rounded-2xl shadow-sm">
      <CardHeader className="border-b border-brand-border pb-3.5">
        <CardTitle className="font-heading text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4 text-brand-blue" />
          <span>Offer Category Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add new Category inline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-brand-surface p-4 rounded-xl border border-brand-border/40 text-left">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Category Name
            </label>
            <Input
              placeholder="e.g. Health & Pharmacy"
              value={newCategory.name}
              onChange={(e) => {
                const val = e.target.value;
                const generatedSlug = val
                  .toLowerCase()
                  .replace(/&/g, "and")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                setNewCategory({ name: val, slug: generatedSlug });
              }}
              className="bg-white text-xs border-brand-border h-9 shadow-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">
              Category Slug (Unique URL code)
            </label>
            <Input
              placeholder="e.g. health-pharmacy"
              value={newCategory.slug}
              onChange={(e) =>
                setNewCategory({ ...newCategory, slug: e.target.value })
              }
              className="bg-white text-xs border-brand-border h-9 shadow-none lowercase"
            />
          </div>

          <Button
            onClick={handleAddCategory}
            className="bg-brand-blue hover:bg-brand-blue/95 text-white text-xs font-bold h-9 px-4 border-0 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* List Table */}
        <div className="hidden md:block overflow-hidden border border-brand-border rounded-xl bg-white shadow-none">
          <Table className="w-full text-xs">
            <TableHeader className="bg-brand-surface hover:bg-transparent">
              <TableRow className="hover:bg-transparent border-b border-brand-border">
                <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto text-left">
                  Name
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto text-left">
                  Slug Code
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider h-auto text-left">
                  Visibility Status
                </TableHead>
                <TableHead className="p-3 text-brand-subtext font-bold uppercase tracking-wider text-right h-auto">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-brand-border font-semibold text-brand-text">
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow
                    key={cat.slug}
                    className="hover:bg-brand-surface/20 transition-colors border-b border-brand-border last:border-b-0"
                  >
                    <TableCell className="p-3 font-bold text-brand-navy h-auto text-left">
                      {cat.name}
                    </TableCell>
                    <TableCell className="p-3 font-mono text-brand-subtext text-left">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="p-3 text-left">
                      <Badge
                        variant={cat.active ? "success" : "secondary"}
                        className={`rounded px-2 py-0.5 text-[9px] font-bold border ${
                          cat.active
                            ? "bg-brand-success/10 text-brand-success border-0"
                            : "bg-slate-100 text-slate-500 border-0"
                        } shadow-none`}
                      >
                        {cat.active ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCategoryActive(cat.slug)}
                          className="text-[10px] font-bold h-7 py-1 px-2.5 border-brand-border text-brand-text hover:bg-brand-surface cursor-pointer shadow-none"
                        >
                          {cat.active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCategory(cat.slug)}
                          className="text-brand-subtext hover:text-brand-error w-7 h-7 rounded hover:bg-brand-surface cursor-pointer shadow-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="p-8 text-center text-slate-400"
                  >
                    No categories configured. Add a category above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
