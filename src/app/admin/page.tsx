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
    ExternalLink,
    Clock,
    Laptop,
    QrCode,
    FileText,
    RotateCcw,
    Check,
    Copy,
    Download,
    RefreshCw,
    Eye,
    X,
    ZoomIn
} from "lucide-react";
import upcomingEventsRaw from "@/data/upcomingEvents.json";
import paymentSettingsRaw from "@/data/paymentSettings.json";

export interface QrItem {
    id: string;
    title: string;
    qrImageUrl: string;
    upiId: string;
    payeeName: string;
    bank?: string;
    accountHolder?: string;
    badge?: string;
    isPreset?: boolean;
    description?: string;
    dateAdded?: string;
}

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
    const [loginError, setLoginError] = useState("");

    // Active Tab: 'members' | 'qrcode' | 'events'
    const [activeTab, setActiveTab] = useState<"members" | "qrcode" | "events">("members");

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
        amount: "800",
        payeeName: "",
        qrUsed: "Vaishnavi QR1",
        remarks: "",
        timestamp: "",
    });
    const [lastRegisteredMember, setLastRegisteredMember] = useState<{
        name: string;
        usn: string;
        amount: number;
        membershipType: string;
        receiptId: string;
        qrUsed?: string;
        remarks?: string;
    } | null>(null);
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
        } else if (adminUserEmail.toLowerCase().includes("neerva")) {
            setRegistrationDesk("Desk 4 (Neerva)");
        } else if (adminUserEmail.toLowerCase().includes("geethika")) {
            setRegistrationDesk("Desk 5 (Geethika)");
        } else if (adminUserEmail.toLowerCase().includes("aman")) {
            setRegistrationDesk("Desk 6 (Aman)");
        } else {
            setRegistrationDesk("Desk 1 (Sharan)");
        }

        const savedQr = localStorage.getItem("rotaract_admin_selected_qr");
        if (savedQr) {
            setMemberForm((prev) => ({ ...prev, qrUsed: savedQr }));
        } else if (adminUserEmail.toLowerCase().includes("sharan")) {
            setMemberForm((prev) => ({ ...prev, qrUsed: "Sharanu QR" }));
        } else if (adminUserEmail.toLowerCase().includes("hima")) {
            setMemberForm((prev) => ({ ...prev, qrUsed: "Himashree QR" }));
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

                // Authoritative allowed admin emails list
                const BUILTIN_ADMIN_EMAILS = [
                    "rtrsharan318@gmail.com",
                    "rtrsamyakr@gmail.com",
                    "rtrhimashree@gmail.com",
                    "himashreeb.cd23@bmsce.ac.in",
                    "vaishnavis.cs24@bmsce.ac.in",
                    "mohammedhassaan.ec24@bmsce.ac.in",
                    "sushanth0087@gmail.com",
                    "sushanth007@gmail.com",
                    "neervanegi.cs25@bmsce.ac.in",
                    "geethika.cs24@bmsce.ac.in",
                    "aman.cs25@bmsce.ac.in"
                ];

                const envEmails = (process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS || "")
                    .split(",")
                    .map((e) => e.trim().toLowerCase())
                    .filter(Boolean);

                // Merge and deduplicate both built-in emails and env variables
                const allowedEmails = Array.from(
                    new Set([
                        ...BUILTIN_ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
                        ...envEmails
                    ])
                );

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

    // --- QR CODE & PAYMENT CONFIG STATE ---
    const [qrConfig, setQrConfig] = useState({
        qrImageUrl: paymentSettingsRaw.qrImageUrl || "/images/payment-qr.jpg",
        upiId: paymentSettingsRaw.upiId || "vaishnavisrinivasa26-1@okaxis",
        payeeName: paymentSettingsRaw.payeeName || "Rotaract Club BMSCE",
        amount: Number(paymentSettingsRaw.amount) || 320,
        notes: paymentSettingsRaw.notes || "Scan with any UPI app to pay ₹320 4-year club membership fee.",
        lastUpdated: paymentSettingsRaw.lastUpdated || "",
        updatedBy: paymentSettingsRaw.updatedBy || "",
        qrMode: ((paymentSettingsRaw as any).qrMode as "custom_image" | "dynamic_upi" | "default") || "custom_image",
        selectedQrId: (paymentSettingsRaw as any).selectedQrId || "qr-axis-bank",
        availableQrs: ((paymentSettingsRaw as any).availableQrs as QrItem[]) || [],
    });
    const [previewQrImage, setPreviewQrImage] = useState<string>(
        paymentSettingsRaw.qrImageUrl || "/images/payment-qr.jpg"
    );
    const [selectedQrMode, setSelectedQrMode] = useState<"custom_image" | "dynamic_upi" | "default">(
        (paymentSettingsRaw as any).qrMode === "dynamic_upi" ? "dynamic_upi" : "custom_image"
    );
    const [isSavingQr, setIsSavingQr] = useState(false);
    const [qrSuccessMsg, setQrSuccessMsg] = useState("");
    const [qrErrorMsg, setQrErrorMsg] = useState("");
    const [isResettingQr, setIsResettingQr] = useState(false);
    const [isCopiedAdminUpi, setIsCopiedAdminUpi] = useState(false);
    const [qrUploadFileName, setQrUploadFileName] = useState("");

    // QR Code Gallery & Library states
    const [selectingQrId, setSelectingQrId] = useState<string | null>(null);
    const [showAddQrModal, setShowAddQrModal] = useState(false);
    const [isAddingQr, setIsAddingQr] = useState(false);
    const [previewQrModal, setPreviewQrModal] = useState<QrItem | null>(null);
    const [newQrForm, setNewQrForm] = useState({
        title: "",
        upiId: "",
        payeeName: "Rotaract Club BMSCE",
        bank: "",
        description: "",
        imageData: "",
        fileName: "",
        selectImmediately: true,
    });

    // Load QR settings from API / localStorage on mount
    useEffect(() => {
        const loadQrSettings = async () => {
            const localSettings = localStorage.getItem("rotaract_custom_qr_settings");
            if (localSettings) {
                try {
                    const parsed = JSON.parse(localSettings);
                    setQrConfig(parsed);
                    setPreviewQrImage(parsed.qrImageUrl || "/images/payment-qr.jpg");
                    setSelectedQrMode(parsed.qrMode === "dynamic_upi" ? "dynamic_upi" : "custom_image");
                } catch {
                    // ignore
                }
            }

            try {
                const res = await fetch(`/api/admin/qr-settings?t=${Date.now()}`, {
                    cache: "no-store",
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.settings) {
                        setQrConfig(data.settings);
                        setPreviewQrImage(data.settings.qrImageUrl || "/images/payment-qr.jpg");
                        setSelectedQrMode(data.settings.qrMode === "dynamic_upi" ? "dynamic_upi" : "custom_image");
                        localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(data.settings));
                    }
                }
            } catch (err) {
                console.warn("Could not fetch remote QR settings, using local/defaults:", err);
            }
        };

        loadQrSettings();
    }, []);

    const previewDeepLink = `upi://pay?pa=${qrConfig.upiId.trim()}&pn=${encodeURIComponent(qrConfig.payeeName.trim() || "Rotaract Club BMSCE")}&am=${qrConfig.amount}&cu=INR&tn=Rotaract+RM+Fee`;

    const livePreviewImageUrl = selectedQrMode === "dynamic_upi"
        ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(previewDeepLink)}`
        : previewQrImage;

    const handleQrImageUpload = (file: File) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setQrErrorMsg("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setQrErrorMsg("QR image file size exceeds 5MB. Please upload a smaller image.");
            return;
        }

        setQrErrorMsg("");
        setQrUploadFileName(file.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreviewQrImage(result);
            setSelectedQrMode("custom_image");
            setQrConfig((prev) => ({
                ...prev,
                qrImageUrl: result,
                qrMode: "custom_image",
            }));
        };
        reader.readAsDataURL(file);
    };

    // Select an existing QR code card from the gallery and activate on live site
    const handleSelectQrCard = async (item: QrItem) => {
        setSelectingQrId(item.id);
        setQrErrorMsg("");
        setQrSuccessMsg("");

        // Immediate responsive local update
        setPreviewQrImage(item.qrImageUrl);
        setSelectedQrMode("custom_image");
        const optimistic = {
            ...qrConfig,
            selectedQrId: item.id,
            qrImageUrl: item.qrImageUrl,
            upiId: item.upiId,
            payeeName: item.payeeName || qrConfig.payeeName,
            qrMode: "custom_image" as const,
        };
        setQrConfig(optimistic);
        localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(optimistic));
        window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: optimistic }));

        try {
            const res = await fetch("/api/admin/qr-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "select",
                    qrId: item.id,
                    updatedBy: adminUserEmail || "Authorized Admin",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to switch QR code.");
            }
            setQrConfig(data.settings);
            setPreviewQrImage(data.settings.qrImageUrl);
            localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(data.settings));
            window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: data.settings }));
            setQrSuccessMsg(`"${item.title}" is now active on the Join Us page!`);
            setTimeout(() => setQrSuccessMsg(""), 5000);
        } catch (err: any) {
            setQrErrorMsg(err.message || "Failed to switch QR code.");
        } finally {
            setSelectingQrId(null);
        }
    };

    // Upload & add new QR code to the library
    const handleAddNewQr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQrForm.imageData) {
            setQrErrorMsg("Please choose a QR code image to upload.");
            return;
        }
        if (!newQrForm.upiId || !newQrForm.upiId.includes("@")) {
            setQrErrorMsg("Please enter a valid UPI ID (e.g. username@bank).");
            return;
        }

        setIsAddingQr(true);
        setQrErrorMsg("");
        setQrSuccessMsg("");

        try {
            const res = await fetch("/api/admin/qr-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "add_qr",
                    title: newQrForm.title,
                    upiId: newQrForm.upiId.trim(),
                    payeeName: newQrForm.payeeName.trim() || qrConfig.payeeName,
                    bank: newQrForm.bank.trim() || "Club Account",
                    description: newQrForm.description.trim(),
                    imageData: newQrForm.imageData,
                    selectImmediately: newQrForm.selectImmediately,
                    updatedBy: adminUserEmail || "Authorized Admin",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to add QR code.");
            }

            setQrConfig(data.settings);
            if (newQrForm.selectImmediately) {
                setPreviewQrImage(data.settings.qrImageUrl);
                setSelectedQrMode("custom_image");
            }
            localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(data.settings));
            window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: data.settings }));

            setShowAddQrModal(false);
            setNewQrForm({
                title: "",
                upiId: "",
                payeeName: "Rotaract Club BMSCE",
                bank: "",
                description: "",
                imageData: "",
                fileName: "",
                selectImmediately: true,
            });
            setQrSuccessMsg(data.message || "New QR code added to library!");
            setTimeout(() => setQrSuccessMsg(""), 5000);
        } catch (err: any) {
            setQrErrorMsg(err.message || "Failed to upload QR code.");
        } finally {
            setIsAddingQr(false);
        }
    };

    // Remove a custom QR code from the library
    const handleDeleteQr = async (qrId: string, title: string) => {
        if (!confirm(`Are you sure you want to remove "${title}" from the QR library?`)) {
            return;
        }
        try {
            const res = await fetch("/api/admin/qr-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete_qr",
                    qrId,
                    updatedBy: adminUserEmail || "Authorized Admin",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to delete QR code.");
            }
            setQrConfig(data.settings);
            setPreviewQrImage(data.settings.qrImageUrl);
            localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(data.settings));
            window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: data.settings }));
            setQrSuccessMsg(`"${title}" was removed from the QR library.`);
            setTimeout(() => setQrSuccessMsg(""), 5000);
        } catch (err: any) {
            setQrErrorMsg(err.message || "Failed to delete QR code.");
        }
    };

    const handleModalImageUpload = (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setQrErrorMsg("Please select an image file (PNG, JPG, JPEG, WEBP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setQrErrorMsg("File size exceeds 5MB.");
            return;
        }
        setQrErrorMsg("");
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewQrForm((prev) => ({
                ...prev,
                imageData: reader.result as string,
                fileName: file.name,
                title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveQrConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingQr(true);
        setQrErrorMsg("");
        setQrSuccessMsg("");

        try {
            if (!qrConfig.upiId || !qrConfig.upiId.includes("@")) {
                setQrErrorMsg("Please enter a valid UPI ID (e.g. username@bank).");
                setIsSavingQr(false);
                return;
            }

            const payload = {
                qrImageUrl: selectedQrMode === "dynamic_upi"
                    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(previewDeepLink)}`
                    : previewQrImage,
                upiId: qrConfig.upiId.trim(),
                payeeName: qrConfig.payeeName.trim(),
                amount: Number(qrConfig.amount) || 320,
                notes: qrConfig.notes || "",
                updatedBy: adminUserEmail || "Authorized Admin",
                qrMode: selectedQrMode,
                selectedQrId: qrConfig.selectedQrId,
            };

            const res = await fetch("/api/admin/qr-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to update QR code.");
            }

            const savedSettings = data.settings;
            setQrConfig(savedSettings);
            setPreviewQrImage(savedSettings.qrImageUrl);
            localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(savedSettings));
            window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: savedSettings }));

            setQrSuccessMsg("Payment QR code and UPI details updated successfully! Live website will now display the new QR code.");
            setTimeout(() => setQrSuccessMsg(""), 6000);
        } catch (err: any) {
            console.error("Save QR error:", err);
            setQrErrorMsg(err.message || "Failed to save QR configuration.");
        } finally {
            setIsSavingQr(false);
        }
    };

    const handleResetQr = async () => {
        if (!confirm("Are you sure you want to reset the payment QR code back to the club's default?")) {
            return;
        }

        setIsResettingQr(true);
        setQrErrorMsg("");
        setQrSuccessMsg("");

        try {
            const res = await fetch("/api/admin/qr-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isReset: true,
                    updatedBy: adminUserEmail || "Authorized Admin",
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to reset QR code.");
            }

            const defaultSettings = data.settings;
            setQrConfig(defaultSettings);
            setPreviewQrImage(defaultSettings.qrImageUrl);
            setSelectedQrMode("custom_image");
            setQrUploadFileName("");
            localStorage.setItem("rotaract_custom_qr_settings", JSON.stringify(defaultSettings));
            window.dispatchEvent(new CustomEvent("rotaract_qr_updated", { detail: defaultSettings }));

            setQrSuccessMsg("Payment QR code successfully reset to default club QR.");
            setTimeout(() => setQrSuccessMsg(""), 5000);
        } catch (err: any) {
            console.error("Reset QR error:", err);
            setQrErrorMsg(err.message || "Failed to reset QR code.");
        } finally {
            setIsResettingQr(false);
        }
    };

    const copyAdminUpi = () => {
        if (navigator.clipboard && qrConfig.upiId) {
            navigator.clipboard.writeText(qrConfig.upiId);
            setIsCopiedAdminUpi(true);
            setTimeout(() => setIsCopiedAdminUpi(false), 2000);
        }
    };

    const downloadCurrentQr = () => {
        const link = document.createElement("a");
        link.href = livePreviewImageUrl;
        link.download = `Rotaract_BMSCE_QR_${Date.now()}.png`;
        link.target = "_blank";
        link.click();
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

        const defaultStdAmount = memberForm.membershipType.startsWith("RI") ? 800 : 320;
        const parsedAmount =
            memberForm.amount !== "" && !isNaN(Number(memberForm.amount))
                ? Number(memberForm.amount)
                : defaultStdAmount;

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
                amount: parsedAmount,
                qrUsed: memberForm.qrUsed || "Vaishnavi QR1",
                paymentQr: memberForm.qrUsed || "Vaishnavi QR1",
                remarks: memberForm.remarks || "",
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
            setLastRegisteredMember({
                name: memberForm.fullName,
                usn: memberForm.usn,
                amount: parsedAmount,
                membershipType: memberForm.membershipType,
                receiptId: payload.receiptId,
                qrUsed: memberForm.qrUsed || "Vaishnavi QR1",
                remarks: memberForm.remarks || "",
            });
            setMemberForm({
                fullName: "",
                usn: "",
                collegeEmail: "",
                personalEmail: "",
                yearOfStudy: "1st Year",
                phone: "",
                bloodGroup: "Prefer not to say",
                membershipType: "RI - Rotary International membership",
                amount: "800",
                payeeName: "",
                qrUsed: memberForm.qrUsed || "Vaishnavi QR1",
                remarks: "",
                timestamp: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }),
            });
        } catch (err: any) {
            console.error("Member registration error:", err);
            setIsSubmittingMember(false);
            setMemberError(err?.message || "Failed to record member registration. Check network connection.");
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

                    <p className="text-xs text-slate-600 text-center leading-relaxed">
                        Please sign in with your authorized Google account to manage member registrations and live events.
                    </p>

                    {loginError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{loginError}</span>
                        </div>
                    )}

                    <div className="space-y-4 pt-1">
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

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Access restricted to authorized club board members</span>
                        </div>
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
                <div className="bg-white rounded-2xl p-2 shadow-md border border-slate-200 inline-flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${activeTab === "members"
                            ? "bg-rotaract-navy text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Register New Member</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("qrcode")}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${activeTab === "qrcode"
                            ? "bg-rotaract-cranberry text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <QrCode className="w-4 h-4" />
                        <span>Change Payment QR</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${activeTab === "events"
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
                                        <option value="Desk 4 (Neerva)">Desk 4 (Neerva)</option>
                                        <option value="Desk 5 (Geethika)">Desk 5 (Geethika)</option>
                                        <option value="Desk 6 (Aman)">Desk 6 (Aman)</option>
                                        <option value="Support Desk">Support Desk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {memberSubmittedSuccess && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-bold text-sm">Member Successfully Registered!</p>
                                    <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                                        {lastRegisteredMember ? (
                                            <>
                                                Recorded <strong>{lastRegisteredMember.name}</strong> ({lastRegisteredMember.usn}) with payment amount <strong className="text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">₹{lastRegisteredMember.amount}</strong> ({lastRegisteredMember.membershipType.startsWith("RI") ? "RI" : "RM"}).
                                                <span className="inline-flex items-center gap-1 mx-1.5 bg-white border border-emerald-300 px-2 py-0.5 rounded text-emerald-800 font-semibold text-[10px]">
                                                    <QrCode className="w-3 h-3 text-rotaract-cranberry" />
                                                    {lastRegisteredMember.qrUsed}
                                                </span>
                                                {lastRegisteredMember.remarks && (
                                                    <span className="inline-block bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-amber-800 font-medium text-[10px] mx-1">
                                                        Note: {lastRegisteredMember.remarks}
                                                    </span>
                                                )}
                                                Receipt ID: <span className="font-mono font-semibold">{lastRegisteredMember.receiptId}</span>.
                                            </>
                                        ) : (
                                            "Member details and payment records have been securely added."
                                        )}
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
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Membership Type & Payment Verification
                                    </h3>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Supports custom fees & student discounts
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Type of Membership *
                                        </label>
                                        <select
                                            value={memberForm.membershipType}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                const prevDefault = memberForm.membershipType.startsWith("RI") ? "800" : "320";
                                                const nextDefault = newType.startsWith("RI") ? "800" : "320";
                                                const shouldUpdate = !memberForm.amount || memberForm.amount === prevDefault;
                                                setMemberForm({
                                                    ...memberForm,
                                                    membershipType: newType,
                                                    amount: shouldUpdate ? nextDefault : memberForm.amount,
                                                });
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white font-medium"
                                        >
                                            <option value="RI - Rotary International membership">RI - Rotary International (Std ₹800)</option>
                                            <option value="RM - Rotaract Club membership">RM - Rotaract Club (Std ₹320)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Amount Paid (₹) *
                                            </label>
                                            {memberForm.amount !== "" && !isNaN(Number(memberForm.amount)) && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${Number(memberForm.amount) < (memberForm.membershipType.startsWith("RI") ? 800 : 320)
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                                    }`}>
                                                    {Number(memberForm.amount) < (memberForm.membershipType.startsWith("RI") ? 800 : 320)
                                                        ? `Discount: ₹${(memberForm.membershipType.startsWith("RI") ? 800 : 320) - Number(memberForm.amount)} off`
                                                        : "Standard Fee"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm select-none">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="1"
                                                placeholder="e.g. 800, 320, 250"
                                                value={memberForm.amount}
                                                onChange={(e) => setMemberForm({ ...memberForm, amount: e.target.value })}
                                                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => setMemberForm({ ...memberForm, amount: memberForm.membershipType.startsWith("RI") ? "800" : "320" })}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition cursor-pointer"
                                                title="Reset to standard full fee"
                                            >
                                                Std ₹{memberForm.membershipType.startsWith("RI") ? "800" : "320"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMemberForm({ ...memberForm, amount: "250" })}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition cursor-pointer"
                                                title="Quick discount ₹250"
                                            >
                                                ₹250
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMemberForm({ ...memberForm, amount: "300" })}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition cursor-pointer"
                                                title="Quick discount ₹300"
                                            >
                                                ₹300
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMemberForm({ ...memberForm, amount: "0" })}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition cursor-pointer"
                                                title="Complimentary / waiver"
                                            >
                                                ₹0 (Free)
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Payee Name <span className="font-normal text-slate-400">(If online)</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="UPI account holder name"
                                            value={memberForm.payeeName}
                                            onChange={(e) => setMemberForm({ ...memberForm, payeeName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Leave empty if paid in cash
                                        </p>
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
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Auto-records current time if blank
                                        </p>
                                    </div>
                                </div>

                                {/* QR Used & Remarks Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                                <QrCode className="w-3.5 h-3.5 text-rotaract-cranberry" />
                                                <span>Payment QR Used *</span>
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-medium">Which QR</span>
                                        </div>
                                        <select
                                            value={memberForm.qrUsed}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setMemberForm({ ...memberForm, qrUsed: val });
                                                try {
                                                    localStorage.setItem("rotaract_admin_selected_qr", val);
                                                } catch {}
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rotaract-navy bg-white text-slate-800"
                                        >
                                            <option value="Vaishnavi QR1">Vaishnavi QR1</option>
                                            <option value="Vaishnavi QR2">Vaishnavi QR2</option>
                                            <option value="Sharanu QR">Sharanu QR</option>
                                            <option value="Himashree QR">Himashree QR</option>
                                            <option value="Cash Payment (No QR)">Cash Payment (No QR)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Auto-saves for consecutive desk registrations
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Remarks / Notes</span>
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. Paid ₹200 cash & ₹120 UPI, referred by xyz, discount approval, ID card pending..."
                                            value={memberForm.remarks}
                                            onChange={(e) => setMemberForm({ ...memberForm, remarks: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy text-slate-800 placeholder:text-slate-400"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Any desk remarks, cash note, or special instructions
                                        </p>
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

                {/* TAB: PAYMENT QR CODE & UPI SETTINGS */}
                {activeTab === "qrcode" && (
                    <div className="space-y-8">
                        {/* Banner with status */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rotaract-cranberry/10 text-rotaract-cranberry text-xs font-bold">
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>Official Club Payment Gateway Configuration</span>
                                </div>
                                <h2 className="text-2xl font-bold font-heading text-rotaract-navy">
                                    Change Club Payment QR Code & UPI
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                                    Select which official QR code image should be displayed on the public Join Us registration portal, or upload and manage multiple QR codes in the library.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <a
                                    href="/join-the-club"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200"
                                >
                                    <ExternalLink className="w-4 h-4 text-rotaract-navy" />
                                    <span>View Live Join Page</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={handleResetQr}
                                    disabled={isResettingQr}
                                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-rose-200 disabled:opacity-50 cursor-pointer"
                                >
                                    {isResettingQr ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4 text-rose-600" />
                                    )}
                                    <span>Reset to Axis Bank QR</span>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        {qrSuccessMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center gap-3 shadow-sm"
                            >
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <span className="font-semibold">{qrSuccessMsg}</span>
                            </motion.div>
                        )}

                        {qrErrorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl flex items-center gap-3 shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                                <span className="font-semibold">{qrErrorMsg}</span>
                            </motion.div>
                        )}

                        {/* QR CODE GALLERY / SELECTOR SECTION */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold font-heading text-rotaract-navy flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-rotaract-cranberry" />
                                        <span>Available QR Code Images</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Select one of the images below to show on the Join Us page, or upload a new QR image to the collection.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddQrModal(true)}
                                    className="px-4 py-2 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                                >
                                    <Plus className="w-4 h-4 text-rotaract-gold" />
                                    <span>Upload New QR to Library</span>
                                </button>
                            </div>

                            {/* Gallery Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {(qrConfig.availableQrs || []).map((item) => {
                                    const isActive = qrConfig.selectedQrId === item.id || qrConfig.qrImageUrl === item.qrImageUrl;
                                    const isSelectingThis = selectingQrId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                if (!isActive && !isSelectingThis) {
                                                    handleSelectQrCard(item);
                                                }
                                            }}
                                            className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative group cursor-pointer ${isActive
                                                ? "border-emerald-500 bg-emerald-50/40 shadow-md ring-4 ring-emerald-500/20"
                                                : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-rotaract-navy/60 hover:shadow-md"
                                                }`}
                                        >
                                            {/* Card Header & Status Badge */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isActive
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}>
                                                    {item.badge || item.bank || "Available Option"}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                            <span>LIVE ACTIVE</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold group-hover:bg-rotaract-navy group-hover:text-white transition-colors">
                                                            <span>Select</span>
                                                        </span>
                                                    )}

                                                    {!item.isPreset && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteQr(item.id, item.title);
                                                            }}
                                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                                                            title="Delete from library"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* QR Image Preview with Click to Zoom */}
                                            <div className="flex flex-col items-center my-2">
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewQrModal(item);
                                                    }}
                                                    className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center cursor-zoom-in group-hover:border-rotaract-navy transition-all relative overflow-hidden"
                                                    title="Click to zoom in"
                                                >
                                                    <img
                                                        src={item.qrImageUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-contain rounded-xl"
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 rounded-2xl">
                                                        <ZoomIn className="w-5 h-5" />
                                                        <span className="text-[11px] font-bold">Zoom</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Content & Details */}
                                            <div className="space-y-1.5 text-center mt-2">
                                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1" title={item.title}>
                                                    {item.title}
                                                </h4>
                                                <div className="inline-flex items-center justify-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 max-w-full">
                                                    <span className="truncate max-w-[170px]" title={item.upiId}>{item.upiId}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 truncate" title={item.payeeName}>
                                                    Payee: <strong>{item.payeeName || "Rotaract Club BMSCE"}</strong>
                                                </p>
                                            </div>

                                            {/* Card Action Button */}
                                            <div className="mt-4 pt-3 border-t border-slate-100">
                                                {isActive ? (
                                                    <div
                                                        className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Showing on Join Us Page</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectQrCard(item);
                                                        }}
                                                        disabled={isSelectingThis}
                                                        className="w-full py-2.5 rounded-xl bg-rotaract-navy hover:bg-rotaract-cranberry text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-[0.99] disabled:opacity-50"
                                                    >
                                                        {isSelectingThis ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                <span>Activating...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                <span>Select for Join Us Page</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2-COLUMN STUDIO GRID: FINE-TUNE & LIVE PREVIEW */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* LEFT COLUMN: FINE-TUNE EDIT FORM (7 cols) */}
                            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                                <div>
                                    <h3 className="text-base font-bold font-heading text-rotaract-navy">
                                        Fine-Tune Active QR & Payment Details
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Customize or override details for the currently active QR code shown above.
                                    </p>
                                </div>

                                <form onSubmit={handleSaveQrConfig} className="space-y-6">
                                    {/* Method Selector */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                            QR Display Mode
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQrMode("custom_image")}
                                                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${selectedQrMode === "custom_image"
                                                    ? "border-rotaract-cranberry bg-rotaract-cranberry/5 ring-2 ring-rotaract-cranberry/20"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedQrMode === "custom_image"
                                                    ? "bg-rotaract-cranberry text-white"
                                                    : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs sm:text-sm text-slate-800">
                                                        Selected QR Image
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                        Displays the chosen high-definition bank flyer/poster QR image.
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedQrMode("dynamic_upi")}
                                                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${selectedQrMode === "dynamic_upi"
                                                    ? "border-rotaract-navy bg-rotaract-navy/5 ring-2 ring-rotaract-navy/20"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedQrMode === "dynamic_upi"
                                                    ? "bg-rotaract-navy text-white"
                                                    : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                    <RefreshCw className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs sm:text-sm text-slate-800">
                                                        Auto-Generate from UPI
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                        Generates crisp dynamic vector QR code from the UPI ID below.
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 2: Upload / Replace Active Image */}
                                    {selectedQrMode === "custom_image" && (
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Replace Current Active Image (Optional)
                                            </label>
                                            <label className="border-2 border-dashed border-slate-300 hover:border-rotaract-cranberry hover:bg-slate-50/60 rounded-2xl p-5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/30">
                                                <div className="w-10 h-10 rounded-2xl bg-rotaract-cranberry/10 text-rotaract-cranberry flex items-center justify-center">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs font-bold text-slate-700 block">
                                                        Click to browse or drop an updated file
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block mt-0.5">
                                                        Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleQrImageUpload(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {qrUploadFileName && (
                                                <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                                                    <span className="font-medium truncate">New file selected: <strong>{qrUploadFileName}</strong></span>
                                                    <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded font-bold">Ready</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 3: UPI Account & Payment Details */}
                                    <div className="space-y-4 pt-2 border-t border-slate-100">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Active Account Details
                                        </label>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Club UPI ID *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. vaishnavisrinivasa26-1@okaxis"
                                                        value={qrConfig.upiId}
                                                        onChange={(e) => setQrConfig({ ...qrConfig, upiId: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                    />
                                                    {qrConfig.upiId.includes("@") && (
                                                        <div className="absolute right-3 top-3 text-emerald-600" title="Valid UPI format">
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    This ID is copied by students when paying directly from their UPI apps.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Account Holder / Payee Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Rotaract Club BMSCE"
                                                    value={qrConfig.payeeName}
                                                    onChange={(e) => setQrConfig({ ...qrConfig, payeeName: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Official recipient name shown on UPI payment screens.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Membership Fee Amount (₹) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={qrConfig.amount}
                                                    onChange={(e) => setQrConfig({ ...qrConfig, amount: Number(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-rotaract-navy focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Standard 4-year club membership fee amount.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Student Guidance Notes
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Scan with any UPI app to pay fee"
                                                    value={qrConfig.notes || ""}
                                                    onChange={(e) => setQrConfig({ ...qrConfig, notes: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Helpful note shown directly underneath the payment card.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata summary */}
                                    {qrConfig.lastUpdated && (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                Last modified: <strong>{qrConfig.lastUpdated}</strong>
                                            </span>
                                            {qrConfig.updatedBy && (
                                                <span className="text-slate-400">by {qrConfig.updatedBy}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Submit Action */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingQr}
                                            className="w-full py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                                        >
                                            {isSavingQr ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Saving & Applying New QR Code...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Save & Publish Live QR Code</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (5 cols) */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-rotaract-navy" />
                                        <span>Public Portal Live Preview</span>
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Matches /join-the-club
                                    </span>
                                </div>

                                {/* Simulated Join-the-club Payment Card */}
                                <div className="bg-slate-50 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-md space-y-5">
                                    <div className="text-center max-w-sm mx-auto space-y-1.5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Official Rotaract BMSCE Payment QR</span>
                                        </span>
                                        <h4 className="text-xl font-extrabold font-heading text-rotaract-navy">
                                            Scan & Pay ₹{qrConfig.amount}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-light">
                                            {qrConfig.notes || "Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app."}
                                        </p>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-60 sm:w-64 max-w-full bg-white p-3 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center transition-transform hover:scale-[1.02]">
                                            <img
                                                src={livePreviewImageUrl}
                                                alt="Rotaract BMSCE UPI QR Code"
                                                className="w-full h-auto object-contain rounded-2xl max-h-64"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(previewDeepLink)}`;
                                                }}
                                            />
                                        </div>

                                        {/* UPI ID Pill & Copy Button */}
                                        <div className="flex items-center justify-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm max-w-full">
                                            <span className="text-[11px] text-slate-500 font-medium">Club UPI ID:</span>
                                            <span className="text-xs font-mono font-bold text-slate-800 truncate max-w-[180px]">
                                                {qrConfig.upiId}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={copyAdminUpi}
                                                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ml-1 cursor-pointer"
                                                title="Copy UPI ID"
                                            >
                                                {isCopiedAdminUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Payee Name subtitle */}
                                        <div className="text-[11px] text-slate-500 text-center">
                                            Verified Payee: <strong>{qrConfig.payeeName}</strong>
                                        </div>
                                    </div>

                                    {/* Action buttons on preview */}
                                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={downloadCurrentQr}
                                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5 text-rotaract-navy" />
                                            <span>Download QR</span>
                                        </button>
                                        <a
                                            href="/join-the-club"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-rotaract-gold" />
                                            <span>Test Live Page</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Helpful Instruction Note */}
                                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                                        Admin Security & Verification
                                    </p>
                                    <p className="text-[11px] text-amber-800 leading-relaxed">
                                        Whenever you switch QR code images or update the UPI ID, verify by scanning this preview with your own phone&apos;s UPI application to ensure payments route into the club&apos;s correct bank account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* MODAL 1: ADD NEW QR CODE TO LIBRARY */}
                        {showAddQrModal && (
                            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-8"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-rotaract-navy/10 text-rotaract-navy flex items-center justify-center">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold font-heading text-rotaract-navy">
                                                    Add New QR Code to Library
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Upload a new QR image to select and show on the Join Us page.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddQrModal(false)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddNewQr} className="space-y-4">
                                        {/* Image Upload Dropzone */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                QR Code Image *
                                            </label>
                                            <label className="border-2 border-dashed border-slate-300 hover:border-rotaract-cranberry hover:bg-slate-50 rounded-2xl p-5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50">
                                                {newQrForm.imageData ? (
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={newQrForm.imageData}
                                                            alt="Uploaded QR Preview"
                                                            className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white"
                                                        />
                                                        <div className="text-left text-xs">
                                                            <span className="font-bold text-slate-800 block truncate max-w-[200px]">
                                                                {newQrForm.fileName}
                                                            </span>
                                                            <span className="text-emerald-600 font-semibold">Image loaded successfully</span>
                                                            <span className="text-[10px] text-slate-400 block">Click to choose another</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-rotaract-cranberry/10 text-rotaract-cranberry flex items-center justify-center">
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-xs font-bold text-slate-700 block">
                                                                Click to browse or drop QR image
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                PNG, JPG, JPEG, WEBP (Max 5MB)
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleModalImageUpload(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* QR Title & Label */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                QR Code Title / Label *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Canara Bank QR, Treasurer Google Pay, Fest QR"
                                                value={newQrForm.title}
                                                onChange={(e) => setNewQrForm({ ...newQrForm, title: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* UPI ID */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Associated UPI ID *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. rotaractbmsce@okaxis"
                                                    value={newQrForm.upiId}
                                                    onChange={(e) => setNewQrForm({ ...newQrForm, upiId: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                />
                                            </div>

                                            {/* Bank / Account Name */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Bank / Account
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Axis Bank, HDFC, SBI"
                                                    value={newQrForm.bank}
                                                    onChange={(e) => setNewQrForm({ ...newQrForm, bank: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                                />
                                            </div>
                                        </div>

                                        {/* Payee Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Account Holder / Payee Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Rotaract Club BMSCE"
                                                value={newQrForm.payeeName}
                                                onChange={(e) => setNewQrForm({ ...newQrForm, payeeName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rotaract-navy"
                                            />
                                        </div>

                                        {/* Immediate Activation Checkbox */}
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                id="selectImmediately"
                                                checked={newQrForm.selectImmediately}
                                                onChange={(e) => setNewQrForm({ ...newQrForm, selectImmediately: e.target.checked })}
                                                className="w-4 h-4 rounded text-rotaract-cranberry focus:ring-rotaract-cranberry cursor-pointer"
                                            />
                                            <label htmlFor="selectImmediately" className="text-xs font-medium text-slate-700 cursor-pointer">
                                                Immediately make this QR code active on the live Join Us page
                                            </label>
                                        </div>

                                        {/* Submit buttons */}
                                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddQrModal(false)}
                                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isAddingQr}
                                                className="px-5 py-2.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                            >
                                                {isAddingQr ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span>Add to Library</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}

                        {/* MODAL 2: ENLARGED LIGHTBOX PREVIEW */}
                        {previewQrModal && (
                            <div
                                className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                                onClick={() => setPreviewQrModal(null)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setPreviewQrModal(null)}
                                        className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="space-y-1 pt-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-rotaract-cranberry bg-rotaract-cranberry/10 px-2.5 py-0.5 rounded-full">
                                            {previewQrModal.badge || previewQrModal.bank || "QR Code Image"}
                                        </span>
                                        <h3 className="text-base font-bold font-heading text-rotaract-navy">
                                            {previewQrModal.title}
                                        </h3>
                                    </div>

                                    <div className="w-64 h-64 mx-auto bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                                        <img
                                            src={previewQrModal.qrImageUrl}
                                            alt={previewQrModal.title}
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
                                        <span>{previewQrModal.upiId}</span>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleSelectQrCard(previewQrModal);
                                                setPreviewQrModal(null);
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-rotaract-navy hover:bg-rotaract-cranberry text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Set as Active QR on Join Us Page</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewQrModal(null)}
                                            className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
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
