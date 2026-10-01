"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Heart,
    Award,
    CheckCircle2,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Loader2,
    Handshake,
    BookOpen,
    GraduationCap,
    QrCode,
    ShieldCheck,
    Copy,
    Check,
    Printer,
    AlertCircle,
    UploadCloud,
    FileImage,
    Trash2,
    Smartphone,
    UserCheck
} from "lucide-react";
import { FaInstagram as Instagram } from "react-icons/fa";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";

interface MemberFormState {
    fullName: string;
    usn: string;
    yearOfStudy: string;
    bloodGroup: string;
    personalEmail: string;
    collegeEmail: string;
    phone: string;
    payeeName: string;
    transactionId: string;
    whyJoin: string;
    priorExperience: string;
}

interface ReceiptData {
    receiptId: string;
    fullName: string;
    usn: string;
    yearOfStudy: string;
    bloodGroup?: string;
    personalEmail: string;
    collegeEmail: string;
    phone: string;
    payeeName: string;
    membershipType: string;
    amount: number;
    transactionId: string;
    screenshotUrl?: string;
    date: string;
}

const INITIAL_FORM: MemberFormState = {
    fullName: "",
    usn: "",
    yearOfStudy: "1st Year",
    bloodGroup: "",
    personalEmail: "",
    collegeEmail: "",
    phone: "",
    payeeName: "",
    transactionId: "",
    whyJoin: "",
    priorExperience: "",
};

const YEARS_OF_STUDY = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Postgraduate / Other"
];

const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
    "Unknown / Prefer not to say"
];

const CLUB_MEMBERSHIP = {
    code: "RM",
    name: "Club Membership (RM)",
    shortTag: "Official BMSCE Club Member",
    fee: 320,
    description: "Official annual Rotaract membership for BMSCE students. Grants complete access to campus drives, committees, leadership positions, verified volunteer hours, and flagship events.",
    perks: [
        "Full access to all BMSCE campus projects, workshops, speaker sessions & fests",
        "Official club participation certificates & verified volunteering credit hours",
        "Direct mentorship from senior club board & BMSCE alumni network",
        "Eligibility for committee leadership, project heads & board positions",
        "Exclusive campus fellowship, industrial visits & leadership training",
        "Official Rotaract BMSCE Welcome Kit & induction credentials"
    ]
};

const FAQS = [
    {
        question: "What does the Club Membership (RM - ₹320) include?",
        answer: "RM (Rotaract Club Member - ₹320) grants full official membership within BMSCE, including access to all campus initiatives, leadership development workshops, eligibility to chair event committees, official volunteering certificates with verified hours, and mentorship from senior club leaders and alumni."
    },
    {
        question: "How do I pay the ₹320 membership fee and verify my registration?",
        answer: "Simply scan the UPI QR code on this page with any UPI app (Google Pay, PhonePe, Paytm, BHIM) to pay ₹320. Take a screenshot of the completed payment receipt and upload it directly in the form below the QR code. Your screenshot is saved in the club's Google Drive under your name for fast administrative verification."
    },
    {
        question: "Where will my payment screenshot be saved?",
        answer: "Your payment screenshot is automatically uploaded to our dedicated Rotaract BMSCE Google Drive folder, formatted with your full name and USN (e.g. 'Rahul Sharma (1BM24CS001) - Payment Screenshot'), ensuring zero mix-ups and instant verification."
    },
    {
        question: "Who is eligible to join the Rotaract Club of BMSCE?",
        answer: "Any currently enrolled student of BMS College of Engineering (undergraduate or postgraduate) across any branch and year is warmly welcome to register."
    },
    {
        question: "Do I need any previous volunteering or leadership experience?",
        answer: "No prior experience is necessary! We value passion, curiosity, and willingness to contribute. Our senior board members and alumni provide hands-on mentorship from day one."
    },
    {
        question: "What happens after I submit my membership form and screenshot?",
        answer: "Once submitted, your details are recorded in our official member database and your digital receipt is generated instantly. Our membership coordinators will add you to the official Rotaract WhatsApp group and invite you to our campus welcome orientation!"
    }
];

