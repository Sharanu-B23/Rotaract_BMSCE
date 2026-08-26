"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    AlertCircle,
    X,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Send,
    Loader2
} from "lucide-react";
import upcomingEventsRaw from "@/data/upcomingEvents.json";

interface UpcomingEvent {
    id: string;
    title: string;
    banner: string;
    date: string;
    time: string;
    venue: string;
    shortDescription: string;
    spotsLeft: number;
    totalSpots: number;
    deadline: string;
    category: string;
    audience?: "everyone" | "members" | "ri_members";
}

export default function UpcomingEventsPage() {
    const [eventsList, setEventsList] = useState<UpcomingEvent[]>(upcomingEventsRaw as UpcomingEvent[]);
    const [activeModalEvent, setActiveModalEvent] = useState<UpcomingEvent | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Load admin created/updated events from localStorage on mount
    useEffect(() => {
        const storedEvents = localStorage.getItem("rotaract_events_data");
        if (storedEvents) {
            try {
                setEventsList(JSON.parse(storedEvents));
            } catch (e) {
                setEventsList(upcomingEventsRaw as UpcomingEvent[]);
            }
        }
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        academicYear: "1st Year",
        memberId: "",
        riMemberId: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

        if (!googleScriptUrl) {
            console.warn("NEXT_PUBLIC_GOOGLE_SCRIPT_URL variable is missing in .env.local.");
            setIsSubmitting(false);
            setIsSubmitted(true);
            return;
        }

        try {
            const payload = {
                eventTitle: activeModalEvent?.title,
                audienceEligibility: activeModalEvent?.audience || "everyone",
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                academicYear: formData.academicYear,
                department: formData.department,
                memberId: activeModalEvent?.audience === "members" ? formData.memberId : undefined,
                riMemberId: activeModalEvent?.audience === "ri_members" ? formData.riMemberId : undefined,
            };

            // Send payload to Google Apps Script Web App
            await fetch(googleScriptUrl, {
                method: "POST",
                mode: "no-cors", // Required for Google Apps Script endpoint
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            setIsSubmitting(false);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Submission Error:", error);
            setIsSubmitting(false);
            setErrorMessage("Unable to process registration. Please try again.");
        }
    };

    const closeModal = () => {
        setActiveModalEvent(null);
        setIsSubmitted(false);
        setIsSubmitting(false);
        setErrorMessage("");
        setFormData({
            fullName: "",
            email: "",
            phone: "",
            department: "",
            academicYear: "1st Year",
            memberId: "",
            riMemberId: "",
        });
    };

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
                        Reserve your spot for our next community drive, workshop, or flagship conference. All events are open to BMSCE students and external youth.
                    </p>
                </div>
            </section>

            {/* ================= MAIN CONTENT ================= */}
            <main className="max-w-6xl mx-auto px-6 pt-16">

                {eventsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {eventsList.map((event) => {
                            const isLowSpots = event.spotsLeft <= 20;
                            return (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Event Banner */}
                                        <div className="relative w-full h-56 bg-slate-100">
                                            <Image
                                                src={event.banner}
                                                alt={event.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="text-[11px] font-semibold bg-rotaract-navy/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                                                    {event.category}
                                                </span>
                                                {event.audience === "members" && (
                                                    <span className="text-[11px] font-semibold bg-amber-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                                                        🔒 Members Only
                                                    </span>
                                                )}
                                                {event.audience === "ri_members" && (
                                                    <span className="text-[11px] font-semibold bg-purple-600/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                                                        🎖️ RI Members Only
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="p-6 space-y-4">
                                            <div className="space-y-1.5">
                                                <span className="text-xs font-semibold text-rotaract-cranberry flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {event.deadline}
                                                </span>
                                                <h2 className="font-heading font-bold text-2xl text-rotaract-navy group-hover:text-rotaract-cranberry transition-colors">
                                                    {event.title}
                                                </h2>
                                            </div>

                                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                                                {event.shortDescription}
                                            </p>

                                            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs md:text-sm text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-rotaract-cranberry" />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-rotaract-cranberry" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-rotaract-cranberry" />
                                                    <span>{event.venue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="p-6 pt-0">
                                        <button
                                            onClick={() => setActiveModalEvent(event)}
                                            className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-md shadow-rotaract-cranberry/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <span>Register for Event</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
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

            {/* ================= REGISTRATION MODAL ================= */}
            <AnimatePresence>
                {activeModalEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl relative my-8"
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {!isSubmitted ? (
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div>
                                        <span className="text-xs font-bold text-rotaract-cranberry uppercase tracking-wider">
                                            Event Registration
                                        </span>
                                        <h3 className="text-xl font-bold font-heading text-rotaract-navy mt-1">
                                            {activeModalEvent.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {activeModalEvent.date} • {activeModalEvent.venue}
                                        </p>
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Phone / WhatsApp *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    placeholder="+91 9876543210"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Academic Year *
                                                </label>
                                                <select
                                                    name="academicYear"
                                                    value={formData.academicYear}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-white"
                                                >
                                                    <option>1st Year</option>
                                                    <option>2nd Year</option>
                                                    <option>3rd Year</option>
                                                    <option>4th Year</option>
                                                    <option>External / Alumni</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Department / Branch
                                            </label>
                                            <input
                                                type="text"
                                                name="department"
                                                placeholder="e.g. Computer Science Engineering"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm"
                                            />
                                        </div>

                                        {/* Dynamic Membership ID Field based on Admin Choice */}
                                        {activeModalEvent.audience === "members" && (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5">
                                                <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                                                    <span>Rotaract Membership ID *</span>
                                                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-semibold">Required for Members</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="memberId"
                                                    required
                                                    placeholder="Enter your Rotaract Membership ID (e.g. ROT-2026-88)"
                                                    value={formData.memberId}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                                                />
                                            </div>
                                        )}

                                        {activeModalEvent.audience === "ri_members" && (
                                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1.5">
                                                <label className="block text-xs font-bold text-purple-900 flex items-center justify-between">
                                                    <span>Rotary International (RI) Membership ID *</span>
                                                    <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md font-semibold">Required for RI Members</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="riMemberId"
                                                    required
                                                    placeholder="Enter your official RI Membership ID"
                                                    value={formData.riMemberId}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                                                />
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 disabled:bg-slate-400 text-white font-semibold shadow-lg shadow-rotaract-cranberry/20 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Saving to Google Sheet...</span>
                                                    </>
                                                ) : (
                                                    <span>Confirm & Reserve Spot</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                /* Confirmation Screen */
                                <div className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-heading text-rotaract-navy">
                                        You're Registered!
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Thank you, <strong className="text-slate-800">{formData.fullName}</strong>. Your entry has been saved under <span className="text-slate-800">{formData.email}</span>.
                                    </p>
                                    <div className="pt-4">
                                        <button
                                            onClick={closeModal}
                                            className="px-6 py-2.5 rounded-xl bg-rotaract-navy text-white text-sm font-semibold hover:bg-rotaract-dark transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}