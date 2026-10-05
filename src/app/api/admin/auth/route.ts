import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { passcode, email } = body;

        const expectedPasscode =
            process.env.ADMIN_PASSCODE ||
            process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
            "rotaract2026";

        if (!passcode || passcode.trim() !== expectedPasscode.trim()) {
            return NextResponse.json(
                { success: false, error: "Incorrect admin passcode." },
                { status: 401 }
            );
        }

        const BUILTIN_ADMIN_EMAILS = [
            "rtrsharan318@gmail.com",
            "rtrsamyakr@gmail.com",
            "rtrhimashree@gmail.com",
            "himashreeb.cd23@bmsce.ac.in",
            "vaishnavis.cs24@bmsce.ac.in",
            "mohammedhassaan.ec24@bmsce.ac.in",
            "sushanth0087@gmail.com",
            "sushanth007@gmail.com",
        ];

        const envEmails = (
            process.env.ALLOWED_ADMIN_EMAILS ||
            process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS ||
            ""
        )
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);

        const allowedEmails = Array.from(
            new Set([
                ...BUILTIN_ADMIN_EMAILS.map((e) => e.toLowerCase()),
                ...envEmails,
            ])
        );

        return NextResponse.json({
            success: true,
            allowedEmails,
            userEmail: email,
        });
    } catch {
        return NextResponse.json(
            { success: false, error: "Authentication failed." },
            { status: 500 }
        );
    }
}
