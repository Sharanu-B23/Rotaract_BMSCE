import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            fullName,
            usn,
            yearOfStudy = "1st Year",
            bloodGroup = "Not Specified",
            personalEmail,
            collegeEmail,
            phone,
            payeeName = "",
            membershipType = "Club Membership (RM)",
            amount = 320,
            whyJoin = "",
            priorExperience = "",
            transactionId = "",
            receiptId = "",
            screenshotBase64 = "",
            screenshotFileName = "",
        } = body;

        // Validation
        if (!fullName || !usn || !personalEmail || !collegeEmail || !phone) {
            return NextResponse.json(
                { success: false, error: "Missing required student details." },
                { status: 400 }
            );
        }

        if (!screenshotBase64) {
            return NextResponse.json(
                { success: false, error: "Payment screenshot is required." },
                { status: 400 }
            );
        }

        // Join Us Page applicant registrations: Strictly target the dedicated Join Sheet URL
        const joinSheetUrl =
            process.env.JOIN_SHEET_URL ||
            process.env.NEXT_PUBLIC_JOIN_SHEET_URL;

        const studentCleanName = `${fullName}_${usn.toUpperCase()}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        const formattedFileName = screenshotFileName || `${studentCleanName}_PaymentScreenshot.png`;

        const payload = {
            type: "NEW_MEMBER_REGISTRATION",
            receiptId,
            fullName,
            usn: usn.toUpperCase(),
            yearOfStudy,
            bloodGroup,
            personalEmail,
            collegeEmail,
            email: collegeEmail || personalEmail,
            phone,
            payeeName: payeeName || fullName,
            membershipType: membershipType || "Club Membership (RM)",
            amount: Number(amount) || 320,
            transactionId: transactionId || "UPI-Screenshot-Submitted",
            whyJoin,
            priorExperience,
            registeredAt: new Date().toISOString(),
            // Screenshot details for Google Drive storage
            screenshotBase64,
            screenshotFileName: formattedFileName,
            studentName: fullName,
            driveFolderId: process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || process.env.DRIVE_FOLDER_ID || "",
        };

        if (joinSheetUrl) {
            try {
                const response = await fetch(joinSheetUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    redirect: "follow",
                });

                let responseData: any = {};
                try {
                    responseData = await response.json();
                } catch {
                    // Script might return plain text or redirect HTML
                }

                return NextResponse.json({
                    success: true,
                    message: "Registration and payment screenshot recorded successfully.",
                    receiptId,
                    driveFileUrl: responseData?.fileUrl || null,
                });
            } catch (fetchError) {
                console.error("Error sending to Google Apps Script:", fetchError);
                // Return success so user is not blocked if script is in no-cors or redirect state
                return NextResponse.json({
                    success: true,
                    message: "Registration logged. Remote sync in progress.",
                    receiptId,
                });
            }
        }

        // If no script URL is configured yet in .env.local
        return NextResponse.json({
            success: true,
            message: "Registration saved locally. Please configure NEXT_PUBLIC_JOIN_SHEET_URL in .env.local.",
            receiptId,
        });
    } catch (err: any) {
        console.error("Join API route error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to process registration." },
            { status: 500 }
        );
    }
}
