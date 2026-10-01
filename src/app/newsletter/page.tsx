"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Mail,
    FileText,
    ExternalLink,
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
        id: "pragati-2025-edition-2",
        title: "Pragati 2025 - Edition 2",
        monthYear: "2025",
        summary: "The second edition of our official newsletter for 2025 highlighting community initiatives, flagship club events, leadership drives, and impactful member stories.",
        coverImage: "/images/newsletter2.png",
        pdfUrl: "https://drive.google.com",
        isFeatured: true,
    },
    {
        id: "pragati-2025-edition-1",
        title: "Pragati 2025 - Edition 1",
        monthYear: "2025",
        summary: "The first edition of our annual newsletter for 2025 highlighting community initiatives, club events, and impactful stories.",
        coverImage: "/rotaract-logo.png",
        pdfUrl: "https://heyzine.com/flip-book/309902de05.html",
    },
];

export default function NewsletterPage() {
    const featuredIssue = PAST_ISSUES.find((i) => i.isFeatured) || PAST_ISSUES[0];
    const archiveIssues = PAST_ISSUES.filter((i) => !i.isFeatured);

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
                        Explore our latest publication and digest of impact stories, event highlights, and youth leadership achievements.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-12 space-y-16">

                {/* ================= FEATURED ISSUE ================= */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-rotaract-cranberry font-semibold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Latest Publication</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
                        <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full bg-slate-900 p-8 flex items-center justify-center min-h-[300px]">
                            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                                <Image
                                    src={featuredIssue.coverImage}
                                    alt={featuredIssue.title}
                                    fill
                                    className="object-contain filter drop-shadow-lg"
                                />
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="text-xs font-bold uppercase tracking-wider bg-rotaract-cranberry text-white px-3 py-1 rounded-full shadow-md">
                                    Latest Edition
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
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-rotaract-cranberry/20"
                                >
                                    <span>Open</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
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
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-rotaract-cranberry hover:text-rotaract-navy transition-colors inline-flex items-center gap-1"
                                        >
                                            <span>Open</span>
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