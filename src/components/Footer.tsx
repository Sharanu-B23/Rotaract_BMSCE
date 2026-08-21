"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Send,
    CheckCircle2,
    Heart
} from "lucide-react";
import { FaLinkedin as Linkedin, FaInstagram as Instagram } from "react-icons/fa";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleMiniSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
        }
    };

    return (
        <footer className="bg-rotaract-dark text-white pt-16 pb-12 border-t border-slate-800 font-body">
            <div className="max-w-7xl mx-auto px-6 space-y-12">

                {/* TOP GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

                    {/* BRAND COL */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-11 md:h-11 flex-shrink-0 bg-white rounded-full flex items-center justify-center p-1 shadow-sm overflow-hidden">
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    <Image
                                        src="/rotaract-logo.png"
                                        alt="Rotaract Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <span className="font-heading font-extrabold text-xl text-white">
                                Rotaract BMSCE
                            </span>
                        </div>

                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light">
                            Official website of the Rotaract Club of BMS College of Engineering. Sponsored by the <strong>Rotary Club of Banashankari</strong> • District 3191.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href="https://www.instagram.com/rotaract_bmsce/"
                                target="_blank"
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-rotaract-cranberry text-white transition-all"
                            >
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link
                                href="https://in.linkedin.com/company/rotaract-club-of-bmsce"
                                target="_blank"
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-rotaract-navy text-white transition-all"
                            >
                                <Linkedin className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* SITEMAP QUICK LINKS */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="font-heading font-bold text-sm text-rotaract-gold uppercase tracking-wider">
                            Quick Navigation
                        </h4>
                        <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Team 2026–27</Link></li>
                            <li><Link href="/showcase" className="hover:text-white transition-colors">Flagships & Showcase</Link></li>
                            <li><Link href="/legacy" className="hover:text-white transition-colors">10-Year Legacy Archive</Link></li>
                            <li><Link href="/events" className="hover:text-white transition-colors">Upcoming Events & Passes</Link></li>
                            <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter Archive</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us & Campus Map</Link></li>
                        </ul>
                    </div>

                    {/* MINI NEWSLETTER SIGNUP */}
                    <div className="lg:col-span-5 space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-heading font-bold text-sm text-white">
                            Subscribe to Monthly Digest
                        </h4>
                        <p className="text-slate-300 text-xs font-light">
                            Get upcoming event notifications and monthly community stories directly in your inbox.
                        </p>

                        {!isSubscribed ? (
                            <form onSubmit={handleMiniSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rotaract-gold"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                    <span>Join</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        ) : (
                            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Subscribed successfully!</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* BOTTOM COPYRIGHT STRIP */}
                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 Rotaract Club of BMSCE. Sponsored by Rotary Club of Banashankari.</p>
                    <p className="flex items-center gap-1">
                        <span>Crafted with passion by the BMSCE Web Team</span>
                        <Heart className="w-3.5 h-3.5 text-rotaract-cranberry fill-rotaract-cranberry" />
                    </p>
                </div>

            </div>
        </footer>
    );
}