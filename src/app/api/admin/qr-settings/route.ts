import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "paymentSettings.json");
const CUSTOM_IMAGE_DIR = path.join(process.cwd(), "public", "images");
const CUSTOM_IMAGE_FILE = path.join(CUSTOM_IMAGE_DIR, "custom-payment-qr.png");

interface PaymentSettings {
    qrImageUrl: string;
    upiId: string;
    payeeName: string;
    amount: number;
    notes?: string;
    lastUpdated?: string;
    updatedBy?: string;
    qrMode?: "custom_image" | "dynamic_upi" | "default";
    qrImageBackup?: string;
}

function getDefaultSettings(): PaymentSettings {
    return {
        qrImageUrl: process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE || "/images/payment-qr.jpeg",
        upiId: process.env.NEXT_PUBLIC_UPI_ID || "vaishnavisrinivasa26-1@oksbi",
        payeeName: "Rotaract Club BMSCE",
        amount: 320,
        notes: "Scan with any UPI app to pay ₹320 4-year club membership fee.",
        lastUpdated: "",
        updatedBy: "Default System Settings",
        qrMode: "default",
    };
}

function readStoredSettings(): PaymentSettings {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
            const parsed = JSON.parse(raw);
            return {
                ...getDefaultSettings(),
                ...parsed,
            };
        }
    } catch (e) {
        console.error("Failed to read paymentSettings.json:", e);
    }
    return getDefaultSettings();
}

function saveStoredSettings(settings: PaymentSettings): void {
    try {
        const dir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), "utf-8");
    } catch (e) {
        console.error("Failed to save paymentSettings.json:", e);
    }
}

// GET: Fetch the current active QR code & UPI configuration
export async function GET() {
    const settings = readStoredSettings();
    return NextResponse.json(
        { success: true, settings },
        {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        }
    );
}

// POST: Update or Reset payment QR code & UPI configuration
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            qrImageUrl,
            upiId,
            payeeName,
            amount,
            notes,
            updatedBy,
            isReset,
            qrMode,
        } = body;

        const currentSettings = readStoredSettings();
        const now = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        // 1. Handle Reset to Defaults
        if (isReset) {
            const defaultSettings: PaymentSettings = {
                qrImageUrl: process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE || "/images/payment-qr.jpeg",
                upiId: process.env.NEXT_PUBLIC_UPI_ID || "vaishnavisrinivasa26-1@oksbi",
                payeeName: "Rotaract Club BMSCE",
                amount: 320,
                notes: "Scan with any UPI app to pay ₹320 4-year club membership fee.",
                lastUpdated: now,
                updatedBy: updatedBy || "Authorized Admin",
                qrMode: "default",
                qrImageBackup: "",
            };

            // Remove custom image file if it exists
            try {
                if (fs.existsSync(CUSTOM_IMAGE_FILE)) {
                    fs.unlinkSync(CUSTOM_IMAGE_FILE);
                }
            } catch (err) {
                console.warn("Could not delete custom QR image on reset:", err);
            }

            saveStoredSettings(defaultSettings);
            return NextResponse.json({
                success: true,
                message: "QR code and UPI settings reset to original defaults.",
                settings: defaultSettings,
            });
        }

        // 2. Process Custom QR Image (Base64 file upload or URL)
        let resolvedQrImageUrl = qrImageUrl || currentSettings.qrImageUrl;
        let qrImageBackup = currentSettings.qrImageBackup || "";

        if (qrImageUrl && qrImageUrl.startsWith("data:image/")) {
            try {
                if (!fs.existsSync(CUSTOM_IMAGE_DIR)) {
                    fs.mkdirSync(CUSTOM_IMAGE_DIR, { recursive: true });
                }

                // Extract base64 payload
                const matches = qrImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, "base64");
                    fs.writeFileSync(CUSTOM_IMAGE_FILE, buffer);

                    // Add cache-busting timestamp query parameter
                    resolvedQrImageUrl = `/images/custom-payment-qr.png?v=${Date.now()}`;
                    qrImageBackup = qrImageUrl; // Keep inline data URL for resilience
                }
            } catch (imageErr) {
                console.error("Failed to write custom QR image file:", imageErr);
                // Fall back to storing inline data URL
                resolvedQrImageUrl = qrImageUrl;
            }
        }

        const updatedSettings: PaymentSettings = {
            qrImageUrl: resolvedQrImageUrl,
            upiId: (upiId && upiId.trim()) || currentSettings.upiId,
            payeeName: (payeeName && payeeName.trim()) || currentSettings.payeeName,
            amount: Number(amount) > 0 ? Number(amount) : currentSettings.amount,
            notes: notes !== undefined ? notes : currentSettings.notes,
            lastUpdated: now,
            updatedBy: updatedBy || "Authorized Admin",
            qrMode: qrMode || (qrImageUrl ? "custom_image" : currentSettings.qrMode || "custom_image"),
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
