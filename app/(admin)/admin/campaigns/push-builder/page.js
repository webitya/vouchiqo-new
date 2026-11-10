"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Clock,
  History,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MOCK_DELIVERY_LOGS = [
  {
    id: "LOG-901",
    campaign: "Diwali Special",
    sendTime: "2026-07-21 11:30 IST",
    recipients: 4850,
    status: "Push Sent",
    template: "MSG91 Template 8",
  },
  {
    id: "LOG-902",
    campaign: "Monsoon Cashback",
    sendTime: "2026-07-25 14:00 IST",
    recipients: 3200,
    status: "Push Scheduled",
    template: "MSG91 Template 8",
  },
  {
    id: "LOG-903",
    campaign: "Flash Midnight Sale",
    sendTime: "2026-07-18 22:30 IST",
    recipients: 1500,
    status: "Push Failed",
    reason: "Outside TRAI window (22:30 IST)",
  },
];

export default function PushNotificationBuilderPage() {
  const [pushText, setPushText] = useState(
    "🔥 Flat 20% OFF Italian Marble at Marbella Tiles Ranchi! Use code MARBLE20 at store.",
  );
  const [sendTime, setSendTime] = useState("2026-07-25T14:30");
  const [targetCategory, setTargetCategory] = useState(
    "Home Improvement & Living",
  );
  const [deliveryLogs, setDeliveryLogs] = useState(MOCK_DELIVERY_LOGS);

  // Validate TRAI Window: Send time MUST be between 09:00 and 21:00 IST
  const validateSendWindow = (timeStr) => {
    if (!timeStr) return false;
    const dateObj = new Date(timeStr);
    const hour = dateObj.getHours(); // 0 - 23
    return hour >= 9 && hour < 21;
  };

  const handleSchedulePush = () => {
    const isValidWindow = validateSendWindow(sendTime);
    if (!isValidWindow) {
      toast.error(
        "TRAI Violation: Push notifications & MSG91 SMS can only be scheduled between 09:00 and 21:00 IST!",
      );
      return;
    }

    toast.success(
      "MSG91 Push Notification scheduled successfully using Template 8!",
    );
    setDeliveryLogs((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-3)}`,
        campaign: "Current Campaign",
        sendTime: `${sendTime.replace("T", " ")} IST`,
        recipients: 4850,
        status: "Push Scheduled",
        template: "MSG91 Template 8",
      },
      ...prev,
    ]);
  };

  const isWindowValid = validateSendWindow(sendTime);

  return (
    <DashboardLayout
      title="Push Notification Builder (MSG91 Template 8)"
      user={{ name: "Super Admin", role: "admin" }}
    >
      <div className="space-y-6 text-left font-sans w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="p-1.5 h-auto rounded-xl">
              <Link href="/admin/campaigns/queue">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" /> Push Notification
                  Builder (₹599 Add-On)
                </h1>
                <Badge className="bg-purple-100 text-purple-800 text-[9px] font-bold border-0">
                  MSG91 Template 8
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                TRAI Regulated Window: <strong>09:00 to 21:00 IST only</strong>{" "}
                • Opt-in Category Push
              </p>
            </div>
          </div>

          <Button
            onClick={handleSchedulePush}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-xs"
          >
            Schedule Push →
          </Button>
        </div>

        {/* 2-COLUMN LAYOUT: LEFT (BUILDER FORM), RIGHT (SMS & PUSH MOCK + DELIVERY LOG) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: PUSH FORM */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Push Content &amp; TRAI Window Schedule
              </h3>

              {/* Auto-populated Text (Max 100 chars) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-purple-600" />{" "}
                    Auto-Populated Push Text (Max 100 Chars) *
                  </Label>
                  <span
                    className={`text-[10px] font-bold ${pushText.length > 100 ? "text-rose-600" : "text-slate-400"}`}
                  >
                    {pushText.length}/100
                  </span>
                </div>
                <Textarea
                  rows={3}
                  maxLength={100}
                  value={pushText}
                  onChange={(e) => setPushText(e.target.value)}
                  className="bg-white border-slate-200 text-xs rounded-xl leading-relaxed"
                />
              </div>

              {/* Scheduled Send Time (09:00 - 21:00 IST Validation) */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Scheduled Send
                  Time (09:00 to 21:00 IST) *
                </Label>
                <Input
                  type="datetime-local"
                  value={sendTime}
                  onChange={(e) => setSendTime(e.target.value)}
                  className={`bg-white text-xs h-10 rounded-xl font-mono font-medium ${!isWindowValid ? "border-rose-500 ring-2 ring-rose-100" : "border-slate-200"}`}
                />

                {!isWindowValid && (
                  <div className="flex items-center gap-1.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      TRAI Violation Error: Scheduled time must fall between
                      09:00 and 21:00 IST!
                    </span>
                  </div>
                )}
              </div>

              {/* Target Segment */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs font-semibold text-purple-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Opted-in segment: Subscribers in{" "}
                  <strong>{targetCategory}</strong> (~4,850 devices)
                </span>
              </div>
            </Card>
          </div>

          {/* RIGHT: DEVICE MOCK & DELIVERY LOG */}
          <div className="lg:col-span-6 space-y-6">
            {/* Device Lockscreen Mock */}
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-slate-900 text-white p-5 space-y-3 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Device
                Notification Mock
              </span>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-white/70 font-semibold">
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-blue-400" /> Vouchiqo
                    Deals
                  </span>
                  <span>Just now</span>
                </div>
                <p className="text-xs font-bold text-white leading-snug">
                  {pushText}
                </p>
              </div>
            </Card>

            {/* Delivery Logs Table with Badges */}
            <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" /> Push Delivery
                Status Log
              </h3>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {deliveryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">
                        {log.campaign} ({log.recipients} users)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.sendTime} • {log.template}
                      </span>
                    </div>

                    <Badge
                      className={`rounded font-bold text-[9px] border-0 ${log.status === "Push Sent" ? "bg-emerald-100 text-emerald-800" : log.status === "Push Scheduled" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"}`}
                    >
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
