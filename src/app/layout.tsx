import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/app/globals.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["500", "600", "700", "800"],
    variable: "--font-poppins",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Rotaract Club of BMSCE | Official Website",
    description: "Official digital home of the Rotaract Club of BMS College of Engineering (District 3191). Explore our community impact, leadership team, legacy archive, and upcoming events.",
    keywords: ["Rotaract BMSCE", "Rotaract Club", "BMS College of Engineering", "Rotary District 3191", "Community Service Bengaluru"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
            <body className="font-body bg-rotaract-surface text-slate-800 antialiased selection:bg-rotaract-cranberry selection:text-white">
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
            </body>
        </html>
    );
}