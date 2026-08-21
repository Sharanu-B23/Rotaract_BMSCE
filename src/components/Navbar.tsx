"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/showcase", label: "Showcase" },
    { href: "/legacy", label: "Legacy" },
    { href: "/events", label: "Upcoming Events" },
    { href: "/newsletter", label: "Newsletter" },
    { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Scroll detection for backdrop effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile nav on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/90 backdrop-blur-md shadow-md border-b border-slate-200/80 py-3"
                : "bg-rotaract-dark/80 backdrop-blur-sm py-4 text-white"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* LOGO & BRANDING */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 md:w-11 md:h-11 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm p-1 overflow-hidden">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                                src="/rotaract-logo.png"
                                alt="Rotaract BMSCE Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span
                            className={`font-heading font-extrabold text-base md:text-lg leading-none tracking-tight transition-colors ${isScrolled ? "text-rotaract-navy" : "text-white"
                                }`}
                        >
                            Rotaract BMSCE
                        </span>
                        <span
                            className={`text-[10px] font-medium tracking-wider uppercase transition-colors ${isScrolled ? "text-slate-500" : "text-slate-300"
                                }`}
                        >
                            District 3191
                        </span>
                    </div>
                </Link>

                {/* DESKTOP NAVIGATION LINKS */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all ${isActive
                                    ? isScrolled
                                        ? "bg-rotaract-navy text-white"
                                        : "bg-white/20 text-white"
                                    : isScrolled
                                        ? "text-slate-600 hover:text-rotaract-navy hover:bg-slate-100"
                                        : "text-slate-200 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* DESKTOP PERSISTENT CTA */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        href="/events"
                        className="px-5 py-2.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white text-xs xl:text-sm font-bold shadow-md shadow-rotaract-cranberry/20 hover:shadow-lg transition-all flex items-center gap-2 group"
                    >
                        <span>Register</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* MOBILE HAMBURGER TOGGLE */}
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled
                        ? "bg-slate-100 text-slate-800"
                        : "bg-white/10 text-white"
                        }`}
                    aria-label="Toggle navigation menu"
                >
                    {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* MOBILE DRAWER MENU */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 text-slate-800 space-y-4 shadow-xl overflow-hidden"
                    >
                        <div className="flex flex-col gap-2">
                            {NAV_LINKS.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                            ? "bg-rotaract-navy text-white"
                                            : "hover:bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <Link
                                href="/events"
                                className="w-full py-3.5 rounded-xl bg-rotaract-cranberry text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <span>Register for Events</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}