"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import {
    Lock,
    UserPlus,
    Calendar,
    LogOut,
    CheckCircle2,
    Loader2,
    Plus,
    Trash2,
    Edit3,
    FileSpreadsheet,
    ShieldCheck,
    AlertCircle,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import upcomingEventsRaw from "@/data/upcomingEvents.json";

interface EventItem {
    id: string;
    title: string;
    banner: string;
    date: string;
    time: string;
    venue: string;
    shortDescription: string;
    spotsLeft: number;
    totalSpots: number;
    deadline: string;
    category: string;
    audience?: "everyone" | "members" | "ri_members";
}

export default function AdminPortalPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [loginError, setLoginError] = useState("");

    // Active Tab: 'members' | 'events'
    const [activeTab, setActiveTab] = useState<"members" | "events">("members");

    // --- MEMBER REGISTRATION FORM STATE ---
    const [memberForm, setMemberForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        usn: "",
        department: "",
        academicYear: "1st Year",
        role: "General Member",
    });
    const [isSubmittingMember, setIsSubmittingMember] = useState(false);
    const [memberSubmittedSuccess, setMemberSubmittedSuccess] = useState(false);
    const [memberError, setMemberError] = useState("");

    // --- EVENT MANAGEMENT STATE ---
    const [eventsList, setEventsList] = useState<EventItem[]>([]);
    const [eventForm, setEventForm] = useState<Partial<EventItem>>({
        title: "",
        banner: "/images/events/blood-donation-banner.jpg",
        date: "",
        time: "",
        venue: "",
        shortDescription: "",
        spotsLeft: 50,
        totalSpots: 100,
        deadline: "",
        category: "Community Service",
        audience: "everyone",
    });
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [eventSuccessMsg, setEventSuccessMsg] = useState("");

    // Account Picker Modal state
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [adminUserEmail, setAdminUserEmail] = useState<string>("");

    const googleAccounts = [
        { name: "Rotaract BMSCE Admin", email: "rotaract@bmsce.ac.in", avatar: "R" },
        { name: "President Rotaract", email: "president.rotaract@bmsce.ac.in", avatar: "P" },
        { name: "Secretary Rotaract", email: "secretary.rotaract@bmsce.ac.in", avatar: "S" },
    ];

    const handleSelectGoogleAccount = (acc: { name: string; email: string }) => {
        localStorage.setItem("rotaract_admin_auth", "true");
        localStorage.setItem("rotaract_admin_user", acc.email);
        setAdminUserEmail(acc.email);
        setIsAuthenticated(true);
        setShowGoogleModal(false);
    };

    // Clear auth state on mount and unmount so leaving/switching pages logs out the admin
    useEffect(() => {
        // Clear session on unmount or navigation away
        return () => {
            localStorage.removeItem("rotaract_admin_auth");
            localStorage.removeItem("rotaract_admin_user");
        };
    }, []);

    // Load custom events from localStorage or fallback to JSON
    useEffect(() => {
        const storedEvents = localStorage.getItem("rotaract_events_data");
        if (storedEvents) {
            try {
                setEventsList(JSON.parse(storedEvents));
            } catch (e) {
                setEventsList(upcomingEventsRaw as EventItem[]);
            }
        } else {
            setEventsList(upcomingEventsRaw as EventItem[]);
        }
    }, []);

    // Save events to localStorage whenever modified
    const saveEventsToStorage = (updatedList: EventItem[]) => {
        setEventsList(updatedList);
        localStorage.setItem("rotaract_events_data", JSON.stringify(updatedList));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("rotaract_admin_auth");
        localStorage.removeItem("rotaract_admin_user");
    };

    // Handle Member Submit to Sheets
    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingMember(true);
        setMemberError("");
        setMemberSubmittedSuccess(false);

        const memberSheetUrl = process.env.NEXT_PUBLIC_MEMBER_SHEET_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

        if (!memberSheetUrl) {
            setMemberError("Google Script URL environment variable is missing.");
            setIsSubmittingMember(false);
            return;
        }

        try {
            const payload = JSON.stringify({
                type: "NEW_MEMBER_REGISTRATION",
                fullName: memberForm.fullName,
                email: memberForm.email,
                phone: memberForm.phone,
                usn: memberForm.usn,
                department: memberForm.department,
                academicYear: memberForm.academicYear,
                role: memberForm.role,
                addedBy: adminUserEmail || "Admin",
                registeredAt: new Date().toISOString(),
            });

            // Send payload as text/plain to bypass CORS preflight restrictions in Google Apps Script
            await fetch(memberSheetUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: payload,
            });

            setIsSubmittingMember(false);
            setMemberSubmittedSuccess(true);
            setMemberForm({
                fullName: "",
                email: "",
                phone: "",
                usn: "",
                department: "",
                academicYear: "1st Year",
                role: "General Member",
            });
        } catch (err) {
            console.error("Sheet save error:", err);
            setIsSubmittingMember(false);
            setMemberError("Failed to transmit data to Google Sheets. Check network connection.");
        }
    };

    // Handle Event Save / Update
    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventForm.title || !eventForm.date || !eventForm.venue) return;

        let updatedEvents: EventItem[];

        if (isEditingEvent && eventForm.id) {
            updatedEvents = eventsList.map((ev) => (ev.id === eventForm.id ? (eventForm as EventItem) : ev));
        } else {
            const newEvent: EventItem = {
                id: `evt-${Date.now()}`,
                title: eventForm.title || "",
                banner: eventForm.banner || "/images/events/blood-donation-banner.jpg",
                date: eventForm.date || "",
                time: eventForm.time || "10:00 AM IST",
                venue: eventForm.venue || "",
                shortDescription: eventForm.shortDescription || "",
                spotsLeft: Number(eventForm.spotsLeft) || 50,
                totalSpots: Number(eventForm.totalSpots) || 100,
                deadline: eventForm.deadline || "Registration open until full",
                category: eventForm.category || "Community Service",
                audience: eventForm.audience || "everyone",
            };
            updatedEvents = [newEvent, ...eventsList];
        }

        saveEventsToStorage(updatedEvents);
        setEventForm({
            title: "",
            banner: "/images/events/blood-donation-banner.jpg",
            date: "",
            time: "",
            venue: "",
            shortDescription: "",
            spotsLeft: 50,
            totalSpots: 100,
            deadline: "",
            category: "Community Service",
            audience: "everyone",
        });
        setIsEditingEvent(false);
        setEventSuccessMsg(isEditingEvent ? "Event updated successfully!" : "New event created live!");
        setTimeout(() => setEventSuccessMsg(""), 4000);
    };

    const handleDeleteEvent = (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const updated = eventsList.filter((ev) => ev.id !== id);
            saveEventsToStorage(updated);
        }
    };

    const handleEditEvent = (ev: EventItem) => {
        setEventForm(ev);
        setIsEditingEvent(true);
    };

    // ================= LOGIN SCREEN =================
    if (!isAuthenticated) {
        return (
            <div className="w-full min-h-screen bg-rotaract-dark flex items-center justify-center p-6 pt-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6 z-10"
                >
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-rotaract-navy text-rotaract-gold rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Lock className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-rotaract-navy">Admin Portal Login</h2>
                        <p className="text-xs text-slate-500">
                            Sign in with your authorized Google Account to manage member registrations and portal events.
                        </p>
                    </div>

                    {loginError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <div className="space-y-4 pt-2 flex flex-col items-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                try {
                                    if (!credentialResponse.credential) {
                                        setLoginError("Failed to retrieve Google credentials.");
                                        return;
                                    }
                                    // Parse JWT payload base64 string
                                    const base64Url = credentialResponse.credential.split('.')[1];
                                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                    }).join(''));
                                    
                                    const userData = JSON.parse(jsonPayload);
                                    const userEmail = userData.email ? userData.email.toLowerCase() : "";

                                    // Get configured allowed emails list
                                    const allowedEmailsEnv = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || "";
                                    const allowedEmails = allowedEmailsEnv
                                        .split(",")
                                        .map((e) => e.trim().toLowerCase())
                                        .filter(Boolean);

                                    // If whitelist is set, enforce matching
                                    if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
                                        setLoginError(`Access denied for ${userEmail}. Account is not on the admin whitelist.`);
                                        return;
                                    }

                                    localStorage.setItem("rotaract_admin_auth", "true");
                                    localStorage.setItem("rotaract_admin_user", userEmail || "Authorized Admin");
                                    setAdminUserEmail(userEmail || "Authorized Admin");
                                    setIsAuthenticated(true);
                                    setLoginError("");
                                } catch (e) {
                                    console.error("Auth Decode Error:", e);
                                    setLoginError("Failed to verify Google token.");
                                }
                            }}
                            onError={() => {
                                setLoginError("Google Sign-In was unsuccessful. Please try again.");
                            }}
                            useOneTap
                        />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Google Single Sign-On enabled for administrators</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ================= MAIN ADMIN DASHBOARD =================
    return (
        <div className="w-full min-h-screen bg-slate-50 pt-24 pb-20 font-body">
            {/* Header Banner */}
            <div className="bg-rotaract-dark text-white py-10 px-6 border-b border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Authenticated Admin: {adminUserEmail || "rotaract@bmsce.ac.in"}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold font-heading">Rotaract Admin Dashboard</h1>
                        <p className="text-slate-400 text-xs md:text-sm">
                            No database needed • Direct Google Sheets synchronization & live event updates.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start md:self-auto border border-white/10"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-6xl mx-auto px-6 -mt-6">
                <div className="bg-white rounded-2xl p-2 shadow-md border border-slate-200 inline-flex gap-2">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
                            activeTab === "members"
                                ? "bg-rotaract-navy text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Register New Member (Google Sheets)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
                            activeTab === "events"
                                ? "bg-rotaract-navy text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Update Events Website ({eventsList.length})</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-6 pt-8">
                {/* TAB 1: MEMBER REGISTRATION */}
                {activeTab === "members" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-xl font-bold font-heading text-rotaract-navy flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-rotaract-cranberry" />
                                    Register New Rotaract Member
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Submitting this form adds new member details directly to your configured Google Sheet registry.
                                </p>
                            </div>

                            {memberSubmittedSuccess && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Member Successfully Registered!</p>
                                        <p className="text-[11px] text-emerald-700">
                                            Data transmitted to connected Google Sheet.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {memberError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                                    {memberError}
                                </div>
                            )}

                            <form onSubmit={handleMemberSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Ananya Sharma"
                                            value={memberForm.fullName}
                                            onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="ananya@bmsce.ac.in"
                                            value={memberForm.email}
                                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Phone / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 9876543210"
                                            value={memberForm.phone}
                                            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            USN / Roll Number
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1BM23CS001"
                                            value={memberForm.usn}
                                            onChange={(e) => setMemberForm({ ...memberForm, usn: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CSE / ISE / ECE"
                                            value={memberForm.department}
                                            onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Academic Year
                                        </label>
                                        <select
                                            value={memberForm.academicYear}
                                            onChange={(e) => setMemberForm({ ...memberForm, academicYear: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        >
                                            <option>1st Year</option>
                                            <option>2nd Year</option>
                                            <option>3rd Year</option>
                                            <option>4th Year</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Club Role
                                        </label>
                                        <select
                                            value={memberForm.role}
                                            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        >
                                            <option>General Member</option>
                                            <option>Core Committee</option>
                                            <option>Director</option>
                                            <option>Executive Board</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmittingMember}
                                        className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingMember ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Transmitting to Google Sheet...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileSpreadsheet className="w-4 h-4" />
                                                <span>Register & Sync to Sheet</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Info / Sheets Setup Card */}
                        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold font-heading">Google Sheets Integration</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Your website connects directly to Google Apps Script. No database setup, hosting fees, or backend maintenance required!
                                </p>

                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1">
                                    <p className="font-semibold text-rotaract-gold">Configured Webhook URL:</p>
                                    <p className="font-mono truncate text-slate-400">
                                        {process.env.NEXT_PUBLIC_MEMBER_SHEET_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "Using standard default endpoint"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-rotaract-gold/10 text-rotaract-gold border border-rotaract-gold/20 rounded-xl text-[11px]">
                                💡 Tip: You can set <code className="bg-black/30 px-1 py-0.5 rounded">NEXT_PUBLIC_MEMBER_SHEET_URL</code> in your environment variables to link any custom Google Sheet.
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: UPDATE EVENTS */}
                {activeTab === "events" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Form */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-lg font-bold font-heading text-rotaract-navy flex items-center gap-2">
                                    {isEditingEvent ? <Edit3 className="w-5 h-5 text-rotaract-gold" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                                    {isEditingEvent ? "Edit Event Details" : "Create New Event"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Events saved here appear instantly on the live website events page.
                                </p>
                            </div>

                            {eventSuccessMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                                    {eventSuccessMsg}
                                </div>
                            )}

                            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Rotaract Orientation 2026"
                                        value={eventForm.title}
                                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={eventForm.date}
                                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={eventForm.time}
                                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Venue *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="BMSCE Main Auditorium"
                                        value={eventForm.venue}
                                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                                    <select
                                        value={eventForm.category}
                                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                    >
                                        <option>Community Service</option>
                                        <option>Professional Dev</option>
                                        <option>Club Service</option>
                                        <option>International Service</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Target Audience Eligibility *</label>
                                    <select
                                        value={eventForm.audience || "everyone"}
                                        onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white font-medium text-rotaract-navy"
                                    >
                                        <option value="everyone">Everyone (Open to All)</option>
                                        <option value="members">Only Members (Requires Membership ID)</option>
                                        <option value="ri_members">Only RI Members (Requires RI Membership ID)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Event Poster Image *</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 font-semibold text-xs">
                                                <Upload className="w-4 h-4 text-rotaract-navy" />
                                                <span>{eventForm.banner ? "Change Poster File" : "Upload Poster Image"}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setEventForm({ ...eventForm, banner: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {eventForm.banner && (
                                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                                <img
                                                    src={eventForm.banner}
                                                    alt="Poster Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                                                    Poster Preview
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief summary of the event..."
                                        value={eventForm.shortDescription}
                                        onChange={(e) => setEventForm({ ...eventForm, shortDescription: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                    />
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{isEditingEvent ? "Update Event" : "Add Event Live"}</span>
                                    </button>
                                    {isEditingEvent && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingEvent(false);
                                                setEventForm({
                                                    title: "",
                                                    banner: "/images/events/blood-donation-banner.jpg",
                                                    date: "",
                                                    time: "",
                                                    venue: "",
                                                    shortDescription: "",
                                                    spotsLeft: 50,
                                                    totalSpots: 100,
                                                    deadline: "",
                                                    category: "Community Service",
                                                });
                                            }}
                                            className="px-3 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Events List Display */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-base font-bold font-heading text-rotaract-navy flex items-center justify-between">
                                <span>Active Portal Events</span>
                                <span className="text-xs font-normal text-slate-500">Stored dynamically in browser cache</span>
                            </h3>

                            <div className="space-y-3">
                                {eventsList.map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-rotaract-cranberry uppercase px-2 py-0.5 rounded-md bg-rotaract-cranberry/10">
                                                    {ev.category}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-700 uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                                                    {ev.audience === "members" ? "🔒 Only Members" : ev.audience === "ri_members" ? "🎖️ Only RI Members" : "🌐 Everyone"}
                                                </span>
                                            </div>
                                            <h4 className="font-bold font-heading text-slate-800 text-base">{ev.title}</h4>
                                            <p className="text-xs text-slate-500">
                                                📅 {ev.date} • 🕒 {ev.time} • 📍 {ev.venue}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <button
                                                onClick={() => handleEditEvent(ev)}
                                                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(ev.id)}
                                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