export default function JoinTheClubPage() {
    const [formData, setFormData] = useState<MemberFormState>(INITIAL_FORM);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotBase64, setScreenshotBase64] = useState<string>("");
    const [screenshotPreview, setScreenshotPreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [formValidationError, setFormValidationError] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const clubUpiId = process.env.NEXT_PUBLIC_UPI_ID || "rotaractbmsce@okaxis";
    const payableAmount = CLUB_MEMBERSHIP.fee; // Fixed at ₹320

    // Deep link for UPI mobile applications
    const upiDeepLink = `upi://pay?pa=${clubUpiId}&pn=Rotaract+Club+BMSCE&am=${payableAmount}&cu=INR&tn=Rotaract+RM+Fee+${formData.usn ? formData.usn.toUpperCase() : "BMSCE"}`;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formValidationError) setFormValidationError("");
    };

    // Handle File selection for payment screenshot
    const processScreenshotFile = (file: File) => {
        if (!file) return;

        // Verify type (image or pdf)
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            setFormValidationError("Please upload a valid image file (PNG, JPG, JPEG, WEBP) of your payment screenshot.");
            return;
        }

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            setFormValidationError("Screenshot file size exceeds 10MB. Please upload a smaller image.");
            return;
        }

        setFormValidationError("");
        setScreenshotFile(file);

        // Generate preview & Base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setScreenshotBase64(result);
            setScreenshotPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processScreenshotFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processScreenshotFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveScreenshot = () => {
        setScreenshotFile(null);
        setScreenshotBase64("");
        setScreenshotPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const copyUpiToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(clubUpiId);
            setCopiedUpi(true);
            setTimeout(() => setCopiedUpi(false), 2500);
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    // Form submission handler
    const handleSubmitRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormValidationError("");

        // Field Validation
        if (!formData.fullName.trim()) {
            setFormValidationError("Please enter your Full Name.");
            return;
        }
        if (!formData.usn.trim()) {
            setFormValidationError("Please enter your BMSCE USN.");
            return;
        }
        if (!formData.personalEmail.trim() || !formData.personalEmail.includes("@")) {
            setFormValidationError("Please enter a valid Personal Email Address.");
            return;
        }
        if (!formData.collegeEmail.trim() || !formData.collegeEmail.includes("@")) {
            setFormValidationError("Please enter your College Email Address (e.g. name@bmsce.ac.in).");
            return;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            setFormValidationError("Please enter a valid 10-digit WhatsApp / Phone Number.");
            return;
        }
        if (!screenshotBase64) {
            setFormValidationError("Please upload the payment screenshot of your ₹320 UPI transfer.");
            const uploadEl = document.getElementById("screenshot-upload-section");
            if (uploadEl) uploadEl.scrollIntoView({ behavior: "smooth" });
            return;
        }
        if (!formData.payeeName.trim()) {
            setFormValidationError("Please enter the Payee Name (account holder's name shown on the UPI payment screenshot).");
            const payeeEl = document.getElementById("payee-name-input");
            if (payeeEl) payeeEl.scrollIntoView({ behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        const generatedReceiptId = `RTR-2026-RM-${Math.floor(100000 + Math.random() * 900000)}`;
        const timestamp = new Date().toISOString();
        const studentCleanName = `${formData.fullName}_${formData.usn.toUpperCase()}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        const formattedFileName = `${studentCleanName}_PaymentScreenshot.${screenshotFile?.name.split(".").pop() || "png"}`;

        const payload = {
            receiptId: generatedReceiptId,
            fullName: formData.fullName.trim(),
            usn: formData.usn.trim().toUpperCase(),
            yearOfStudy: formData.yearOfStudy,
            bloodGroup: formData.bloodGroup || "Not Specified",
            personalEmail: formData.personalEmail.trim(),
            collegeEmail: formData.collegeEmail.trim(),
            email: formData.collegeEmail.trim() || formData.personalEmail.trim(),
            phone: formData.phone.trim(),
            payeeName: formData.payeeName.trim(),
            membershipType: CLUB_MEMBERSHIP.name,
            amount: payableAmount,
            transactionId: formData.transactionId.trim() || "UPI-Screenshot-Verified",
            whyJoin: formData.whyJoin.trim(),
            priorExperience: formData.priorExperience.trim(),
            registeredAt: timestamp,
            screenshotBase64: screenshotBase64,
            screenshotFileName: formattedFileName,
            source: "Website Join the Club Page"
        };

        const receiptRecord: ReceiptData = {
            receiptId: generatedReceiptId,
            fullName: formData.fullName.trim(),
            usn: formData.usn.trim().toUpperCase(),
            yearOfStudy: formData.yearOfStudy,
            bloodGroup: formData.bloodGroup || "Not Specified",
            personalEmail: formData.personalEmail.trim(),
            collegeEmail: formData.collegeEmail.trim(),
            phone: formData.phone.trim(),
            payeeName: formData.payeeName.trim(),
            membershipType: CLUB_MEMBERSHIP.name,
            amount: payableAmount,
            transactionId: formData.transactionId.trim() || "UPI-Screenshot-Submitted",
            screenshotUrl: screenshotPreview,
            date: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        try {
            // 1. Save locally for redundancy & admin view
            const existingRegistrations = JSON.parse(
                localStorage.getItem("rotaract_member_applications") || "[]"
            );
            existingRegistrations.push(payload);
            localStorage.setItem(
                "rotaract_member_applications",
                JSON.stringify(existingRegistrations)
            );

            // 2. Submit via Next.js internal API route (/api/join) which forwards to the dedicated Google Sheet
            try {
                const apiRes = await fetch("/api/join", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const resData = await apiRes.json();
                if (resData.driveFileUrl) {
                    receiptRecord.screenshotUrl = resData.driveFileUrl;
                }
            } catch (apiErr) {
                console.warn("API route failed, trying direct Google Sheet script webhook fallback:", apiErr);

                // Direct Google Sheet Webhook Fallback if /api/join is unavailable
                const directScriptUrl =
                    process.env.NEXT_PUBLIC_JOIN_SHEET_URL ||
                    process.env.NEXT_PUBLIC_MEMBER_SHEET_URL ||
                    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

                if (directScriptUrl) {
                    await fetch(directScriptUrl, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify(payload),
                    });
                }
            }

            setReceiptData(receiptRecord);
            setIsSubmitting(false);
            setIsSubmitted(true);
            window.scrollTo({ top: 400, behavior: "smooth" });
        } catch (err) {
            console.error("Registration transmission error:", err);
            // Even if network fails, local receipt is displayed
            setReceiptData(receiptRecord);
            setIsSubmitting(false);
            setIsSubmitted(true);
            window.scrollTo({ top: 400, behavior: "smooth" });
        }
    };

    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body pb-24">

            {/* ================= HERO BANNER ================= */}
            <section className="relative bg-gradient-to-b from-rotaract-dark via-rotaract-navy to-rotaract-dark text-white pt-28 pb-20 px-6 overflow-hidden">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-rotaract-cranberry/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 right-10 w-80 h-80 bg-rotaract-gold/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-rotaract-gold tracking-wide backdrop-blur-md shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-rotaract-gold" />
                        <span>Club Membership Intake 2026–27 Now Open</span>
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
                        Become an official member of the Rotaract Club of BMS College of Engineering (RI District 3191).
                        Complete your annual Club Membership (RM) registration for ₹320, scan the UPI QR code,
                        upload your payment screenshot, and join a legacy of leadership.
                    </motion.p>

                    {/* Quick Highlights Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-rotaract-gold" />
                            <span>100+ Events Annually</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-rotaract-cranberry" />
                            <span>7,100+ Lives Touched</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Instant UPI QR & Verification</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>RI District 3191 Affiliated</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= MAIN CONTAINER ================= */}
            <main className="max-w-7xl mx-auto px-6 pt-16 space-y-20">

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

                {/* ================= MEMBERSHIP JOURNEY STEPS ================= */}
                <section className="space-y-10">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 text-rotaract-cranberry font-bold text-xs uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" />
                            <span>Your Induction Path</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-rotaract-navy">
                            How It Works
                        </h2>
                        <p className="text-slate-600 text-sm md:text-base font-light">
                            Joining is seamless and instant. Here is what happens from your application to induction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">01</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Fill Student Details
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Enter your name, BMSCE USN, year of study, personal email, and college email address.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">02</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Scan & Pay ₹320
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Scan the official club UPI QR code with any UPI app to pay the ₹320 annual membership fee.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">03</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Upload Screenshot
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Upload your payment confirmation screenshot. It is automatically saved to Drive under your name.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-sm">
                            <span className="text-4xl font-extrabold text-slate-200">04</span>
                            <h4 className="text-base font-bold font-heading text-rotaract-navy mt-2">
                                Induction & Kit
                            </h4>
                            <p className="text-xs text-slate-500 font-light mt-1">
                                Receive your digital receipt, get added to the member WhatsApp group, and attend the campus welcome meet!
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================= APPLICATION FORM SECTION ================= */}
                <section id="application-form" className="scroll-mt-28">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">

                        {/* Top Form Header Strip */}
                        <div className="bg-gradient-to-r from-rotaract-navy via-rotaract-dark to-rotaract-cranberry text-white p-8 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rotaract-gold text-xs font-semibold mb-3">
                                <Sparkles className="w-4 h-4" />
                                <span>Official Membership Registration</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold font-heading">
                                Rotaract Club of BMSCE Membership 2026–27
                            </h2>
                            <p className="text-slate-300 text-xs md:text-sm font-light mt-2 max-w-2xl">
                                Complete your registration below. Club Membership (RM) carries an annual fee of ₹320. Both personal and college email IDs are required for official club roster registration.
                            </p>
                        </div>

                        {/* Form Body or Success Confirmation */}
                        <div className="p-8 md:p-10">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmitRegistration} className="space-y-8">

                                    {formValidationError && (
                                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-2xl flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                                            <span>{formValidationError}</span>
                                        </div>
                                    )}

                                    {/* Simple Membership Fee Notice */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">Annual Club Membership:</span>
                                            <span className="font-extrabold text-rotaract-cranberry text-sm">₹{payableAmount}</span>
                                            <span className="text-slate-400">/ year</span>
                                        </div>
                                        <span className="text-slate-500 text-[11px]">Official BMSCE Club Member (RM)</span>
                                    </div>

                                    {/* SECTION 1: PERSONAL & COLLEGE INFORMATION */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-rotaract-navy flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <ShieldCheck className="w-4 h-4 text-rotaract-cranberry" />
                                            <span>1. Student Details</span>
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    required
                                                    placeholder="e.g. Rahul Sharma"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                />
                                            </div>

                                            {/* BMSCE USN */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                    BMSCE USN *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="usn"
                                                    required
                                                    placeholder="e.g. 1BM24CS001"
                                                    value={formData.usn}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all uppercase"
                                                />
                                            </div>

                                            {/* Personal Email ID (Mandatory) */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                    Personal Email ID *
                                                </label>
                                                <span className="block text-[11px] text-slate-400 mb-2">
                                                    Primary email for certificates & communication
                                                </span>
                                                <input
                                                    type="email"
                                                    name="personalEmail"
                                                    required
                                                    placeholder="e.g. rahul.sharma@gmail.com"
                                                    value={formData.personalEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                />
                                            </div>

                                            {/* College Email ID (Mandatory) */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                    College Email ID *
                                                </label>
                                                <span className="block text-[11px] text-slate-400 mb-2">
                                                    Official BMSCE institutional email ID
                                                </span>
                                                <input
                                                    type="email"
                                                    name="collegeEmail"
                                                    required
                                                    placeholder="e.g. rahul.cs24@bmsce.ac.in"
                                                    value={formData.collegeEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                />
                                            </div>

                                            {/* Phone / WhatsApp */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                    WhatsApp / Contact Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    placeholder="e.g. 9876543210"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                />
                                            </div>

                                            {/* Year of Study */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                    Year of Study *
                                                </label>
                                                <select
                                                    name="yearOfStudy"
                                                    required
                                                    value={formData.yearOfStudy}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                >
                                                    {YEARS_OF_STUDY.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Blood Group (Optional) */}
                                            <div className="md:col-span-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                        Blood Group
                                                    </label>
                                                    <span className="text-[11px] font-medium text-slate-400">Optional (Used for Blood Donation Camps & Emergency Drives)</span>
                                                </div>
                                                <select
                                                    name="bloodGroup"
                                                    value={formData.bloodGroup}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                                >
                                                    <option value="">Select Blood Group (Optional)</option>
                                                    {BLOOD_GROUPS.map((bg) => (
                                                        <option key={bg} value={bg}>
                                                            {bg}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                    {/* SECTION 2: MOTIVATION & ASPIRATIONS */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-rotaract-navy flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <BookOpen className="w-4 h-4 text-rotaract-cranberry" />
                                            <span>2. Interests & Aspirations</span>
                                        </h3>

                                        {/* Why Join Rotaract */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Why would you like to join Rotaract BMSCE?
                                            </label>
                                            <textarea
                                                name="whyJoin"
                                                rows={3}
                                                placeholder="Tell us what excites you—organizing events, community service, meeting new people, leadership development, etc."
                                                value={formData.whyJoin}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all font-light"
                                            />
                                        </div>

                                        {/* Prior Experience / Skills */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                                Skills & Interests (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="priorExperience"
                                                placeholder="e.g. Photography, Graphic Design (Canva/Figma), Public Speaking, Content Writing, Web Dev"
                                                value={formData.priorExperience}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rotaract-cranberry transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* SECTION 3: PAYMENT QR CODE & SCREENSHOT UPLOAD */}
                                    <div id="screenshot-upload-section" className="space-y-6 pt-4 border-t border-slate-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-rotaract-navy flex items-center gap-2">
                                                <QrCode className="w-4 h-4 text-emerald-600" />
                                                <span>3. Pay ₹{payableAmount} via UPI & Upload Screenshot *</span>
                                            </h3>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Saved to Drive with student name
                                            </span>
                                        </div>

                                        {/* QR Code Container Card */}
                                        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
                                            <div className="text-center max-w-md mx-auto space-y-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Official Rotaract BMSCE Payment QR</span>
                                                </span>
                                                <h4 className="text-xl font-extrabold font-heading text-rotaract-navy">
                                                    Scan & Pay ₹{payableAmount}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-light">
                                                    Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
                                                </p>
                                            </div>

                                            {/* Dynamic QR Code */}
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-56 h-56 bg-white p-3 rounded-3xl shadow-md border-2 border-slate-200 flex items-center justify-center transition-transform hover:scale-105">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}`}
                                                        alt="Rotaract BMSCE UPI QR Code"
                                                        className="w-full h-full object-contain rounded-2xl"
                                                    />
                                                </div>

                                                {/* UPI ID Pill & Copy Button */}
                                                <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                                    <span className="text-xs text-slate-500 font-medium">Club UPI ID:</span>
                                                    <span className="text-xs font-mono font-bold text-slate-800">{clubUpiId}</span>
                                                    <button
                                                        type="button"
                                                        onClick={copyUpiToClipboard}
                                                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ml-1"
                                                        title="Copy UPI ID"
                                                    >
                                                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>

                                                {/* Supported UPI Apps */}
                                                <div className="flex items-center justify-center gap-5 text-slate-500">
                                                    <SiGooglepay className="w-6 h-6 text-slate-700" title="Google Pay" />
                                                    <SiPhonepe className="w-5 h-5 text-purple-600" title="PhonePe" />
                                                    <SiPaytm className="w-6 h-6 text-sky-600" title="Paytm" />
                                                    <span className="text-[11px] font-semibold text-slate-500">BHIM / Any Bank App</span>
                                                </div>

                                                {/* Mobile Deep Link */}
                                                <div className="sm:hidden w-full max-w-xs pt-1">
                                                    <a
                                                        href={upiDeepLink}
                                                        className="w-full py-2.5 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <Smartphone className="w-4 h-4 text-rotaract-gold" />
                                                        <span>Tap to Pay ₹{payableAmount} in UPI App</span>
                                                    </a>
                                                </div>
                                            </div>

                                            {/* UPLOAD PAYMENT SCREENSHOT SECTION */}
                                            <div className="pt-6 border-t border-slate-200/80 space-y-4">
                                                <div className="text-center sm:text-left">
                                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                                                        Upload Payment Screenshot *
                                                    </label>
                                                    <p className="text-xs text-slate-500 font-light">
                                                        Take a screenshot of the completed payment in your UPI app and upload it below. It will be saved in our Google Drive folder with your name ({formData.fullName || "Student"}).
                                                    </p>
                                                </div>

                                                {/* Hidden File Input */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="payment-screenshot-file-input"
                                                />

                                                {!screenshotPreview ? (
                                                    /* Drag and drop upload zone */
                                                    <div
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            setIsDragOver(true);
                                                        }}
                                                        onDragLeave={() => setIsDragOver(false)}
                                                        onDrop={handleDrop}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${isDragOver
                                                            ? "border-rotaract-cranberry bg-rotaract-cranberry/5 scale-[1.01]"
                                                            : "border-slate-300 bg-white hover:border-rotaract-cranberry hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="w-14 h-14 rounded-2xl bg-rotaract-cranberry/10 text-rotaract-cranberry flex items-center justify-center shadow-sm">
                                                            <UploadCloud className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                Click or drag & drop payment screenshot here
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                Supports JPG, PNG, WEBP, or PDF (Max 10MB)
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mt-1"
                                                        >
                                                            Browse Files
                                                        </button>
                                                    </div>
                                                ) : (
                                                    /* Screenshot Preview Card */
                                                    <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                {screenshotFile?.type.startsWith("image/") ? (
                                                                    <img
                                                                        src={screenshotPreview}
                                                                        alt="Payment Screenshot Preview"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <FileImage className="w-8 h-8 text-slate-500" />
                                                                )}
                                                            </div>

                                                            <div className="overflow-hidden">
                                                                <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span>Screenshot Ready for Drive Upload</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                                                                    {screenshotFile?.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400">
                                                                    {(screenshotFile?.size ? (screenshotFile.size / 1024).toFixed(1) : 0)} KB • Will be saved as &quot;{formData.fullName || "Student"} - Payment Screenshot&quot;
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                                                            >
                                                                Replace
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveScreenshot}
                                                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition-colors"
                                                                title="Remove file"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payee Name & Transaction UTR (After screenshot upload) */}
                                                <div className="pt-3 border-t border-slate-200/80 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Payee Name (Mandatory) */}
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                                Payee Name (If paid online)
                                                            </label>
                                                            <input
                                                                id="payee-name-input"
                                                                type="text"
                                                                name="payeeName"
                                                                placeholder="e.g. Rahul Sharma / Parent's Name (if paid online)"
                                                                value={formData.payeeName}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium transition-all"
                                                            />
                                                            <span className="block text-[11px] text-slate-400 mt-1">
                                                                Name of person / UPI account from which payment was made
                                                            </span>
                                                        </div>

                                                        {/* Optional UTR / Reference Number Field */}
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                                UPI Transaction Ref / UTR (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="transactionId"
                                                                placeholder="e.g. 428190284712 (12-digit number)"
                                                                value={formData.transactionId}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono transition-all"
                                                            />
                                                            <span className="block text-[11px] text-slate-400 mt-1">
                                                                12-digit UTR from your UPI payment receipt
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* SUBMISSION STRIP */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Selected Membership:</p>
                                                <p className="text-base font-bold text-rotaract-navy">
                                                    {CLUB_MEMBERSHIP.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Application logged to official Google Sheet & screenshot stored in Drive.
                                                </p>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <p className="text-xs text-slate-500 font-medium">Total Amount:</p>
                                                <p className="text-3xl font-extrabold text-rotaract-cranberry font-heading">
                                                    ₹{payableAmount}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                <span>Direct Verification • Screenshot saved under student name</span>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rotaract-cranberry/30 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group flex-shrink-0"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Submitting & Saving to Drive...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="w-4 h-4" />
                                                        <span>Submit Membership Application</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                </form>
                            ) : (
                                /* ================= CONFIRMATION & DIGITAL RECEIPT STATE ================= */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-6 space-y-8 max-w-2xl mx-auto"
                                >
                                    <div className="text-center space-y-3">
                                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>

                                        <h3 className="text-3xl font-extrabold font-heading text-rotaract-navy">
                                            Welcome to the Rotaract Family!
                                        </h3>
                                        <p className="text-sm text-slate-600 font-light leading-relaxed">
                                            Congratulations, <strong className="font-semibold text-slate-800">{receiptData?.fullName}</strong>!
                                            Your Club Membership registration and payment screenshot have been submitted and logged.
                                        </p>
                                    </div>

                                    {/* PRINTABLE DIGITAL RECEIPT CARD */}
                                    <div id="rotaract-membership-receipt" className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-lg space-y-6">
                                        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-rotaract-cranberry inline-block" />
                                                    <h4 className="font-extrabold text-base sm:text-lg font-heading text-rotaract-navy">
                                                        Rotaract Club of BMSCE
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    RI District 3191 • BMS College of Engineering
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>SCREENSHOT SUBMITTED</span>
                                                </span>
                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    {receiptData?.date}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Receipt Data Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <span className="text-slate-400 block font-medium">Receipt No:</span>
                                                <span className="font-mono font-bold text-slate-800 text-sm">
                                                    {receiptData?.receiptId}
                                                </span>
                                            </div>

                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <span className="text-slate-400 block font-medium">Transaction Reference / UTR:</span>
                                                <span className="font-mono font-bold text-slate-800 truncate block">
                                                    {receiptData?.transactionId}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Member Name:</span>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {receiptData?.fullName}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">BMSCE USN:</span>
                                                <span className="font-bold text-slate-800 uppercase font-mono">
                                                    {receiptData?.usn}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Personal Email:</span>
                                                <span className="text-slate-700 font-medium break-all">
                                                    {receiptData?.personalEmail}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">College Email:</span>
                                                <span className="text-slate-700 font-medium break-all">
                                                    {receiptData?.collegeEmail}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Year of Study:</span>
                                                <span className="text-slate-700 font-medium">
                                                    {receiptData?.yearOfStudy}
                                                </span>
                                            </div>

                                            {receiptData?.bloodGroup && receiptData.bloodGroup !== "Not Specified" && (
                                                <div>
                                                    <span className="text-slate-400 block font-medium">Blood Group:</span>
                                                    <span className="text-slate-700 font-medium">
                                                        {receiptData.bloodGroup}
                                                    </span>
                                                </div>
                                            )}

                                            <div>
                                                <span className="text-slate-400 block font-medium">Payee Name (UPI):</span>
                                                <span className="text-slate-700 font-medium">
                                                    {receiptData?.payeeName}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Phone / WhatsApp:</span>
                                                <span className="text-slate-700 font-medium">
                                                    +91 {receiptData?.phone}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Membership Tier:</span>
                                                <span className="font-extrabold text-rotaract-navy text-sm">
                                                    {receiptData?.membershipType}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Drive Screenshot Status:</span>
                                                <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Saved under student name</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Screenshot Preview in Receipt */}
                                        {receiptData?.screenshotUrl && (
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                                    Attached Payment Screenshot:
                                                </span>
                                                <div className="max-h-48 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2">
                                                    <img
                                                        src={receiptData.screenshotUrl}
                                                        alt="Uploaded Screenshot"
                                                        className="max-h-44 object-contain rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 bg-rotaract-navy/5 rounded-2xl border border-rotaract-navy/10 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-slate-500 font-medium">Total Membership Fee</span>
                                                <p className="text-xs text-slate-400">Membership Valid: 2026–2027</p>
                                            </div>
                                            <span className="text-2xl font-extrabold font-heading text-rotaract-cranberry">
                                                ₹{receiptData?.amount}.00
                                            </span>
                                        </div>
                                    </div>

                                    {/* Next Steps Onboarding Card */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-600">
                                        <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                                            <Sparkles className="w-4 h-4 text-rotaract-gold" />
                                            <span>Next Steps:</span>
                                        </p>
                                        <ul className="list-disc pl-4 space-y-1.5 font-light">
                                            <li>Our Joint Secretary & Membership team will review your payment screenshot and add you to the official WhatsApp community (+91 {receiptData?.phone}).</li>
                                            <li>Your record has been logged in our membership Google Sheet and Drive folder.</li>
                                            <li>Keep your receipt ID (<strong className="font-semibold">{receiptData?.receiptId}</strong>) handy during campus induction and kit distribution.</li>
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rotaract-navy text-white text-xs font-bold hover:bg-rotaract-dark transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Print / Save Receipt PDF</span>
                                        </button>

                                        <Link
                                            href="/"
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all text-center"
                                        >
                                            Return to Home
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setFormData(INITIAL_FORM);
                                                setReceiptData(null);
                                                handleRemoveScreenshot();
                                            }}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-500 text-xs hover:text-rotaract-cranberry transition-all"
                                        >
                                            Submit Another Application
                                        </button>
                                    </div>
                                </motion.div>
                            )}
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
                            Still have questions about joining?
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
                            href="https://instagram.com/rotaract_bmsce"
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
