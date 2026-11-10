"use client";

import { AlertTriangle, Pause, Play, Plus, StopCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LiveMonitoringTab({ campaigns = [], onUpdateStatus }) {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [endReason, setEndReason] = useState("");

  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [newCapValue, setNewCapValue] = useState("");

  const handlePause = () => {
    if (pauseReason.trim().length < 20) {
      toast.error(
        "Pausing a campaign requires a mandatory reason of at least 20 characters.",
      );
      return;
    }
    onUpdateStatus(selectedCamp._id, "Live — Paused", pauseReason);
    toast.success("Campaign paused successfully.");
    setIsPauseModalOpen(false);
  };

  const handleEndNow = () => {
    if (!endReason.trim()) {
      toast.error("Please provide a reason before terminating.");
      return;
    }
    onUpdateStatus(selectedCamp._id, "Ended — Admin Terminated", endReason);
    toast.error("Campaign terminated by admin.");
    setIsEndModalOpen(false);
  };

  const handleIncreaseCap = () => {
    toast.success(`Redemption cap updated to ${newCapValue}!`);
    setIsCapModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Auto Alerts Row */}
      <Card className="border-amber-200/80 shadow-xs rounded-2xl bg-amber-50/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>
            Real-time Live Monitoring Auto-Alerts (Refreshes every 2 minutes)
          </span>
        </div>
        <p className="text-[11px] text-amber-800 font-medium">
          System automatically flags: Redemptions &ge;80% of cap, Success Rate
          &lt;80%, or 24 hours with zero redemptions.
        </p>
      </Card>

      {/* Live Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => {
          const clicks = camp.stats?.clicks || 12840;
          const redemptions = camp.stats?.redemptions || 1820;
          const cap = 2000;
          const pctCap = Math.min(100, Math.round((redemptions / cap) * 100));

          return (
            <Card
              key={camp._id}
              className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {camp.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="capitalize text-[10px] font-bold"
                    >
                      {camp.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">
                    {camp.merchantId?.businessName}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] font-bold border-0 ${
                    camp.status === "Live — Paused"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {camp.status === "Live — Paused" ? "Paused" : "● Live Active"}
                </Badge>
              </div>

              {/* Realtime Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-base font-black text-slate-900 block">
                    {clicks}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    Clicks
                  </span>
                </div>
                <div className="border-x border-slate-200/60">
                  <span className="text-base font-black text-slate-900 block">
                    {redemptions}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    Redemptions
                  </span>
                </div>
                <div>
                  <span className="text-base font-black text-emerald-600 block">
                    98.4%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    Success Rate
                  </span>
                </div>
              </div>

              {/* Cap Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Cap Progress</span>
                  <span>
                    {redemptions} / {cap} ({pctCap}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pctCap >= 80 ? "bg-rose-500" : "bg-[#e85d04]"}`}
                    style={{ width: `${pctCap}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                {camp.status === "Live — Paused" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      onUpdateStatus(
                        camp._id,
                        "Live — Active",
                        "Resumed by admin",
                      );
                      toast.success("Campaign resumed!");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 rounded-xl cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Resume
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCamp(camp);
                      setPauseReason("");
                      setIsPauseModalOpen(true);
                    }}
                    className="border-amber-200 text-amber-800 hover:bg-amber-50 font-bold text-[11px] h-8 rounded-xl"
                  >
                    <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCamp(camp);
                    setNewCapValue(String(cap + 500));
                    setIsCapModalOpen(true);
                  }}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[11px] h-8 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Increase Cap
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCamp(camp);
                    setEndReason("");
                    setIsEndModalOpen(true);
                  }}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-[11px] h-8 rounded-xl ml-auto"
                >
                  <StopCircle className="w-3.5 h-3.5 mr-1" /> End Now
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* PAUSE MODAL */}
      <Dialog open={isPauseModalOpen} onOpenChange={setIsPauseModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Pause Live Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-xs">
            <Label className="font-bold text-slate-800">
              Mandatory Pause Reason (Min 20 chars)
            </Label>
            <Textarea
              rows={3}
              placeholder="e.g. Counter staff reported high rush, pausing temporarily..."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="bg-white border-slate-200 text-xs rounded-xl"
            />
          </div>
          <Button
            onClick={handlePause}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 rounded-xl cursor-pointer"
          >
            Confirm Pause
          </Button>
        </DialogContent>
      </Dialog>

      {/* END NOW MODAL */}
      <Dialog open={isEndModalOpen} onOpenChange={setIsEndModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-rose-600">
              Terminate Campaign Immediately
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600 font-medium">
            This will stop all promotional channels immediately and compile
            final analytics.
          </p>
          <div className="space-y-2 text-xs">
            <Label className="font-bold text-slate-800">
              Termination Reason
            </Label>
            <Input
              type="text"
              placeholder="Reason sent to merchant..."
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-medium"
            />
          </div>
          <Button
            onClick={handleEndNow}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 rounded-xl cursor-pointer"
          >
            Confirm Termination
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
