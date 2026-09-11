"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Badge from "@/components/ui/Badge";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarManager() {
  const { currentUser, getUserTimeSlots, addTimeSlot, removeTimeSlot, toggleTimeSlot } = useApp();
  const [selectedDay, setSelectedDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");

  if (!currentUser) return null;

  const slots = getUserTimeSlots(currentUser.id);

  const handleAdd = () => {
    if (newStart >= newEnd) return;
    addTimeSlot(selectedDay, newStart, newEnd);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Weekly Availability</h3>
        <p className="text-sm text-gray-500 mb-4">Set your available time slots so learners can book sessions with you.</p>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {DAY_SHORT.map((day, i) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === i);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedDay === i
                    ? "bg-violet-600 text-white shadow-md"
                    : daySlots.length > 0
                    ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <div className="text-xs font-medium">{day}</div>
                {daySlots.length > 0 && (
                  <div className={`text-[10px] mt-0.5 ${selectedDay === i ? "text-violet-200" : "text-violet-400"}`}>
                    {daySlots.length} slot{daySlots.length > 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">{DAY_NAMES[selectedDay]} Schedule</h4>
          {slots.filter((s) => s.dayOfWeek === selectedDay).length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400">No time slots set for {DAY_NAMES[selectedDay]}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {slots
                .filter((s) => s.dayOfWeek === selectedDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      slot.isAvailable ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${slot.isAvailable ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Badge variant={slot.isAvailable ? "success" : "default"} size="sm">
                        {slot.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleTimeSlot(slot.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={slot.isAvailable ? "Mark unavailable" : "Mark available"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={slot.isAvailable ? "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeTimeSlot(slot.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove slot"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Time Slot</h4>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={newStart >= newEnd}
              className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
