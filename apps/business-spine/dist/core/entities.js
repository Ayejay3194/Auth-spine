import { normalizeText } from "./util.js";
/**
 * Deterministic entity extraction.
 * - Dates: supports "today", "tomorrow", "next mon", "2025-12-13", "12/13", "dec 13"
 * - Times: "3pm", "15:30"
 * - Money: "$50", "50 dollars"
 * - Emails/phones
 * - IDs: booking_*, invoice_*
 *
 * This is intentionally conservative: when unsure, mark missing.
 */
export function extractEmail(text) {
    const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return m ? m[0] : null;
}
export function extractPhone(text) {
    const m = text.match(/\+?1?\s*\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4}/);
    return m ? m[0].replace(/\s+/g, " ").trim() : null;
}
export function extractMoney(text) {
    const m = text.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
    if (m)
        return Number(m[1]);
    const m2 = text.match(/(\d+(?:\.\d{1,2})?)\s*(?:dollars|usd)/i);
    return m2 ? Number(m2[1]) : null;
}
export function extractId(text, prefix) {
    const re = new RegExp(`\\b(${prefix}_[a-z0-9]+)\\b`, "i");
    const m = text.match(re);
    return m ? m[1] : null;
}
const MONTHS = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
};
const DOW = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tues: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thur: 4, thurs: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
};
function toISO(dt) {
    return dt.toISOString();
}
function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function addDays(d, days) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}
export function extractDateTime(text, nowISO) {
    const now = new Date(nowISO);
    const t = normalizeText(text);
    // time
    let time;
    const tm = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    if (tm) {
        let h = Number(tm[1]);
        const min = tm[2] ? Number(tm[2]) : 0;
        const ap = tm[3];
        if (ap === "pm" && h < 12)
            h += 12;
        if (ap === "am" && h === 12)
            h = 0;
        time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
    else {
        const tm24 = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        if (tm24)
            time = `${tm24[1].padStart(2, "0")}:${tm24[2]}`;
    }
    // explicit ISO date
    let date;
    const iso = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (iso) {
        date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    }
    // MM/DD (assumes current year)
    if (!date) {
        const md = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
        if (md) {
            date = new Date(now.getFullYear(), Number(md[1]) - 1, Number(md[2]));
        }
    }
    // "dec 13"
    if (!date) {
        const m = t.match(/\b([a-z]{3,9})\s+(\d{1,2})\b/);
        if (m) {
            const mm = MONTHS[m[1]];
            if (mm)
                date = new Date(now.getFullYear(), mm - 1, Number(m[2]));
        }
    }
    // relative
    if (!date) {
        if (t.includes("today"))
            date = startOfDay(now);
        else if (t.includes("tomorrow"))
            date = startOfDay(addDays(now, 1));
        else if (t.includes("next")) {
            const d = Object.keys(DOW).find(k => t.includes(`next ${k}`));
            if (d) {
                const target = DOW[d];
                const cur = now.getDay();
                let diff = (target - cur + 7) % 7;
                if (diff === 0)
                    diff = 7;
                date = startOfDay(addDays(now, diff));
            }
        }
    }
    if (!date && time) {
        // time only, assume today
        date = startOfDay(now);
    }
    if (!date && !time)
        return {};
    const dateISO = date ? date.toISOString().slice(0, 10) : undefined;
    if (date && time) {
        const [hh, mm] = time.split(":").map(Number);
        const dt = new Date(date);
        dt.setHours(hh, mm, 0, 0);
        return { dateISO, time, dateTimeISO: toISO(dt) };
    }
    return { dateISO, time };
}
export function requireFields(entities, required) {
    return required.filter(k => entities[k] === undefined || entities[k] === null || entities[k] === "");
}
