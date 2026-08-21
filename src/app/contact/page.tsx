"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MapPin,
    Mail,
    Phone,
    Send,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import { FaLinkedin as Linkedin, FaInstagram as Instagram, FaFacebook as Facebook } from "react-icons/fa";

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* HEADER SECTION */}
            <section className="bg-gradient-to-b from-rotaract-dark to-rotaract-navy text-white pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-rotaract-gold">
                        <MessageSquare className="w-4 h-4" />
                        <span>Reach Out To Us</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight">
                        Contact Us
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-light leading-relaxed">
                        Have questions about joining, sponsoring an event, or collaborating with our chapter? We’d love to hear from you.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 pt-16 space-y-16">

                {/* FORM & DIRECT INFO GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Contact Form */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-rotaract-navy">
                                Send Us a Message
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500 mt-1">
                                Fill out the form below and our team will respond within 24–48 hours.
                            </p>
                        </div>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-slate-50 focus:bg-white transition-all"
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
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-slate-50 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        placeholder="Sponsorship / Membership Inquiry / General"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-slate-50 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={4}
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry text-sm bg-slate-50 focus:bg-white transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-md shadow-rotaract-cranberry/20 text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Send Message</span>
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                <h3 className="text-xl font-bold font-heading text-emerald-900">
                                    Message Sent Successfully!
                                </h3>
                                <p className="text-xs text-emerald-700 leading-relaxed">
                                    Thank you, <strong className="text-emerald-900">{formData.name}</strong>. Our team has received your message.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Direct Info & Contacts */}
                    <div className="lg:col-span-5 space-y-6">

                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
                            <h3 className="text-xl font-bold font-heading text-rotaract-navy border-b border-slate-100 pb-4">
                                Get In Touch
                            </h3>

                            <div className="space-y-4 text-xs md:text-sm text-slate-600">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-rotaract-cranberry/10 text-rotaract-cranberry rounded-xl flex-shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-800 block">Official Email</span>
                                        <a href="mailto:rotaract@bmsce.ac.in" className="hover:text-rotaract-cranberry transition-colors">
                                            rotaract@bmsce.ac.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-rotaract-cranberry/10 text-rotaract-cranberry rounded-xl flex-shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-800 block">Campus Address</span>
                                        <p className="leading-relaxed">
                                            BMS College of Engineering, Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560019
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Leadership Queries */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-rotaract-navy">
                                    Leadership Contact
                                </h4>
                                <div className="text-xs space-y-2 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-rotaract-cranberry" />
                                        <span><strong className="text-slate-800">President:</strong> +91 99024 37934</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Sponsored by <strong>Rotary Club of Banashankari</strong></p>
                                </div>
                            </div>

                            {/* Social Channels */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-rotaract-navy">
                                    Social Channels
                                </h4>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="https://www.instagram.com/rotaract_bmsce/"
                                        target="_blank"
                                        className="p-3 bg-slate-100 hover:bg-rotaract-cranberry hover:text-white text-slate-600 rounded-xl transition-all"
                                    >
                                        <Instagram className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="https://in.linkedin.com/company/rotaract-club-of-bmsce"
                                        target="_blank"
                                        className="p-3 bg-slate-100 hover:bg-rotaract-navy hover:text-white text-slate-600 rounded-xl transition-all"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* GOOGLE MAP */}
                <section className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm p-3">
                    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden relative">
                        <iframe
                            title="BMS College of Engineering Location Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.2711681989445!2d77.56271937588047!3d12.954452015243176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1592715c4e7f%3A0x7f032220d91244e8!2sBMS%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </section>

            </main>

        </div>
    );
}