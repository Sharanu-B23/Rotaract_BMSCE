import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Admin Portal member registrations: Strictly target the Admin Google Script Sheet URL
        const sheetUrl =
            process.env.GOOGLE_SCRIPT_URL ||
            process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

        if (!sheetUrl) {
            return NextResponse.json(
                { success: false, error: "Admin Google Script Webhook URL (GOOGLE_SCRIPT_URL or NEXT_PUBLIC_GOOGLE_SCRIPT_URL) is missing in .env.local" },
                { status: 500 }
            );
        }

        const response = await fetch(sheetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            redirect: "follow",
        });

        const textResponse = await response.text();
        let jsonResponse: any = {};
        try {
            jsonResponse = JSON.parse(textResponse);
        } catch {
            jsonResponse = { raw: textResponse };
        }

        if (jsonResponse.result === "error") {
            return NextResponse.json(
                { success: false, error: jsonResponse.error || "Google Apps Script rejected the registration." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            receiptId: jsonResponse.receiptId || body.receiptId,
            desk: jsonResponse.desk || body.desk,
            message: jsonResponse.message || "Registration recorded successfully.",
        });

    } catch (error: any) {
        console.error("Admin member registration API error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to communicate with Google Sheets." },
            { status: 500 }
        );
    }
}
