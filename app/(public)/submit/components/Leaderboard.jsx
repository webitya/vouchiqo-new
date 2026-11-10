"use client";

import { Trophy } from "lucide-react";

const LEADERBOARD = [
  { rank: 1, name: "armory texas", points: 100, medal: true },
  { rank: 2, name: "Bhuvan S raj", points: 10, medal: true },
  { rank: 3, name: "govinda AF", points: 10, medal: true },
  { rank: 4, name: "Rohit Singh", points: 10, medal: false },
];

/**
 * Leaderboard + benefits sidebar for submit page.
 */
export default function Leaderboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-[16px] font-black text-brand-navy mb-5 flex items-center gap-2 border-b border-slate-50 pb-3">
          <Trophy className="w-5 h-5 text-yellow-500" /> Leader Board
        </h2>
        <div className="flex flex-col divide-y divide-slate-100">
          {LEADERBOARD.map((user) => (
            <div
              key={user.rank}
              className="py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                    user.rank === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : user.rank === 2
                        ? "bg-slate-100 text-slate-700"
                        : user.rank === 3
                          ? "bg-blue-100 text-blue-700"
                          : "bg-transparent text-slate-400"
                  }`}
                >
                  {user.rank}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-brand-navy leading-none">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    Points: {user.points}
                  </p>
                </div>
              </div>
              {user.medal && (
                <span className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-full">
                  👑
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#08214D] to-[#0d3473] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Trophy className="w-40 h-40" />
        </div>
        <h3 className="text-[15px] font-black uppercase tracking-wider mb-2">
          Submitter Benefits
        </h3>
        <ul className="space-y-3.5 text-[12px] font-medium text-slate-200">
          {[
            {
              title: "Get Recognized",
              desc: "Earn profile badges and rise on the leaderboard.",
            },
            {
              title: "Support the Community",
              desc: "Help shoppers make smart purchases.",
            },
            {
              title: "Win Rewards",
              desc: "Become eligible for exclusive giveaways.",
            },
          ].map((item) => (
            <li key={item.title} className="flex items-start gap-2.5">
              <span className="text-yellow-400">★</span>
              <span>
                <strong>{item.title}:</strong> {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
