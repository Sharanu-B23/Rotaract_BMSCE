"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Users,
    Quote,
    Sparkles,
    Compass
} from "lucide-react";
import { FaLinkedin as Linkedin, FaInstagram as Instagram } from "react-icons/fa";
import teamDataRaw from "@/data/team2026.json";

interface TeamMember {
    id?: string;
    name: string;
    role: string;
    photo: string;
    quote: string;
    linkedin?: string;
    instagram?: string;
}

export default function AboutPage() {
    const president: TeamMember = teamDataRaw.president;
    const ipp: TeamMember = teamDataRaw.ipp;
    const secretary: TeamMember = teamDataRaw.secretary;
    const vice_president: TeamMember = teamDataRaw.vice_president;
    const joint_secretary: TeamMember = teamDataRaw.joint_secretary;
    const treasurer: TeamMember = teamDataRaw.treasurer;
    const sergeant_at_arms: TeamMember = teamDataRaw.sergeant_at_arms;
    const visionStatement: string = teamDataRaw.visionStatement;

    const remainingMembers: TeamMember[] = [
        ipp,
        secretary,
        vice_president,
        joint_secretary,
        treasurer,
        sergeant_at_arms
    ];

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HEADER SECTION ================= */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <Users className="w-4 h-4" />
                        <span>Leadership & Vision</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        About Us & Core Team
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Meet the passionate student leaders steering the Rotaract Club of BMSCE for the 2026–27 Rotaract year.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-16 space-y-20">

                {/* ================= VISION 2026–27 & PRESIDENT SECTION ================= */}
                <section className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* President Photo & Vision Quote Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">

                            {/* President Photo (Left) */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center h-full">
                                <div className="relative w-48 h-64 sm:w-56 sm:h-72 md:w-full md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden shadow-md border-2 border-rotaract-gold/30 bg-slate-50 group">
                                    <Image
                                        src={president.photo}
                                        alt={president.name}
                                        fill
                                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 flex flex-col justify-end p-4 text-white">
                                        <p className="text-xs font-semibold text-rotaract-gold uppercase tracking-wider">President</p>
                                        <p className="font-heading font-bold text-base">{president.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-3 text-slate-400">
                                    {president.linkedin && (
                                        <Link href={president.linkedin} target="_blank" className="p-1.5 rounded-full hover:bg-slate-100 hover:text-rotaract-navy transition-colors" aria-label="LinkedIn">
                                            <Linkedin className="w-4 h-4" />
                                        </Link>
                                    )}
                                    {president.instagram && (
                                        <Link href={president.instagram} target="_blank" className="p-1.5 rounded-full hover:bg-slate-100 hover:text-rotaract-cranberry transition-colors" aria-label="Instagram">
                                            <Instagram className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Vision Quote & Message (Right) */}
                            <div className="md:col-span-8 space-y-6">
                                <div className="flex items-center gap-2 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider">
                                    <Compass className="w-4 h-4" />
                                    <span>Vision 2026–27</span>
                                </div>

                                <div className="relative pl-6 md:pl-8 border-l-4 border-rotaract-cranberry space-y-4">
                                    <Quote className="w-8 h-8 text-rotaract-cranberry/40 absolute -left-4 -top-3 bg-white p-1" />
                                    <blockquote className="text-xl md:text-2xl font-heading font-medium text-rotaract-navy leading-relaxed italic">
                                        "{visionStatement}"
                                    </blockquote>
                                    <div className="pt-2">
                                        <p className="font-bold font-heading text-slate-900 text-base">{president.name}</p>
                                        <p className="text-xs text-rotaract-cranberry font-semibold">{president.role}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ================= CORE TEAM 2026–27 SECTION ================= */}
                <section className="space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <div className="inline-flex items-center gap-1.5 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            <span>Executive Leadership</span>
                        </div>
                        <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                            Core Team 2026–27
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500">
                            Organized by executive board and avenue directorships.
                        </p>
                    </div>

                    {/* REMAINING TEAM MEMBERS (EXCLUDING PRESIDENT) */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
                        {remainingMembers.map((member, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow text-center space-y-4 group relative flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-rotaract-cranberry via-rotaract-gold to-rotaract-navy shadow-md">
                                        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100">
                                            <Image
                                                src={member.photo}
                                                alt={member.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-heading font-bold text-xl text-rotaract-navy">
                                            {member.name}
                                        </h3>
                                        <p className="text-xs font-bold text-rotaract-cranberry uppercase tracking-wider mt-1">
                                            {member.role}
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-600 italic px-4 leading-relaxed font-light">
                                        "{member.quote}"
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-3 pt-2 text-slate-400 border-t border-slate-100/60 mt-4">
                                    {member.linkedin && (
                                        <Link href={member.linkedin} target="_blank" className="hover:text-rotaract-navy transition-colors" aria-label="LinkedIn">
                                            <Linkedin className="w-4 h-4" />
                                        </Link>
                                    )}
                                    {member.instagram && (
                                        <Link href={member.instagram} target="_blank" className="hover:text-rotaract-cranberry transition-colors" aria-label="Instagram">
                                            <Instagram className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </section>

            </main>

        </div>
    );
}