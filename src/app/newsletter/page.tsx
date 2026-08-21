"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mail,
    Send,
    CheckCircle2,
    FileText,
    Download,
    ExternalLink,
    Sparkles,
    BookOpen
} from "lucide-react";

interface NewsletterIssue {
    id: string;
    title: string;
    monthYear: string;
    summary: string;
    coverImage: string;
    pdfUrl: string;
    isFeatured?: boolean;
}

const PAST_ISSUES: NewsletterIssue[] = [
    {
        id: "issue-july-2026",
        title: "The Rotaract Chronicle — July 2026 Edition",
        monthYear: "July 2026",
        summary: "Reflecting on our 2025–26 flagship achievements, welcoming incoming leadership, and launching Project Vidyadaan v2.",
        coverImage: "/images/newsletter/july-2026-cover.jpg",
        pdfUrl: "/docs/newsletters/july-2026.pdf",
        isFeatured: true,
    },
    {
        id: "issue-june-2026",
        title: "The Rotaract Chronicle — June 2026 Edition",
        monthYear: "June 2026",
        summary: "World Environment Day drives, eco-brick workshops, and inter-chapter fellowship stories.",
        coverImage: "/images/newsletter/june-2026-cover.jpg",
        pdfUrl: "/docs/newsletters/june-2026.pdf",
    },
    {
        id: "issue-may-2026",
        title: "The Rotaract Chronicle — May 2026 Edition",
        monthYear: "May 2026",
        summary: "Recap of the Corporate Ready 101 professional development series and youth leadership podcasts.",
        coverImage: "/images/newsletter/may-2026-cover.jpg",
        pdfUrl: "/docs/newsletters/may-2026.pdf",
    },
];

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const featuredIssue = PAST_ISSUES.find((i) => i.isFeatured) || PAST_ISSUES[0];
    const archiveIssues = PAST_ISSUES.filter((i) => !i.isFeatured);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
        }
    };

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HEADER SECTION ================= */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <Mail className="w-4 h-4" />
                        <span>Stay Connected & Informed</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        The Rotaract Newsletter
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Get monthly digests of our impact stories, upcoming event registrations, and youth leadership opportunities delivered straight to your inbox.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-16 space-y-20">

                {/* ================= SINGLE-FIELD SIGN-UP FORM ================= */}
                <section className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-12 shadow-sm max-w-3xl mx-auto text-center space-y-6 relative overflow-hidden">
                    <div className="w-14 h-14 bg-rotaract-cranberry/10 text-rotaract-cranberry rounded-2xl flex items-center justify-center mx-auto">
                        <Sparkles className="w-7 h-7" />
                    </div>

                    <div className="space-y-2 max-w-xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-rotaract-navy">
                            Subscribe for Monthly Updates
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed">
                            Zero spam. Unsubscribe anytime. Join 1,200+ members, alumni, and supporters.
                        </p>
                    </div>

                    {!isSubscribed ? (
                        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-slate-50 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-md shadow-rotaract-cranberry/20 text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <span>Subscribe</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium inline-flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>You're subscribed! Check your inbox for our latest edition.</span>
                        </motion.div>
                    )}
                </section>

                {/* ================= FEATURED ISSUE ================= */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Latest Publication</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
                        <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full bg-slate-100">
                            <Image
                                src={featuredIssue.coverImage}
                                alt={featuredIssue.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="text-xs font-bold uppercase tracking-wider bg-rotaract-cranberry text-white px-3 py-1 rounded-full shadow-md">
                                    Featured Issue
                                </span>
                            </div>
                        </div>

                        <div className="lg:col-span-7 p-8 md:p-12 space-y-6">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500">
                                    Published {featuredIssue.monthYear}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold font-heading text-rotaract-navy">
                                    {featuredIssue.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-light">
                                    {featuredIssue.summary}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link
                                    href={featuredIssue.pdfUrl}
                                    target="_blank"
                                    className="px-6 py-3 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <span>Read Issue (PDF)</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                                <a
                                    href={featuredIssue.pdfUrl}
                                    download
                                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= PAST ISSUES ARCHIVE ================= */}
                {archiveIssues.length > 0 && (
                    <section className="space-y-6">
                        <h3 className="font-heading font-bold text-2xl text-rotaract-navy">
                            Past Editions Archive
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {archiveIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>{issue.monthYear}</span>
                                            <FileText className="w-4 h-4 text-rotaract-cranberry" />
                                        </div>
                                        <h4 className="font-heading font-bold text-lg text-slate-900">
                                            {issue.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {issue.summary}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100">
                                        <Link
                                            href={issue.pdfUrl}
                                            target="_blank"
                                            className="text-xs font-semibold text-rotaract-cranberry hover:text-rotaract-navy transition-colors inline-flex items-center gap-1"
                                        >
                                            <span>View PDF Issue</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

        </div>
    );
}