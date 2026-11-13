import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface UpcomingEventItem {
    id: string;
    title: string;
    banner: string;
    date: string;
    time: string;
    venue: string;
    shortDescription: string;
    detailedDescription?: string;
    registrationLink?: string;
    spotsLeft?: number;
    totalSpots?: number;
    deadline: string;
    category: string;
    audience?: "everyone" | "members" | "ri_members";
}

const EVENTS_JSON_PATH = path.join(process.cwd(), "src", "data", "upcomingEvents.json");
const TMP_EVENTS_PATH = path.join(os.tmpdir(), "rotaract_upcomingEvents.json");
const EVENTS_IMAGES_DIR = path.join(process.cwd(), "public", "images", "events");

declare global {
    var __rotaractUpcomingEvents: UpcomingEventItem[] | undefined;
}

function readStoredEvents(): { events: UpcomingEventItem[]; source: "memory" | "tmp" | "file" } {
    if (globalThis.__rotaractUpcomingEvents) {
        return { events: globalThis.__rotaractUpcomingEvents, source: "memory" };
    }

    try {
        if (fs.existsSync(TMP_EVENTS_PATH)) {
            const raw = fs.readFileSync(TMP_EVENTS_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                globalThis.__rotaractUpcomingEvents = parsed;
                return { events: parsed, source: "tmp" };
            }
        }
    } catch {
        // Ignore tmp read errors
    }

    try {
        if (fs.existsSync(EVENTS_JSON_PATH)) {
            const raw = fs.readFileSync(EVENTS_JSON_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                globalThis.__rotaractUpcomingEvents = parsed;
                return { events: parsed, source: "file" };
            }
        }
    } catch (e) {
        console.error("Failed to read upcomingEvents.json:", e);
    }

    return { events: [], source: "file" };
}

function persistEvents(events: UpcomingEventItem[]): void {
    globalThis.__rotaractUpcomingEvents = events;

    try {
        const dir = path.dirname(EVENTS_JSON_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(EVENTS_JSON_PATH, JSON.stringify(events, null, 2), "utf-8");
    } catch (e) {
        console.warn("Could not write to EVENTS_JSON_PATH, attempting /tmp fallback:", e);
        try {
            fs.writeFileSync(TMP_EVENTS_PATH, JSON.stringify(events, null, 2), "utf-8");
        } catch (tmpErr) {
            console.error("Could not write to TMP_EVENTS_PATH:", tmpErr);
        }
    }
}

function saveBase64Poster(dataUri: string, eventId: string): string {
    if (!dataUri || !dataUri.startsWith("data:image/")) {
        return dataUri;
    }

    try {
        if (!fs.existsSync(EVENTS_IMAGES_DIR)) {
            fs.mkdirSync(EVENTS_IMAGES_DIR, { recursive: true });
        }

        const matches = dataUri.match(/^data:image\/([A-Za-z0-9-+]+);base64,(.+)$/);
        if (!matches || matches.length < 3) {
            return dataUri;
        }

        let ext = matches[1].toLowerCase();
        if (ext === "jpeg") ext = "jpg";
        const safeId = eventId.replace(/[^a-zA-Z0-9_-]/g, "");
        const fileName = `poster-${safeId}-${Date.now()}.${ext}`;
        const filePath = path.join(EVENTS_IMAGES_DIR, fileName);
        fs.writeFileSync(filePath, Buffer.from(matches[2], "base64"));

        return `/images/events/${fileName}?v=${Date.now()}`;
    } catch {
        // On read-only serverless filesystems (e.g. Vercel), keep the compressed data URI
        return dataUri;
    }
}

const NO_CACHE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
};

export async function GET() {
    const { events, source } = readStoredEvents();
    return NextResponse.json(
        { success: true, events, source },
        { headers: NO_CACHE_HEADERS }
    );
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const incomingEvents: UpcomingEventItem[] = Array.isArray(body.events) ? body.events : [];

        const processedEvents: UpcomingEventItem[] = incomingEvents.map((ev) => ({
            ...ev,
            banner: saveBase64Poster(ev.banner, ev.id || `evt-${Date.now()}`),
        }));

        persistEvents(processedEvents);

        return NextResponse.json(
            { success: true, events: processedEvents },
            { headers: NO_CACHE_HEADERS }
        );
    } catch (error: any) {
        console.error("Failed to save events:", error);
        return NextResponse.json(
            { success: false, error: error?.message || "Failed to update events." },
            { status: 500 }
        );
    }
}

