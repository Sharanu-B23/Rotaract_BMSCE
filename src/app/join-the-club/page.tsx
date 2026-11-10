"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Heart,
    Award,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Handshake,
    BookOpen,
    GraduationCap,
    Mail,
    Bell,
    ExternalLink,
    Calendar,
    Clock,
    Flame
} from "lucide-react";
import { FaInstagram as Instagram, FaLinkedin as Linkedin } from "react-icons/fa";

const FAQS = [
    {
        question: "Are membership registrations currently open?",
        answer: "No, official membership registrations for the current year are now closed. All further updates regarding the next recruitment cycle and open calls will be announced on our official social media channels."
    },
    {
        question: "Where will further updates be provided?",
        answer: "Further updates will be shared through our official social media platforms, primarily our Instagram (@rotaract_bmsce) and LinkedIn. Follow our pages to stay notified about upcoming recruitment drives, open volunteering opportunities, and campus announcements."
    },
    {
        question: "Can non-members attend Rotaract BMSCE events and initiatives?",
        answer: "Yes! Many of our signature speaker sessions, awareness drives, cultural celebrations, and campus fests are open to all students of BMS College of Engineering. You can check out our Upcoming Events page for passes and details."
    },
    {
        question: "Who is eligible to join when registrations reopen?",
        answer: "Any currently enrolled student of BMS College of Engineering (undergraduate or postgraduate) across all branches and academic years is eligible to apply during our open membership intake periods."
    },
    {
        question: "Do I need prior volunteering or leadership experience?",
        answer: "No prior experience is necessary! We value enthusiasm, teamwork, and willingness to contribute. Our senior board and alumni provide mentorship and support from day one."
    },
    {
        question: "How can I contact the Rotaract BMSCE board in the meantime?",
        answer: "You can reach out to us directly via our Contact Us page, send an email to rotaract@bmsce.ac.in, or drop a message on Instagram DM (@rotaract_bmsce). We would love to hear from you!"
    }
];

