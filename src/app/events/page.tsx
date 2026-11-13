"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    AlertCircle,
    X,
    Sparkles,
    ArrowRight,
    Send,
    ExternalLink,
    Eye
} from "lucide-react";
import upcomingEventsRaw from "@/data/upcomingEvents.json";

export interface UpcomingEvent {
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

function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export default function UpcomingEventsPage() {
    const [eventsList, setEventsList] = useState<UpcomingEvent[]>(upcomingEventsRaw as UpcomingEvent[]);
    const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);

    // Fetch live events from server API with localStorage fallback
    useEffect(() => {
        let isMounted = true;

        async function loadEvents() {
            try {
                const res = await fetch("/api/events", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.events)) {
                        if (data.source !== "file" || data.events.length > 0) {
                            if (isMounted) setEventsList(data.events);
                            return;
                        }
                    }
                }
            } catch (e) {
                console.warn("Unable to fetch events from API, checking local storage fallback:", e);
            }

            const storedEvents = localStorage.getItem("rotaract_events_data");
            if (storedEvents) {
                try {
                    const parsed = JSON.parse(storedEvents);
                    if (Array.isArray(parsed) && isMounted) {
                        setEventsList(parsed);
                        return;
                    }
                } catch {
                    // Fallback to bundled JSON
                }
            }

            if (isMounted) {
                setEventsList(upcomingEventsRaw as UpcomingEvent[]);
            }
        }

