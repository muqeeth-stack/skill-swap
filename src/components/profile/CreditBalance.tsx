"use client";

import { useApp } from "@/context/AppContext";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/dateUtils";

export default function CreditBalance() {
  const { currentUser, getCreditHistory } = useApp();

  if (!currentUser) return null;

  const history = getCreditHistory(currentUser.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-sm font-bold text-amber-700">{currentUser.credits}</span>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 mb-4">
        <p className="text-sm text-violet-700">
          <span className="font-semibold">Earn 1 credit</span> for every hour you teach. Spend credits on any session across the platform.
        </p>
      </div>

      {history.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-700">{tx.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-semibold ${tx.type === "earned" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "earned" ? "+" : ""}{tx.amount}
                  </span>
                  <Badge variant={tx.type === "earned" ? "success" : "danger"} size="sm">
                    {tx.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
