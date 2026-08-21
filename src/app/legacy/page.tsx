"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { History, Sparkles, Users } from "lucide-react";
import legacyDataRaw from "@/data/legacyData.json";

interface LegacyYear {
    year: string;
    theme: string;
    president: string;
    presidentImage: string;
    secretary: string;
    teamPhoto: string;
}

const legacyData = legacyDataRaw as LegacyYear[];

export default function LegacyPage() {
    const lastYearData = legacyData[0]; // 2025-26
    const pastPresidents = legacyData; // All of them

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HEADER SECTION ================= */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <History className="w-4 h-4" />
                        <span>Celebrating 10 Years of Leadership</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        Our Legacy
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Honoring the past presidents who have shaped our club and remembering the team that led us through the last year.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-16 space-y-24">

                {/* ================= PAST PRESIDENTS SECTION ================= */}
                <section>
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-6 h-6 text-rotaract-cranberry" />
                        <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                            Past Presidents
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {pastPresidents.map((yearData, idx) => (
                            <motion.div
                                key={yearData.year}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                                    <Image
                                        src={yearData.presidentImage}
                                        alt={yearData.president}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-rotaract-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-heading font-bold text-slate-900 text-sm md:text-base">
                                        {yearData.president}
                                    </h3>
                                    <p className="text-rotaract-cranberry text-xs font-semibold mt-1">
                                        {yearData.year}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ================= LAST YEAR TEAM SECTION ================= */}
                <section>
                    <div className="flex items-center gap-2 mb-8">
                        <Users className="w-6 h-6 text-rotaract-cranberry" />
                        <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                            Team 2025-26 ({lastYearData.year})
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm"
                    >
                        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-slate-100">
                            <Image
                                src={lastYearData.teamPhoto}
                                alt={`Rotaract BMSCE Team ${lastYearData.year}`}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-rotaract-navy/80 via-rotaract-navy/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                                <h3 className="text-2xl md:text-4xl font-heading font-bold text-white mb-2">
                                    "{lastYearData.theme}"
                                </h3>
                                <p className="text-white/80 text-sm md:text-base">
                                    Led by President {lastYearData.president} and Secretary {lastYearData.secretary}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}