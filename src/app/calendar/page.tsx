"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function CalendarPage() {
  const { timeSlots, toggleTimeSlot, addTimeSlot } = useApp();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-8 py-2">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <span>Availability Schedule & Sync</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Weekly Availability & Session Slots
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set up recurring slots when you are available for 1-on-1 teaching and peer skill exchanges.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((dayName, dayIdx) => {
            const slotsForDay = timeSlots.filter((t) => t.dayOfWeek === dayIdx);

            return (
              <div
                key={dayIdx}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{dayName}</h3>
                  <button
                    onClick={() => addTimeSlot(dayIdx, "18:00", "20:00")}
                    className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Slot
                  </button>
                </div>

                <div className="space-y-2">
                  {slotsForDay.length === 0 ? (
                    <div className="text-[11px] text-gray-400">No active slots</div>
                  ) : (
                    slotsForDay.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 text-xs"
                      >
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <button
                          onClick={() => toggleTimeSlot(slot.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            slot.isAvailable
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {slot.isAvailable ? "Open" : "Blocked"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