        loadEvents();
        return () => {
            isMounted = false;
        };
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        if (!selectedEvent) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedEvent(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedEvent]);

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HEADER SECTION ================= */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <Calendar className="w-4 h-4" />
                        <span>Get Involved Today</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        Upcoming Events
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Reserve your spot for our next community drive, workshop, or flagship conference. Click on any event poster to read full details.
                    </p>
                </div>
            </section>

            {/* ================= MAIN CONTENT ================= */}
            <main className="max-w-6xl mx-auto px-6 pt-16">

                {eventsList.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-8 items-stretch">
                        {eventsList.map((event) => {
                            const posterSrc = event.banner || "/rotaract-logo.png";
                            const isExternalOrData = posterSrc.startsWith("data:") || posterSrc.startsWith("http");
                            const formUrl = event.registrationLink ? normalizeUrl(event.registrationLink) : "";
                            const summaryText = event.shortDescription || event.detailedDescription || "";

                            return (
                                <div
                                    key={event.id}
                                    className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] max-w-sm bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Event Poster in A3 Ratio (297:420) */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEvent(event)}
                                            aria-label={`View full details for ${event.title}`}
                                            className="relative w-full aspect-[297/420] bg-slate-100 overflow-hidden cursor-pointer group/poster block text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rotaract-navy"
                                        >
                                            <Image
                                                src={posterSrc}
                                                alt={event.title}
                                                fill
                                                unoptimized={isExternalOrData}
                                                className="object-contain group-hover/poster:scale-[1.02] transition-transform duration-500"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                                            />
                                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                                                <span className="text-[11px] font-semibold bg-rotaract-navy/90 text-white px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                                                    {event.category}
                                                </span>
                                                {event.audience === "members" && (
                                                    <span className="text-[11px] font-semibold bg-amber-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                                                        🔒 Members Only
                                                    </span>
                                                )}
                                                {event.audience === "ri_members" && (
                                                    <span className="text-[11px] font-semibold bg-purple-600/90 text-white px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                                                        🎖️ RI Members Only
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute bottom-3 right-3 z-10">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-black/65 group-hover/poster:bg-rotaract-navy text-white px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-colors">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View Details</span>
                                                </span>
                                            </div>
                                        </button>

                                        {/* Short Event Details Below Poster */}
                                        <div className="p-6 space-y-3.5">
                                            <div className="space-y-1.5">
                                                {event.deadline && (
                                                    <span className="text-xs font-semibold text-rotaract-cranberry flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{event.deadline}</span>
                                                    </span>
                                                )}
                                                <h2
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="font-heading font-bold text-xl text-rotaract-navy group-hover:text-rotaract-cranberry transition-colors cursor-pointer"
                                                >
                                                    {event.title}
                                                </h2>
                                            </div>

                                            {summaryText && (
                                                <div className="space-y-1">
                                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light line-clamp-3">
                                                        {summaryText}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="text-xs font-semibold text-rotaract-navy hover:text-rotaract-cranberry inline-flex items-center gap-1 transition-colors"
                                                    >
                                                        <span>Read more</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-1.5 pt-2.5 border-t border-slate-100 text-xs text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-rotaract-cranberry shrink-0" />
                                                    <span>{event.date}</span>
                                                </div>
                                                {event.time && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-rotaract-cranberry shrink-0" />
                                                        <span>{event.time}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-rotaract-cranberry shrink-0" />
                                                    <span>{event.venue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button - Redirects to Google Form */}
                                    <div className="p-6 pt-0">
                                        {formUrl ? (
                                            <a
                                                href={formUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-md shadow-rotaract-cranberry/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <span>Register Here</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedEvent(event)}
                                                className="w-full py-3.5 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <span>View Details</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ================= EMPTY STATE ================= */
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 md:p-16 text-center max-w-2xl mx-auto space-y-6">
                        <div className="w-16 h-16 bg-rotaract-cranberry/10 text-rotaract-cranberry rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl md:text-3xl font-bold font-heading text-rotaract-navy">
                                To Be Announced Soon
                            </h3>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                                We are currently planning our next big initiative! Subscribe to our newsletter or check back later to get updates as soon as new events go live.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/newsletter"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rotaract-navy text-white text-sm font-semibold hover:bg-rotaract-dark transition-colors"
                            >
                                <span>Join Newsletter</span>
                                <Send className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}

            </main>

            {/* ================= DETAILED EVENT VIEW MODAL (ON POSTER CLICK) ================= */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEvent(null)}
                        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-200 shadow-2xl relative my-4 max-h-[90vh] flex flex-col md:flex-row"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                aria-label="Close event details"
                                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/90 text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Left: A3 Poster Display */}
                            <div className="md:w-[46%] bg-slate-100 flex items-center justify-center p-4 sm:p-6 shrink-0">
                                <div className="relative w-full max-w-[260px] md:max-w-none aspect-[297/420] rounded-2xl overflow-hidden shadow-md bg-white border border-slate-200/70">
                                    <Image
                                        src={selectedEvent.banner || "/rotaract-logo.png"}
                                        alt={selectedEvent.title}
                                        fill
                                        unoptimized={
                                            (selectedEvent.banner || "").startsWith("data:") ||
                                            (selectedEvent.banner || "").startsWith("http")
                                        }
                                        className="object-contain"
                                        sizes="(max-width: 768px) 260px, 400px"
                                    />
                                </div>
                            </div>

                            {/* Right: Full Event Details & Google Form Link */}
                            <div className="md:w-[54%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 pr-8">
                                        <span className="text-[11px] font-bold bg-rotaract-navy text-white px-3 py-1 rounded-full">
                                            {selectedEvent.category}
                                        </span>
                                        {selectedEvent.audience === "members" && (
                                            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                                                🔒 Members Only
                                            </span>
                                        )}
                                        {selectedEvent.audience === "ri_members" && (
                                            <span className="text-[11px] font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                                                🎖️ RI Members Only
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-rotaract-navy leading-tight">
                                            {selectedEvent.title}
                                        </h3>
                                        {selectedEvent.deadline && (
                                            <p className="text-xs font-semibold text-rotaract-cranberry flex items-center gap-1.5 mt-2">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{selectedEvent.deadline}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-rotaract-cranberry shrink-0" />
                                            <span>{selectedEvent.date}</span>
                                        </div>
                                        {selectedEvent.time && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-rotaract-cranberry shrink-0" />
                                                <span>{selectedEvent.time}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <MapPin className="w-4 h-4 text-rotaract-cranberry shrink-0" />
                                            <span>{selectedEvent.venue}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-rotaract-navy">
                                            About This Event
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {selectedEvent.detailedDescription ||
                                                selectedEvent.shortDescription ||
                                                "More details will be announced soon."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    {selectedEvent.registrationLink ? (
                                        <a
                                            href={normalizeUrl(selectedEvent.registrationLink)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-lg shadow-rotaract-cranberry/20 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <span>Register Here</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    ) : (
                                        <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs text-center">
                                            Registration link will be updated soon.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