export default function JoinTheClubPage() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HERO BANNER ================= */}
            <section className="relative bg-gradient-to-b from-rotaract-dark via-rotaract-navy to-rotaract-dark text-white pt-28 pb-20 px-6 overflow-hidden">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-rotaract-cranberry/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 right-10 w-80 h-80 bg-rotaract-gold/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
                    {/* Status Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 border border-rose-400/30 text-xs font-bold text-rose-300 tracking-wide backdrop-blur-md shadow-sm"
                    >
                        <Clock className="w-4 h-4 text-rose-400" />
                        <span>Membership Registrations Closed for Current Year</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight"
                    >
                        Join the Club, <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rotaract-gold via-white to-rotaract-cranberry">
                            Lead the Impact
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto text-slate-300 text-sm md:text-lg font-light leading-relaxed"
                    >
                        Official Membership Intake of the Rotaract Club of BMSCE (RI District 3191).
                        Registrations for the current year are officially closed. Further updates will be shared through our official social media platforms.
                    </motion.p>
                </div>
            </section>

            {/* ================= MAIN CONTAINER ================= */}
            <main className="max-w-7xl mx-auto px-6 pt-16 space-y-20">

                {/* ================= REGISTRATIONS CLOSED SHOWCASE NOTICE ================= */}
                <section id="registrations-closed" className="scroll-mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden"
                    >
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-rotaract-navy via-rotaract-dark to-rotaract-cranberry text-white p-8 md:p-10 relative overflow-hidden">
                            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-rotaract-gold/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="relative z-10 space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rotaract-gold text-xs font-semibold">
                                    <Bell className="w-3.5 h-3.5" />
                                    <span>Official Club Notice</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-extrabold font-heading">
                                    Registrations for the Current Year are Closed
                                </h2>
                                <p className="text-slate-300 text-xs md:text-base font-light max-w-2xl leading-relaxed">
                                    Thank you to everyone who registered and showed tremendous enthusiasm to be part of Rotaract BMSCE! Membership registrations for the current tenure have officially concluded.
                                </p>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-8 md:p-12 space-y-10">

                            {/* Prominent Social Media Updates Callout */}
                            <div className="bg-gradient-to-br from-slate-50 via-rose-50/30 to-amber-50/40 p-6 md:p-8 rounded-2xl border border-slate-200/80 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rotaract-cranberry/10 text-rotaract-cranberry flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-lg md:text-xl font-extrabold font-heading text-rotaract-navy">
                                            Further Updates on Social Media
                                        </h3>
                                        <p className="text-slate-600 text-xs md:text-sm font-normal leading-relaxed">
                                            Stay tuned! All announcements regarding the next membership intake, special volunteering calls for upcoming flagship fests, and campus initiatives will be broadcasted on our social media platforms.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Official Social Media Platforms Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Connect With Us For Real-Time Announcements
                                    </span>
                                    <span className="text-[11px] font-semibold text-rotaract-cranberry">
                                        @rotaract_bmsce
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Instagram Card */}
                                    <a
                                        href="https://www.instagram.com/rotaract_bmsce/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-pink-300 hover:shadow-lg transition-all flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            <Instagram className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm text-slate-800 group-hover:text-rotaract-cranberry transition-colors font-heading">
                                                    Instagram
                                                </h4>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rotaract-cranberry transition-colors" />
                                            </div>
                                            <p className="text-xs font-mono text-rotaract-cranberry font-semibold mt-0.5">
                                                @rotaract_bmsce
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-light mt-1 line-clamp-2">
                                                Stories, live event recaps, induction updates & announcements.
                                            </p>
                                        </div>
                                    </a>

                                    {/* LinkedIn Card */}
                                    <a
                                        href="https://in.linkedin.com/company/rotaract-club-of-bmsce"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-lg transition-all flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            <Linkedin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm text-slate-800 group-hover:text-sky-700 transition-colors font-heading">
                                                    LinkedIn
                                                </h4>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                                            </div>
                                            <p className="text-xs font-mono text-sky-700 font-semibold mt-0.5">
                                                Rotaract Club of BMSCE
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-light mt-1 line-clamp-2">
                                                Professional networks, Rotary district updates & career impact.
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* What You Can Do in the Meantime */}
                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Explore More While Waiting for Future Openings
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Link
                                        href="/events"
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-rotaract-navy hover:shadow-md transition-all text-left group"
                                    >
                                        <Calendar className="w-5 h-5 text-rotaract-navy mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs font-bold text-slate-800">Campus Events</p>
                                        <p className="text-[11px] text-slate-500 font-light mt-1">Open event passes & registrations</p>
                                    </Link>

                                    <Link
                                        href="/showcase"
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-rotaract-cranberry hover:shadow-md transition-all text-left group"
                                    >
                                        <Flame className="w-5 h-5 text-rotaract-cranberry mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs font-bold text-slate-800">Club Showcase</p>
                                        <p className="text-[11px] text-slate-500 font-light mt-1">Flagship drives & initiatives</p>
                                    </Link>

                                    <Link
                                        href="/contact"
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-600 hover:shadow-md transition-all text-left group"
                                    >
                                        <Mail className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs font-bold text-slate-800">Contact Us</p>
                                        <p className="text-[11px] text-slate-500 font-light mt-1">Reach out to the executive team</p>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </section>

                {/* ================= WHY JOIN PILLARS ================= */}
                <section className="space-y-10">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 text-rotaract-cranberry font-bold text-xs uppercase tracking-wider">
                            <Award className="w-4 h-4" />
                            <span>Why Join Rotaract BMSCE?</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-rotaract-navy">
                            More Than Just a College Club
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base font-light">
                            Joining our family provides a transformative platform to explore your potential both on campus and beyond.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 group">
                            <div className="w-12 h-12 rounded-xl bg-rotaract-cranberry/10 text-rotaract-cranberry flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-rotaract-navy">
                                Tangible Social Impact
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-light">
                                Directly organize and volunteer in community drives, primary school mentoring, environmental campaigns, and health camps.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 group">
                            <div className="w-12 h-12 rounded-xl bg-rotaract-navy/10 text-rotaract-navy flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-rotaract-navy">
                                Executive Leadership
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-light">
                                Gain real-world experience managing budgets, chairing event committees, pitching sponsorships, and leading large teams.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-rotaract-navy">
                                Rotary & Alumni Network
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-light">
                                Build relationships with Rotary Club of Bangalore leaders, distinguished BMSCE alumni, and corporate industry mentors.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-rotaract-navy">
                                Verified Credentials
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-light">
                                Receive recognized Rotaract credentials, verified volunteering credit hours, and standout accomplishments for your resume.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================= INDUCTION CYCLE OVERVIEW ================= */}
                <section className="space-y-10">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 text-rotaract-cranberry font-bold text-xs uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" />
                            <span>The Induction Cycle</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-rotaract-navy">
                            How Recruitment Works
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base font-light">
                            An overview of what happens during our open membership induction periods.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">01</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Social Call for Applications
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Membership intake dates are announced through our official Instagram and LinkedIn pages.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">02</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Online Registration
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                BMSCE students submit their academic details, interests, and club membership enrollment.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">03</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Orientation & Welcome Meet
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                An energetic campus induction where new recruits meet the board, project heads, and fellow peers.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">04</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Active Projects & Leadership
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Lead community drives, participate in fests, and receive verified volunteering credentials.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
                <section className="space-y-8 max-w-4xl mx-auto">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-rotaract-navy font-bold text-xs uppercase tracking-wider">
                            <HelpCircle className="w-4 h-4 text-rotaract-gold" />
                            <span>Common Inquiries</span>
                        </div>
                        <h2 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm md:text-base text-slate-800 hover:text-rotaract-cranberry transition-colors"
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronDown
                                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-rotaract-cranberry" : "text-slate-400"
                                                }`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-5 pb-5 text-xs md:text-sm text-slate-600 font-light leading-relaxed border-t border-slate-100 pt-3"
                                            >
                                                {faq.answer}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ================= CONTACT SUPPORT BANNER ================= */}
                <section className="bg-gradient-to-r from-rotaract-navy to-rotaract-dark text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-bold font-heading">
                            Still have questions about Rotaract BMSCE?
                        </h3>
                        <p className="text-slate-300 text-xs md:text-sm font-light">
                            Our team is always open to chatting. Drop us a message or visit our campus desk!
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/contact"
                            className="px-6 py-3 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                        >
                            <span>Contact Us</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="https://www.instagram.com/rotaract_bmsce/"
                            target="_blank"
                            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-2"
                        >
                            <Instagram className="w-4 h-4" />
                            <span>Instagram DM</span>
                        </Link>
                    </div>
                </section>

            </main>

        </div>
    );
}
