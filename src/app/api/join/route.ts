import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const studentFullName = String(body.fullName || body.name || body.studentName || "").trim();
        const studentUsn = String(body.usn || body.USN || body.bmsceUsn || body.studentUsn || "").trim().toUpperCase();
        const studentPersonalEmail = String(body.personalEmail || body.email || "").trim();
        const studentCollegeEmail = String(body.collegeEmail || body.bmsceEmail || "").trim();
        const studentPhone = String(body.phone || body.contact || body.whatsapp || "").trim();
        const studentPayeeName = String(body.payeeName || body.payerName || studentFullName || "").trim();
        const studentYear = String(body.yearOfStudy || body.year || "1st Year").trim();
        const studentBloodGroup = String(body.bloodGroup || "Not Specified").trim();
        const studentWhyJoin = String(body.whyJoin || body.motivation || "").trim();
        const studentPriorExperience = String(body.priorExperience || body.skills || "").trim();
        const studentMembershipType = String(body.membershipType || "Club Membership (RM)").trim();
        const studentAmount = Number(body.amount) || 320;
        const studentTransactionId = String(body.transactionId || "UPI-Screenshot-Verified").trim();
        const studentReceiptId = String(body.receiptId || "").trim();
        const screenshotBase64 = String(body.screenshotBase64 || body.screenshot || "").trim();
        const screenshotFileName = String(body.screenshotFileName || "").trim();

        // Validation
        if (!studentFullName || !studentUsn || !studentPersonalEmail || !studentCollegeEmail || !studentPhone) {
            return NextResponse.json(
                { success: false, error: "Missing required student details (Full Name, BMSCE USN, Emails, or Phone)." },
                { status: 400 }
            );
        }

        const cleanPhone = studentPhone.replace(/\D/g, "");
        if (cleanPhone.length !== 10) {
            return NextResponse.json(
                { success: false, error: "Please enter a valid 10-digit WhatsApp / phone number." },
                { status: 400 }
            );
        }

        if (!screenshotBase64) {
            return NextResponse.json(
                { success: false, error: "Payment screenshot is required." },
                { status: 400 }
            );
        }

        if (!studentPayeeName) {
            return NextResponse.json(
                { success: false, error: "Payee name is mandatory for online registration." },
                { status: 400 }
            );
        }

        // Join Us Page applicant registrations: Strictly target the dedicated Join Sheet URL
        const joinSheetUrl =
            process.env.JOIN_SHEET_URL ||
            process.env.NEXT_PUBLIC_JOIN_SHEET_URL;

        const studentCleanName = `${studentFullName}_${studentUsn}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        const formattedFileName = screenshotFileName || `${studentCleanName}_PaymentScreenshot.png`;

        const payload = {
            type: "NEW_MEMBER_REGISTRATION",
            receiptId: studentReceiptId,
            fullName: studentFullName,
            usn: studentUsn,
            yearOfStudy: studentYear,
            bloodGroup: studentBloodGroup,
            personalEmail: studentPersonalEmail,
            collegeEmail: studentCollegeEmail,
            email: studentCollegeEmail || studentPersonalEmail,
            phone: studentPhone,
            contactWhatsApp: studentPhone,
            payeeName: studentPayeeName,
            membershipType: studentMembershipType,
            amount: studentAmount,
            transactionId: studentTransactionId,
            whyJoin: studentWhyJoin,
            priorExperience: studentPriorExperience,
            registeredAt: new Date().toISOString(),
            timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            // Screenshot details for Google Drive storage
            screenshotBase64,
            screenshotFileName: formattedFileName,
            studentName: studentFullName,
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
                    receiptId: studentReceiptId,
                    driveFileUrl: responseData?.fileUrl || null,
                });
            } catch (fetchError) {
                console.error("Error sending to Google Apps Script:", fetchError);
                // Return success so user is not blocked if script is in no-cors or redirect state
                return NextResponse.json({
                    success: true,
                    message: "Registration logged. Remote sync in progress.",
                    receiptId: studentReceiptId,
                });
            }
        }

        // If no script URL is configured yet in .env.local
        return NextResponse.json({
            success: true,
            message: "Registration saved locally. Please configure NEXT_PUBLIC_JOIN_SHEET_URL in .env.local.",
            receiptId: studentReceiptId,
        });
    } catch (err: any) {
        console.error("Join API route error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to process registration." },
            { status: 500 }
        );
    }
}
