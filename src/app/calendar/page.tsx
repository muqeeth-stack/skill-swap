"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { downloadICSFile, downloadMultipleICSFile } from "@/lib/ics";

export default function CalendarPage() {
  const { timeSlots, toggleTimeSlot, addTimeSlot, removeTimeSlot } = useApp();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        <button
          onClick={() => {
            const openSlots = timeSlots.filter((t) => t.isAvailable);
            if (openSlots.length === 0) {
              downloadICSFile({
                id: `availability-${Date.now()}`,
                title: `SynapseLearn Teaching Availability`,
                description: `Weekly open slots for peer skill exchange sessions on SynapseLearn.`,
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
              });
              return;
            }

            const events = openSlots.map((slot) => {
              const now = new Date();
              const currentDay = now.getDay();
              let distance = (slot.dayOfWeek - currentDay + 7) % 7;
              if (distance === 0) distance = 7;
              const targetDate = new Date(now);
              targetDate.setDate(now.getDate() + distance);

              const [startH, startM] = slot.startTime.split(":").map(Number);
              const [endH, endM] = slot.endTime.split(":").map(Number);

              const start = new Date(targetDate);
              start.setHours(startH || 18, startM || 0, 0, 0);

              const end = new Date(targetDate);
              end.setHours(endH || 20, endM || 0, 0, 0);

              return {
                id: `slot-${slot.id}-${Date.now()}`,
                title: `SynapseLearn Availability (${days[slot.dayOfWeek]})`,
                description: `Weekly peer skill exchange teaching slot from ${slot.startTime} to ${slot.endTime}.`,
                startTime: start,
                endTime: end,
              };
            });

            downloadMultipleICSFile(events, "synapselearn-teaching-schedule.ics");
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0 transition-all"
        >
          📅 Export Schedule (.ics)
        </button>
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
                    <div className="text-[11px] text-gray-600">No active slots</div>
                  ) : (
                    slotsForDay.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 text-xs"
                      >
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleTimeSlot(slot.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              slot.isAvailable
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {slot.isAvailable ? "Open" : "Blocked"}
                          </button>
                          <button
                            onClick={() => removeTimeSlot(slot.id)}
                            title="Remove time slot"
                            aria-label="Remove time slot"
                            className="p-1 text-gray-400 hover:text-rose-500 text-xs rounded-md transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
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
