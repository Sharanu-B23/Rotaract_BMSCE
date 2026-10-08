import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "paymentSettings.json");
const TMP_CONFIG_PATH = path.join(os.tmpdir(), "rotaract_paymentSettings.json");
const CUSTOM_IMAGE_DIR = path.join(process.cwd(), "public", "images");
const QR_LIBRARY_DIR = path.join(process.cwd(), "public", "images", "qr-library");
const CUSTOM_IMAGE_FILE = path.join(CUSTOM_IMAGE_DIR, "custom-payment-qr.png");

// Memory cache across serverless invocations within the same process
declare global {
    var __rotaractPaymentSettings: PaymentSettings | undefined;
}

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

export interface PaymentSettings {
    qrImageUrl: string;
    upiId: string;
    payeeName: string;
    amount: number;
    notes?: string;
    lastUpdated?: string;
    updatedBy?: string;
    qrMode?: "custom_image" | "dynamic_upi" | "default";
    qrImageBackup?: string;
    selectedQrId?: string;
    availableQrs: QrItem[];
}

const DEFAULT_PRESET_QRS: QrItem[] = [
    {
        id: "qr-axis-bank",
        title: "Axis Bank QR (Official Account)",
        qrImageUrl: "/images/payment-qr.jpg",
        upiId: "vaishnavisrinivasa26-1@okaxis",
        payeeName: "Rotaract Club BMSCE",
        bank: "Axis Bank",
        accountHolder: "Rtr. Vaishnavi S",
        badge: "Axis Bank",
        isPreset: true,
        description: "Official Axis Bank QR code for club membership registrations",
    },
    {
        id: "qr-sbi-bank",
        title: "State Bank of India (SBI) QR",
        qrImageUrl: "/images/payment-qr-sbi.jpeg",
        upiId: "vaishnavisrinivasa26-1@oksbi",
        payeeName: "Rotaract Club BMSCE",
        bank: "State Bank of India",
        accountHolder: "Rtr. Vaishnavi S",
        badge: "SBI Account",
        isPreset: true,
        description: "Alternative State Bank of India QR code for club registrations",
    },
];

function getDefaultSettings(): PaymentSettings {
    return {
        qrImageUrl: process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE || "/images/payment-qr.jpg",
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "vaishnavisrinivasa26-1@okaxis",
        payeeName: "Rotaract Club BMSCE",
        amount: 320,
        notes: "Scan with any UPI app to pay ₹320 4-year club membership fee.",
        lastUpdated: "",
        updatedBy: "Default System Settings",
        qrMode: "custom_image",
        selectedQrId: "qr-axis-bank",
        availableQrs: DEFAULT_PRESET_QRS,
    };
}

function normalizeSettings(parsed: any): PaymentSettings {
    let storedList: QrItem[] = Array.isArray(parsed.availableQrs) ? parsed.availableQrs : [];
    const mergedList: QrItem[] = [...DEFAULT_PRESET_QRS];

    for (const item of storedList) {
        if (!mergedList.some((p) => p.id === item.id)) {
            mergedList.push(item);
        }
    }

    const activeQrUrl = parsed.qrImageUrl || DEFAULT_PRESET_QRS[0].qrImageUrl;
    let activeId = parsed.selectedQrId;
    if (!activeId) {
        const match = mergedList.find((q) => q.qrImageUrl === activeQrUrl);
        activeId = match ? match.id : DEFAULT_PRESET_QRS[0].id;
    }

    return {
        ...getDefaultSettings(),
        ...parsed,
        selectedQrId: activeId,
        availableQrs: mergedList,
    };
}

function readStoredSettings(): PaymentSettings {
    // 1. Check in-memory global cache first
    if (globalThis.__rotaractPaymentSettings) {
        return globalThis.__rotaractPaymentSettings;
    }

    // 2. Check /tmp if running on serverless
    try {
        if (fs.existsSync(TMP_CONFIG_PATH)) {
            const raw = fs.readFileSync(TMP_CONFIG_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            const settings = normalizeSettings(parsed);
            globalThis.__rotaractPaymentSettings = settings;
            return settings;
        }
    } catch {}

    // 3. Check persistent config in project workspace
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            const settings = normalizeSettings(parsed);
            globalThis.__rotaractPaymentSettings = settings;
            return settings;
        }
    } catch (e) {
        console.error("Failed to read paymentSettings.json:", e);
    }

    const defaults = getDefaultSettings();
    globalThis.__rotaractPaymentSettings = defaults;
    return defaults;
}

