/**
 * RFC 5545 iCalendar (.ics) generation & calendar export utilities
 * for SynapseLearn scheduled skill sessions.
 */

export interface CalendarEventData {
  id: string;
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  url?: string;
}

function formatDateToICS(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function generateICS(event: CalendarEventData): string {
  const now = formatDateToICS(new Date());
  const start = formatDateToICS(event.startTime);
  const end = formatDateToICS(event.endTime);

  const cleanDescription = (event.description || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  const cleanTitle = (event.title || "SynapseLearn Skill Session")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SynapseLearn//Skill Exchange Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@synapselearn.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `STATUS:CONFIRMED`,
    event.location ? `LOCATION:${event.location}` : `LOCATION:SynapseLearn Virtual Room`,
    event.url ? `URL:${event.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function generateMultipleICS(events: CalendarEventData[]): string {
  const now = formatDateToICS(new Date());

  const vevents = events.map((event) => {
    const start = formatDateToICS(event.startTime);
    const end = formatDateToICS(event.endTime);
    const cleanDescription = (event.description || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

    const cleanTitle = (event.title || "SynapseLearn Skill Session")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");

    return [
      "BEGIN:VEVENT",
      `UID:${event.id}@synapselearn.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDescription}`,
      `STATUS:CONFIRMED`,
      event.location ? `LOCATION:${event.location}` : `LOCATION:SynapseLearn Virtual Room`,
      event.url ? `URL:${event.url}` : "",
      "END:VEVENT",
    ].filter(Boolean).join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SynapseLearn//Skill Exchange Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadMultipleICSFile(events: CalendarEventData[], filename = "synapselearn-schedule.ics"): void {
  if (typeof window === "undefined" || events.length === 0) return;

  const icsContent = generateMultipleICS(events);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function downloadICSFile(event: CalendarEventData, filename?: string): void {
  if (typeof window === "undefined") return;

  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const start = formatDateToICS(event.startTime);
  const end = formatDateToICS(event.endTime);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description || "",
    location: event.location || "SynapseLearn Virtual Session",
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
