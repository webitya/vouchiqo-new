"use client";

import { Bell, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddOnsTab() {
  // Email Blast State
  const [emailHeadline, setEmailHeadline] = useState(
    "Flat 20% Off Summer Blast Offer!",
  );
  const [emailBody, setEmailBody] = useState(
    "Exclusive deals valid this week at Marbella Tiles & Sanitary.",
  );

  // Push Notification State (9am - 9pm IST validation)
  const [pushText, setPushText] = useState(
    "Special Deal Alert! Claim your 20% discount code now on Vouchiqo!",
  );
  const [pushSendTime, setPushSendTime] = useState("10:30");

  const handleSchedulePush = () => {
    const hour = parseInt(pushSendTime.split(":")[0], 10);
    if (hour < 9 || hour >= 21) {
      toast.error(
        "Push notifications are restricted to 9:00 AM – 9:00 PM IST window.",
      );
      return;
    }
    toast.success(
      `Push notification scheduled via MSG91 Template 8 for ${pushSendTime} IST!`,
    );
  };

  const handleSendTestEmail = () => {
    toast.success("Test email blast sent via SendGrid Template E-9 to admin!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
      {/* 1. DEDICATED EMAIL BLAST (₹799) */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
              Dedicated Email Blast (₹799)
            </h3>
          </div>
          <Badge className="bg-blue-50 text-blue-700 font-medium border-0 text-[10px]">
            SendGrid E-9
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Email Campaign Headline
            </Label>
            <Input
              type="text"
              value={emailHeadline}
              onChange={(e) => setEmailHeadline(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-normal"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Email Body Copy
            </Label>
            <Textarea
              rows={3}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="bg-white border-slate-200 text-xs rounded-xl font-normal"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSendTestEmail}
              variant="outline"
              className="text-xs font-medium rounded-xl h-8 cursor-pointer"
            >
              Send Test Email
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Email blast scheduled!")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 rounded-xl cursor-pointer"
            >
              Schedule Blast
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. PUSH NOTIFICATION (₹599) */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider">
              Push Notification (₹599)
            </h3>
          </div>
          <Badge className="bg-orange-50 text-orange-700 font-medium border-0 text-[10px]">
            MSG91 Template 8
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Push Text (Max 100 chars)
            </Label>
            <Input
              type="text"
              maxLength={100}
              value={pushText}
              onChange={(e) => setPushText(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-normal"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">
              Send Time (9:00 AM – 9:00 PM IST)
            </Label>
            <Input
              type="time"
              value={pushSendTime}
              onChange={(e) => setPushSendTime(e.target.value)}
              className="bg-white border-slate-200 text-xs h-9 rounded-xl font-mono font-normal"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSchedulePush}
            className="bg-[#e85d04] hover:bg-orange-600 text-white font-medium text-xs h-8 rounded-xl cursor-pointer"
          >
            Schedule Push
          </Button>
        </div>
      </Card>
    </div>
  );
}
