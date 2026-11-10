"use client";

export default function ActivityTab() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 w-full text-left font-sans">
      <h3 className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight border-b border-slate-100 pb-2.5">
        Your Chronological Activity
      </h3>

      <div className="space-y-4 relative pl-4 border-l border-slate-200">
        {[
          {
            message: "Checked in at Marbella Home Improvement (Ranchi)",
            time: "2 hours ago",
            desc: "Viewed showroom deals in Home Improvement category.",
          },
          {
            message: "Claimed Burger House BOGOFRIES offer code",
            time: "1 day ago",
            desc: "Redeemed 'Buy One Get One Free Fries' voucher code BURGER30.",
          },
          {
            message: "Saved StyleZone Summer collection offer",
            time: "2 days ago",
            desc: "Bookmarked '20% off Summer Collection' for in-store purchase.",
          },
          {
            message: "Voted to revive Zomato Premier offer",
            time: "3 days ago",
            desc: "Submitted an Expired Offer Revival request for 50% discount codes.",
          },
          {
            message: "Completed profile preferences settings",
            time: "10 days ago",
            desc: "Selected shopping category interests for Homepage customization.",
          },
        ].map((act, idx) => (
          <div key={idx} className="relative space-y-0.5">
            {/* Dot */}
            <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#F72853] border-2 border-white shadow-2xs"></div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-medium">{act.message}</span>
              <span className="text-[9.5px] text-slate-400 font-normal">
                {act.time}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
              {act.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
