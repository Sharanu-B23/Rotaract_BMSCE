"use client";

import Link from "next/link";
import Image from "next/image";
import {
    MapPin,
    Mail,
    Phone
} from "lucide-react";
import { FaLinkedin as Linkedin, FaInstagram as Instagram } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-rotaract-dark text-white pt-16 pb-12 border-t border-slate-800 font-body">
            <div className="max-w-7xl mx-auto px-6 space-y-12">

                {/* TOP GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

                    {/* BRAND COL */}
                    <div className="lg:col-span-5 space-y-4">
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

                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light max-w-sm">
                            Official website of the Rotaract Club of BMS College of Engineering. Sponsored by the <strong>Rotary Club of Banashankari</strong> • RI District 3191.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href="https://www.instagram.com/rotaract_bmsce/"
                                target="_blank"
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-rotaract-cranberry text-white transition-all"
                                aria-label="Rotaract BMSCE Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link
                                href="https://in.linkedin.com/company/rotaract-club-of-bmsce"
                                target="_blank"
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-rotaract-navy text-white transition-all"
                                aria-label="Rotaract BMSCE LinkedIn"
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
                            <li><Link href="/join-the-club" className="hover:text-white transition-colors">Join the Club</Link></li>
                            <li><Link href="/showcase" className="hover:text-white transition-colors">Flagships & Showcase</Link></li>
                            <li><Link href="/legacy" className="hover:text-white transition-colors">10-Year Legacy Archive</Link></li>
                            <li><Link href="/events" className="hover:text-white transition-colors">Upcoming Events & Passes</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us & Campus Map</Link></li>
                        </ul>
                    </div>

                    {/* CAMPUS & CONTACT INFO */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="font-heading font-bold text-sm text-rotaract-gold uppercase tracking-wider">
                            Campus & Contact
                        </h4>
                        <div className="space-y-3 text-xs md:text-sm text-slate-300 font-light">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-rotaract-cranberry mt-0.5 flex-shrink-0" />
                                <span>BMS College of Engineering, Bull Temple Road, Basavanagudi, Bengaluru - 560019</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-rotaract-cranberry flex-shrink-0" />
                                <a href="mailto:rotaract@bmsce.ac.in" className="hover:text-white transition-colors">
                                    rotaract@bmsce.ac.in
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-rotaract-cranberry flex-shrink-0" />
                                <span>+91 99024 37934</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM COPYRIGHT STRIP */}
                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 Rotaract Club of BMSCE. Sponsored by Rotary Club of Bangalore Banashankari.</p>
                </div>

            </div>
        </footer>
    );
}