function saveStoredSettings(settings: PaymentSettings): void {
    // Always update in-memory cache
    globalThis.__rotaractPaymentSettings = settings;

    // Try saving to project workspace file
    try {
        const dir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");
    } catch (e) {
        // Fallback for read-only serverless platforms like Vercel
        console.warn("Could not write to CONFIG_PATH, attempting /tmp fallback:", e);
        try {
            fs.writeFileSync(TMP_CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");
        } catch (tmpErr) {
            console.error("Could not write to TMP_CONFIG_PATH:", tmpErr);
        }
    }
}

// Helper to save base64 image data to public/images/qr-library or return data URI
function saveBase64Image(dataUri: string, filenamePrefix = "qr"): string {
    try {
        if (!fs.existsSync(QR_LIBRARY_DIR)) {
            fs.mkdirSync(QR_LIBRARY_DIR, { recursive: true });
        }

        const matches = dataUri.match(/^data:image\/([A-Za-z0-9-+]+);base64,(.+)$/);
        if (!matches || matches.length < 3) {
            return dataUri;
        }

        let ext = matches[1].toLowerCase();
        if (ext === "jpeg") ext = "jpg";
        const buffer = Buffer.from(matches[2], "base64");
        const fileName = `${filenamePrefix}-${Date.now()}.${ext}`;
        const filePath = path.join(QR_LIBRARY_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        return `/images/qr-library/${fileName}?v=${Date.now()}`;
    } catch (e) {
        // If filesystem is read-only (e.g. Vercel), preserve the dataUri directly
        return dataUri;
    }
}

// GET: Fetch the current active QR code, available QR gallery, and UPI configuration
export async function GET() {
    const settings = readStoredSettings();
    return NextResponse.json(
        { success: true, settings },
        {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
                Pragma: "no-cache",
                Expires: "0",
                "Surrogate-Control": "no-store",
            },
        }
    );
}

// POST: Manage QR gallery, Select active QR, Upload new QR, or Reset
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            action,
            qrId,
            qrImageUrl,
            upiId,
            payeeName,
            amount,
            notes,
            updatedBy,
            isReset,
            qrMode,
            title,
            bank,
            description,
            imageData,
            selectImmediately,
        } = body;

        const currentSettings = readStoredSettings();
        const now = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        // ACTION A: SELECT AN EXISTING QR FROM GALLERY
        if (action === "select" && qrId) {
            const targetQr = currentSettings.availableQrs.find((q) => q.id === qrId);
            if (!targetQr) {
                return NextResponse.json(
                    { success: false, error: "Selected QR code was not found in the gallery." },
                    { status: 404 }
                );
            }

            const updatedSettings: PaymentSettings = {
                ...currentSettings,
                selectedQrId: targetQr.id,
                qrImageUrl: targetQr.qrImageUrl,
                upiId: targetQr.upiId,
                payeeName: targetQr.payeeName || currentSettings.payeeName,
                qrMode: "custom_image",
                lastUpdated: now,
                updatedBy: updatedBy || "Authorized Admin",
            };

            saveStoredSettings(updatedSettings);

            return NextResponse.json({
                success: true,
                message: `"${targetQr.title}" selected successfully! Live Join Us page now displays this QR code.`,
                settings: updatedSettings,
            });
        }

        // ACTION B: ADD / UPLOAD A NEW QR CODE TO GALLERY
        if (action === "add_qr") {
            if (!title || !title.trim()) {
                return NextResponse.json({ success: false, error: "Please provide a name/title for this QR code." }, { status: 400 });
            }
            if (!upiId || !upiId.includes("@")) {
                return NextResponse.json({ success: false, error: "Please enter a valid UPI ID (e.g. username@bank)." }, { status: 400 });
            }

            let savedImageUrl = qrImageUrl || "";
            if (imageData && imageData.startsWith("data:image/")) {
                try {
                    savedImageUrl = saveBase64Image(imageData, "custom-qr");
                } catch (imgErr: any) {
                    return NextResponse.json({ success: false, error: "Failed to process image: " + imgErr.message }, { status: 400 });
                }
            }

            if (!savedImageUrl) {
                return NextResponse.json({ success: false, error: "Please upload a QR code image." }, { status: 400 });
            }

            const newQrItem: QrItem = {
                id: `qr-${Date.now()}`,
                title: title.trim(),
                qrImageUrl: savedImageUrl,
                upiId: upiId.trim(),
                payeeName: (payeeName && payeeName.trim()) || "Rotaract Club BMSCE",
                bank: (bank && bank.trim()) || "Club Account",
                accountHolder: (payeeName && payeeName.trim()) || "Rotaract Club BMSCE",
                badge: "Custom Upload",
                isPreset: false,
                description: description || `Uploaded by ${updatedBy || "Admin"} on ${now}`,
                dateAdded: now,
            };

            const updatedAvailable = [newQrItem, ...currentSettings.availableQrs];

            const updatedSettings: PaymentSettings = {
                ...currentSettings,
                availableQrs: updatedAvailable,
                ...(selectImmediately ? {
                    selectedQrId: newQrItem.id,
                    qrImageUrl: newQrItem.qrImageUrl,
                    upiId: newQrItem.upiId,
                    payeeName: newQrItem.payeeName,
                    qrMode: "custom_image",
                } : {}),
                lastUpdated: now,
                updatedBy: updatedBy || "Authorized Admin",
            };

            saveStoredSettings(updatedSettings);

            return NextResponse.json({
                success: true,
                message: `New QR code "${newQrItem.title}" saved to library${selectImmediately ? " and activated for live site" : ""}.`,
                settings: updatedSettings,
            });
        }

        // ACTION C: DELETE A CUSTOM QR CODE FROM GALLERY
        if (action === "delete_qr" && qrId) {
            const target = currentSettings.availableQrs.find((q) => q.id === qrId);
            if (!target) {
                return NextResponse.json({ success: false, error: "QR code not found." }, { status: 404 });
            }
            if (target.isPreset) {
                return NextResponse.json({ success: false, error: "Official system preset QR codes cannot be deleted." }, { status: 400 });
            }

            const filtered = currentSettings.availableQrs.filter((q) => q.id !== qrId);
            let activeQrUrl = currentSettings.qrImageUrl;
            let activeUpiId = currentSettings.upiId;
            let activeSelectedId = currentSettings.selectedQrId;

            // If the deleted QR was currently selected, fallback to the primary preset
            if (currentSettings.selectedQrId === qrId) {
                const fallback = DEFAULT_PRESET_QRS[0];
                activeSelectedId = fallback.id;
                activeQrUrl = fallback.qrImageUrl;
                activeUpiId = fallback.upiId;
            }

            const updatedSettings: PaymentSettings = {
                ...currentSettings,
                availableQrs: filtered,
                selectedQrId: activeSelectedId,
                qrImageUrl: activeQrUrl,
                upiId: activeUpiId,
                lastUpdated: now,
                updatedBy: updatedBy || "Authorized Admin",
            };

            saveStoredSettings(updatedSettings);

            return NextResponse.json({
                success: true,
                message: `"${target.title}" removed from QR library.`,
                settings: updatedSettings,
            });
        }

        // ACTION D: RESET TO ORIGINAL SYSTEM DEFAULTS
        if (isReset) {
            const defaultSettings: PaymentSettings = {
                qrImageUrl: DEFAULT_PRESET_QRS[0].qrImageUrl,
                upiId: DEFAULT_PRESET_QRS[0].upiId,
                payeeName: DEFAULT_PRESET_QRS[0].payeeName,
                amount: 320,
                notes: "Scan with any UPI app to pay ₹320 4-year club membership fee.",
                lastUpdated: now,
                updatedBy: updatedBy || "Authorized Admin",
                qrMode: "custom_image",
                selectedQrId: DEFAULT_PRESET_QRS[0].id,
                availableQrs: currentSettings.availableQrs.length > 0 ? currentSettings.availableQrs : DEFAULT_PRESET_QRS,
                qrImageBackup: "",
            };

            saveStoredSettings(defaultSettings);
            return NextResponse.json({
                success: true,
                message: "QR code and UPI settings reset to original Axis Bank default.",
                settings: defaultSettings,
            });
        }

        // ACTION E: STANDARD FORM SAVE / PUBLISH
        let resolvedQrImageUrl = qrImageUrl || currentSettings.qrImageUrl;
        let qrImageBackup = currentSettings.qrImageBackup || "";

        if (qrImageUrl && qrImageUrl.startsWith("data:image/")) {
            try {
                resolvedQrImageUrl = saveBase64Image(qrImageUrl, "custom-payment-qr");
                qrImageBackup = qrImageUrl;
            } catch (imageErr) {
                console.error("Failed to write custom QR image file:", imageErr);
                resolvedQrImageUrl = qrImageUrl;
            }
        }

        // Check if selectedQrId is provided or matches an item
        let finalSelectedQrId = body.selectedQrId || currentSettings.selectedQrId;
        const matchingItem = currentSettings.availableQrs.find(
            (q) => q.qrImageUrl === resolvedQrImageUrl || q.id === finalSelectedQrId
        );
        if (matchingItem) {
            finalSelectedQrId = matchingItem.id;
        }

        const updatedSettings: PaymentSettings = {
            ...currentSettings,
            qrImageUrl: resolvedQrImageUrl,
            upiId: (upiId && upiId.trim()) || currentSettings.upiId,
            payeeName: (payeeName && payeeName.trim()) || currentSettings.payeeName,
            amount: Number(amount) > 0 ? Number(amount) : currentSettings.amount,
            notes: notes !== undefined ? notes : currentSettings.notes,
            lastUpdated: now,
            updatedBy: updatedBy || "Authorized Admin",
            qrMode: qrMode || (qrImageUrl ? "custom_image" : currentSettings.qrMode || "custom_image"),
            selectedQrId: finalSelectedQrId,
            qrImageBackup: qrImageBackup || currentSettings.qrImageBackup,
        };

        saveStoredSettings(updatedSettings);

        return NextResponse.json({
            success: true,
            message: "Payment QR code and UPI details updated successfully.",
            settings: updatedSettings,
        });
    } catch (error: any) {
        console.error("Error updating QR settings:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update QR code settings." },
            { status: 500 }
        );
    }
}
