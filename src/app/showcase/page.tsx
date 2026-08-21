"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Sparkles,
    Filter,
    Calendar,
    MapPin,
    X,
    Maximize2,
    Award
} from "lucide-react";
import showcaseDataRaw from "@/data/showcaseData.json";

interface Flagship {
    id: string;
    name: string;
    yearsRunning: string;
    description: string;
    image: string;
    stats: string;
}

interface ClubEvent {
    id: string;
    title: string;
    date: string;
    formattedDate: string;
    category: string;
    shortDescription: string;
    image: string;
    location: string;
    impact: string;
}

const CATEGORIES = [
    "All Categories",
    "Community Service",
    "Professional Dev",
    "Club Service",
    "International Service",
    "Youth/Social",
];

export default function ShowcasePage() {
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [activeLightboxEvent, setActiveLightboxEvent] = useState<ClubEvent | null>(null);

    const flagships: Flagship[] = showcaseDataRaw.flagships;
    const events: ClubEvent[] = showcaseDataRaw.events;

    const filteredEvents = selectedCategory === "All Categories"
        ? events
        : events.filter((e) => e.category === selectedCategory);

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HEADER SECTION ================= */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <Trophy className="w-4 h-4" />
                        <span>Impact Archive & Track Record</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        Our Work & Showcase
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Discover our signature annual flagship initiatives and explore the complete event gallery from the 2025–26 Rotaract year.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-16 space-y-20">

                {/* ================= SECTION A: FLAGSHIP INITIATIVES ================= */}
                <section className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <div className="flex items-center gap-2 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider mb-1">
                                <Sparkles className="w-4 h-4" />
                                <span>Signature Projects</span>
                            </div>
                            <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                                Flagship Initiatives
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 max-w-md">
                            Long-running campaigns that define the Rotaract Club of BMSCE’s identity and community footprint.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {flagships.map((flagship) => (
                            <div
                                key={flagship.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="relative w-full h-52 bg-slate-100">
                                        <Image
                                            src={flagship.image}
                                            alt={flagship.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[11px] font-semibold bg-rotaract-cranberry text-white px-3 py-1 rounded-full shadow-md">
                                                {flagship.yearsRunning}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-3">
                                        <h3 className="font-heading font-bold text-xl text-rotaract-navy group-hover:text-rotaract-cranberry transition-colors">
                                            {flagship.name}
                                        </h3>
                                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                                            {flagship.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-rotaract-navy">
                                    <span className="inline-flex items-center gap-1.5 text-rotaract-cranberry font-bold">
                                        <Award className="w-4 h-4" />
                                        {flagship.stats}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= SECTION B: EVENTS GALLERY (2025–26) ================= */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                        <div>
                            <div className="flex items-center gap-2 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider mb-1">
                                <Calendar className="w-4 h-4" />
                                <span>Track Record</span>
                            </div>
                            <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                                Events of 2025–26
                            </h2>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 hidden sm:block" />
                            {CATEGORIES.map((cat) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                                                ? "bg-rotaract-navy text-white shadow-md shadow-rotaract-navy/20"
                                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Event Cards Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredEvents.map((evt) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    key={evt.id}
                                    onClick={() => setActiveLightboxEvent(evt)}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative w-full h-48 bg-slate-100">
                                            <Image
                                                src={evt.image}
                                                alt={evt.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
                                                    {evt.category}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-white/90 p-1.5 rounded-lg text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Maximize2 className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-2">
                                            <span className="text-xs font-medium text-rotaract-cranberry flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {evt.formattedDate}
                                            </span>
                                            <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-rotaract-navy transition-colors">
                                                {evt.title}
                                            </h3>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {evt.shortDescription}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {evt.location}
                                        </span>
                                        <span className="text-rotaract-navy font-bold">{evt.impact}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>

            </main>

            {/* ================= LIGHTBOX MODAL ================= */}
            <AnimatePresence>
                {activeLightboxEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveLightboxEvent(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setActiveLightboxEvent(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative w-full h-72 sm:h-80 bg-slate-100">
                                <Image
                                    src={activeLightboxEvent.image}
                                    alt={activeLightboxEvent.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-6 md:p-8 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider bg-rotaract-cranberry/10 text-rotaract-cranberry px-3 py-1 rounded-full">
                                        {activeLightboxEvent.category}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {activeLightboxEvent.formattedDate}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold font-heading text-rotaract-navy">
                                    {activeLightboxEvent.title}
                                </h3>

                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {activeLightboxEvent.shortDescription}
                                </p>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs md:text-sm font-medium text-slate-700">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-rotaract-cranberry" />
                                        {activeLightboxEvent.location}
                                    </span>
                                    <span className="bg-rotaract-surface px-3 py-1.5 rounded-lg border border-slate-200 text-rotaract-navy font-bold">
                                        Impact: {activeLightboxEvent.impact}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}