"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
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
    Image as ImageIcon,
    Key,
    ExternalLink,
    Clock,
    Laptop
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
    const [adminUserEmail, setAdminUserEmail] = useState<string>("");
    const [loginTab, setLoginTab] = useState<"passcode" | "google">("passcode");
    const [selectedAdminProfile, setSelectedAdminProfile] = useState<string>("rtrsharan318@gmail.com");
    const [customAdminEmail, setCustomAdminEmail] = useState<string>("");
    const [passcode, setPasscode] = useState("");
    const [loginError, setLoginError] = useState("");

    // Allowed Admin profiles configured in .env.local
    const allowedEmailsEnv = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || "";
    const allowedEmails = allowedEmailsEnv
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    const adminProfiles = allowedEmails.length > 0 ? allowedEmails : [
        "rtrsharan318@gmail.com",
        "rtrsamyakr@gmail.com",
        "rtrhimashree@gmail.com"
    ];

    // Active Tab: 'members' | 'events'
    const [activeTab, setActiveTab] = useState<"members" | "events">("members");

    // --- MEMBER REGISTRATION FORM STATE ---
    const [memberForm, setMemberForm] = useState({
        fullName: "",
        usn: "",
        collegeEmail: "",
        personalEmail: "",
        yearOfStudy: "1st Year",
        phone: "",
        bloodGroup: "Prefer not to say",
        membershipType: "RI - Rotary International membership",
        payeeName: "",
        timestamp: "",
    });
    const [registrationDesk, setRegistrationDesk] = useState<string>("Desk 1 (Sharan)");
    const [isSubmittingMember, setIsSubmittingMember] = useState(false);
    const [memberSubmittedSuccess, setMemberSubmittedSuccess] = useState(false);
    const [memberError, setMemberError] = useState("");

    // Auto-detect and persist registration desk / device for simultaneous multi-person registrations
    useEffect(() => {
        const savedDesk = localStorage.getItem("rotaract_admin_desk");
        if (savedDesk) {
            setRegistrationDesk(savedDesk);
        } else if (adminUserEmail.toLowerCase().includes("samyak")) {
            setRegistrationDesk("Desk 2 (Samyak)");
        } else if (adminUserEmail.toLowerCase().includes("hima")) {
            setRegistrationDesk("Desk 3 (Himashree)");
        } else {
            setRegistrationDesk("Desk 1 (Sharan)");
        }
    }, [adminUserEmail]);

    const handleDeskChange = (desk: string) => {
        setRegistrationDesk(desk);
        localStorage.setItem("rotaract_admin_desk", desk);
    };

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
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsAuthenticating(true);
                setLoginError("");

                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch user profile from Google");
                }

                const userData = await res.json();
                const userEmail = (userData.email || "").toLowerCase().trim();

                if (!userEmail) {
                    setLoginError("Could not retrieve email address from the selected Google account.");
                    setIsAuthenticating(false);
                    return;
                }

                // Get configured allowed emails list
                const allowedEmailsEnv = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || "";
                const allowedEmails = allowedEmailsEnv
                    .split(",")
                    .map((e) => e.trim().toLowerCase())
                    .filter(Boolean);

                // If whitelist is set, enforce matching
                if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
                    setLoginError(`Access denied for ${userEmail}. This Google account is not on the admin whitelist.`);
                    setIsAuthenticating(false);
                    return;
                }

                localStorage.setItem("rotaract_admin_auth", "true");
                localStorage.setItem("rotaract_admin_user", userEmail || "Authorized Admin");
                setAdminUserEmail(userEmail || "Authorized Admin");
                setIsAuthenticated(true);
                setLoginError("");
            } catch (e) {
                console.error("Auth Decode Error:", e);
                setLoginError("Failed to verify Google credentials. Please try again.");
            } finally {
                setIsAuthenticating(false);
            }
        },
        onError: (err) => {
            console.error("Google Sign-In Error:", err);
            setLoginError("Google Sign-In was cancelled or failed. Please try again.");
            setIsAuthenticating(false);
        },
        onNonOAuthError: (nonOAuthError) => {
            if (nonOAuthError.type === "popup_failed_to_open") {
                setLoginError("Pop-up window was blocked by your browser. Please allow pop-ups for this site to choose your Google Account.");
            } else if (nonOAuthError.type === "popup_closed") {
                setLoginError("Account selection was cancelled (pop-up closed).");
            }
            setIsAuthenticating(false);
        },
        prompt: "select_account",
    });

    // Handle Passcode Login
    const handlePasscodeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        const chosenEmail = (selectedAdminProfile === "custom" ? customAdminEmail : selectedAdminProfile).trim().toLowerCase();

        if (!chosenEmail) {
            setLoginError("Please choose or enter an authorized admin email address.");
            return;
        }

        if (!passcode) {
            setLoginError("Please enter your admin passcode.");
            return;
        }

        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode: passcode.trim(), email: chosenEmail }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setLoginError(data.error || "Incorrect admin passcode.");
                return;
            }

            localStorage.setItem("rotaract_admin_auth", "true");
            localStorage.setItem("rotaract_admin_user", chosenEmail);
            setAdminUserEmail(chosenEmail);
            setIsAuthenticated(true);
            setLoginError("");
        } catch {
            const expectedPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "rotaract2026";
            if (passcode.trim() === expectedPasscode.trim()) {
                localStorage.setItem("rotaract_admin_auth", "true");
                localStorage.setItem("rotaract_admin_user", chosenEmail);
                setAdminUserEmail(chosenEmail);
                setIsAuthenticated(true);
                setLoginError("");
            } else {
                setLoginError("Incorrect admin passcode.");
            }
        }
    };

    // Restore existing admin session on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem("rotaract_admin_auth");
        const storedUser = localStorage.getItem("rotaract_admin_user");
        if (storedAuth === "true" && storedUser) {
            setIsAuthenticated(true);
            setAdminUserEmail(storedUser);
        }
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
        try {
            googleLogout();
        } catch {
            // ignore if not initialized
        }
        setIsAuthenticated(false);
        localStorage.removeItem("rotaract_admin_auth");
        localStorage.removeItem("rotaract_admin_user");
        setAdminUserEmail("");
        setLoginError("");
    };

    // Handle Member Submit
    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingMember(true);
        setMemberError("");
        setMemberSubmittedSuccess(false);

        const now = new Date();
        const currentTimestamp =
            (memberForm.timestamp && memberForm.timestamp.trim()) ||
            now.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
            });

        try {
            const payload = {
                type: "NEW_MEMBER_REGISTRATION",
                receiptId: `RTR-ADM-${Date.now().toString().slice(-6)}`,
                desk: registrationDesk,
                device: registrationDesk,
                fullName: memberForm.fullName,
                usn: memberForm.usn,
                collegeEmail: memberForm.collegeEmail,
                personalEmail: memberForm.personalEmail,
                yearOfStudy: memberForm.yearOfStudy,
                phone: memberForm.phone,
                bloodGroup: memberForm.bloodGroup,
                membershipType: memberForm.membershipType,
                payeeName: memberForm.payeeName,
                amount: memberForm.membershipType.startsWith("RI") ? 800 : 320,
                timestamp: currentTimestamp,
                registeredAt: currentTimestamp,
                addedBy: adminUserEmail || registrationDesk,
            };

            const response = await fetch("/api/admin/register-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to record member registration into Google Sheet.");
            }

            setIsSubmittingMember(false);
            setMemberSubmittedSuccess(true);
            setMemberForm({
                fullName: "",
                usn: "",
                collegeEmail: "",
                personalEmail: "",
                yearOfStudy: "1st Year",
                phone: "",
                bloodGroup: "Prefer not to say",
                membershipType: "RI - Rotary International membership",
                payeeName: "",
                timestamp: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }),
            });
        } catch (err) {
            console.error("Member registration error:", err);
            setIsSubmittingMember(false);
            setMemberError("Failed to record member registration. Check network connection.");
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
                            Rotaract Club of BMSCE • Executive & Board Management
                        </p>
                    </div>

                    {/* Login Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginTab("passcode");
                                setLoginError("");
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                loginTab === "passcode"
                                    ? "bg-white text-rotaract-navy shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Key className="w-3.5 h-3.5 text-rotaract-gold" />
                            <span>Admin Passcode</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginTab("google");
                                setLoginError("");
                            }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                loginTab === "google"
                                    ? "bg-white text-rotaract-navy shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Google OAuth</span>
                        </button>
                    </div>

                    {loginError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{loginError}</span>
                        </div>
                    )}

                    {/* TAB 1: PASSCODE LOGIN */}
                    {loginTab === "passcode" && (
                        <form onSubmit={handlePasscodeLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Choose Admin Email</label>
                                <select
                                    value={selectedAdminProfile}
                                    onChange={(e) => setSelectedAdminProfile(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rotaract-gold"
                                >
                                    {adminProfiles.map((email) => (
                                        <option key={email} value={email}>
                                            {email} {email === "rtrsharan318@gmail.com" ? "★ (Lead Admin)" : "(Board Admin)"}
                                        </option>
                                    ))}
                                    <option value="custom">Enter custom admin email...</option>
                                </select>
                            </div>

                            {selectedAdminProfile === "custom" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Custom Admin Email</label>
                                    <input
                                        type="email"
                                        placeholder="admin@rotaractbmsce.org"
                                        value={customAdminEmail}
                                        onChange={(e) => setCustomAdminEmail(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rotaract-gold"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-slate-700">Admin Passcode</label>
                                    <span className="text-[10px] text-slate-400 font-mono">rotaract2026</span>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter admin passcode"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rotaract-gold"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-rotaract-navy hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                            >
                                <ShieldCheck className="w-4 h-4 text-rotaract-gold" />
                                <span>Sign In to Admin Dashboard</span>
                            </button>

                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>Instant local login for whitelisted Rotaract BMSCE admins</span>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: GOOGLE OAUTH */}
                    {loginTab === "google" && (
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginError("");
                                    loginWithGoogle({ prompt: "select_account" });
                                }}
                                disabled={isAuthenticating}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-sm hover:shadow text-sm font-semibold text-slate-700 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                            >
                                {isAuthenticating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-rotaract-cranberry" />
                                        <span>Verifying Google Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        <span>Sign in with Google</span>
                                    </>
                                )}
                            </button>

                            {/* Origin mismatch troubleshooting guide */}
                            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-2 leading-relaxed">
                                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <span>Seeing "Error 400: origin_mismatch"?</span>
                                </div>
                                <p className="text-slate-600">
                                    Google OAuth rejects the popup before showing the account picker because <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">http://localhost:3000</code> is not registered in Google Cloud Console.
                                </p>
                                <p className="text-slate-700 font-medium">
                                    💡 <strong>Instant fix:</strong> Switch to the <button type="button" onClick={() => setLoginTab("passcode")} className="text-rotaract-navy underline font-bold">Admin Passcode</button> tab above to log in immediately with your whitelisted email!
                                </p>
                            </div>
                        </div>
                    )}
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
                            Manage club registrations, member records & live events.
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
                        <span>Register New Member</span>
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
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold font-heading text-rotaract-navy flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-rotaract-cranberry" />
                                    Register New Rotaract Member
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Record and enroll verified club members with academic, contact, and membership payment details.
                                </p>
                            </div>

                            {/* Device / Desk Switcher for simultaneous multi-person registrations */}
                            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl self-start md:self-auto shadow-sm">
                                <div className="w-7 h-7 rounded-xl bg-rotaract-navy text-rotaract-gold flex items-center justify-center">
                                    <Laptop className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Current Device / Desk</span>
                                    <select
                                        value={registrationDesk}
                                        onChange={(e) => handleDeskChange(e.target.value)}
                                        className="bg-transparent text-xs font-bold text-rotaract-navy focus:outline-none cursor-pointer pr-2"
                                    >
                                        <option value="Desk 1 (Sharan)">Desk 1 (Sharan)</option>
                                        <option value="Desk 2 (Samyak)">Desk 2 (Samyak)</option>
                                        <option value="Desk 3 (Himashree)">Desk 3 (Himashree)</option>
                                        <option value="Desk 4 (Support Desk)">Desk 4 (Support Desk)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {memberSubmittedSuccess && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Member Successfully Registered!</p>
                                    <p className="text-[11px] text-emerald-700">
                                        Member details and payment records have been securely added.
                                    </p>
                                </div>
                            </div>
                        )}

                        {memberError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{memberError}</span>
                            </div>
                        )}

                        <form onSubmit={handleMemberSubmit} className="space-y-6">
                            {/* Personal & College Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Student & Academic Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Rahul Sharma"
                                            value={memberForm.fullName}
                                            onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            USN *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 1BM23CS001"
                                            value={memberForm.usn}
                                            onChange={(e) => setMemberForm({ ...memberForm, usn: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            College Email ID *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="rahul.cs23@bmsce.ac.in"
                                            value={memberForm.collegeEmail}
                                            onChange={(e) => setMemberForm({ ...memberForm, collegeEmail: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Personal Email ID *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="rahulsharma@gmail.com"
                                            value={memberForm.personalEmail}
                                            onChange={(e) => setMemberForm({ ...memberForm, personalEmail: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Year of Study *
                                        </label>
                                        <select
                                            value={memberForm.yearOfStudy}
                                            onChange={(e) => setMemberForm({ ...memberForm, yearOfStudy: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        >
                                            <option>1st Year</option>
                                            <option>2nd Year</option>
                                            <option>3rd Year</option>
                                            <option>4th Year</option>
                                            <option>Postgraduate / Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Phone (WhatsApp Enabled) *
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
                                            Blood Group <span className="font-normal text-slate-400">(If willing to donate)</span>
                                        </label>
                                        <select
                                            value={memberForm.bloodGroup}
                                            onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white"
                                        >
                                            <option value="Prefer not to say">Prefer not to say</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Membership & Payment Details */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Membership Type & Payment Verification
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Type of Membership *
                                        </label>
                                        <select
                                            value={memberForm.membershipType}
                                            onChange={(e) => setMemberForm({ ...memberForm, membershipType: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white font-medium"
                                        >
                                            <option value="RI - Rotary International membership">RI - Rotary International membership</option>
                                            <option value="RM - Rotaract Club membership">RM - Rotaract Club membership</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Payee Name <span className="font-normal text-slate-400">(If paid online)</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Account holder name on UPI (if paid online)"
                                            value={memberForm.payeeName}
                                            onChange={(e) => setMemberForm({ ...memberForm, payeeName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Timestamp
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const now = new Date();
                                                    setMemberForm({
                                                        ...memberForm,
                                                        timestamp: now.toLocaleString("en-IN", {
                                                            dateStyle: "medium",
                                                            timeStyle: "short",
                                                        }),
                                                    });
                                                }}
                                                className="text-[10px] text-rotaract-cranberry hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                            >
                                                <Clock className="w-3 h-3" />
                                                <span>Now</span>
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. 01/10/2026, 06:45 PM"
                                            value={memberForm.timestamp}
                                            onChange={(e) => setMemberForm({ ...memberForm, timestamp: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-slate-50 text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmittingMember}
                                    className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isSubmittingMember ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Registering Member...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>Register Member</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
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
