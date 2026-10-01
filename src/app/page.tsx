import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    Users,
    Clock,
    Heart,
    Handshake,
    ArrowRight,
    Award,
    Target,
    Compass
} from "lucide-react";
import StatCounter from "@/components/StatCounter";

export default function HomePage() {
    return (
        <div className="w-full min-h-screen bg-rotaract-surface font-body">

            {/* ================= HERO SECTION ================= */}
            <section className="relative w-full h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Dark Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero-team.jpg" // High-res team photo 2025-26
                        alt="Rotaract Club of BMSCE Team 2025-26"
                        fill
                        priority
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rotaract-dark via-rotaract-navy/80 to-rotaract-navy/60" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-tight mb-6">
                        Fellowship Through <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rotaract-gold via-white to-rotaract-cranberry">
                            Selfless Service
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-200 font-light leading-relaxed mb-8">
                        Empowering youth, executing high-impact community initiatives, and nurturing future leaders at BMS College of Engineering.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/events"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rotaract-cranberry hover:bg-rotaract-cranberry/90 text-white font-semibold shadow-lg shadow-rotaract-cranberry/30 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <span>Explore Events</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/about"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold transition-all duration-200"
                        >
                            Meet Team 2026–27
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT ROTARACT BMSCE ================= */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Text Box */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 text-rotaract-cranberry font-semibold text-sm uppercase tracking-wider">
                            <Award className="w-4 h-4" />
                            <span>About Our Chapter</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-rotaract-navy leading-tight">
                            A Legacy of Service, Innovation, and Youth Leadership
                        </h2>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed font-light">
                            Founded over a decade ago at the historic BMS College of Engineering, the <strong className="font-semibold text-slate-800">Rotaract Club of BMSCE</strong> is a dynamic student-led organization committed to creating tangible social impact. Sponsored by the Rotary Club of Bangalore, we bring together passionate college students to solve community challenges, foster professional development, and build lifelong international friendships.
                        </p>

                        <div className="pt-2 flex items-center gap-4">
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-2 text-rotaract-cranberry font-semibold hover:gap-3 transition-all"
                            >
                                <span>Read our full story & leadership vision</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Cards / Mission & Vision */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="p-5 rounded-xl bg-rotaract-surface border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-rotaract-cranberry font-bold text-sm uppercase tracking-wider">
                                <Target className="w-4 h-4" />
                                <span>Our Mission</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                                To create lasting and meaningful impact through purposeful initiatives, foster impactful collaborations with fellow Rotaract Clubs across the district, and actively contribute to The Rotary Foundation.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-rotaract-surface border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-rotaract-navy font-bold text-sm uppercase tracking-wider">
                                <Compass className="w-4 h-4" />
                                <span>Our Vision</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                                To create lasting and meaningful impact through purposeful initiatives, foster meaningful collaborations with fellow Rotaract Clubs across the district, and strengthen our commitment to supporting The Rotary Foundation through active contributions.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ================= STATS SECTION ================= */}
            <section className="py-20 bg-gradient-to-b from-slate-900 to-rotaract-dark text-white relative">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                            2025–26 in Numbers
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base font-light">
                            A quick look at the measurable impact created by the club over the past Rotaract year.
                        </p>
                    </div>

                    {/* Grid of 6 Animated Counter Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCounter
                            icon={<Calendar className="w-7 h-7" />}
                            end={100}
                            label="Events Conducted"
                            suffix="+"
                        />
                        <StatCounter
                            icon={<Users className="w-7 h-7" />}
                            end={7100}
                            label="Beneficiaries"
                            suffix="+"
                        />
                        <StatCounter
                            icon={<Clock className="w-7 h-7" />}
                            end={21000}
                            label="Volunteering Hours"
                            suffix=" hrs"
                        />
                        <StatCounter
                            icon={<Heart className="w-7 h-7" />}
                            end={140000}
                            label="Funds Raised"
                            prefix="₹"
                            suffix="+"
                        />
                        <StatCounter
                            icon={<Handshake className="w-7 h-7" />}
                            end={3}
                            label="Reach on social media"
                            suffix="M+"
                        />
                        <StatCounter
                            icon={<Award className="w-7 h-7" />}
                            end={15}
                            label="NGO Partners"
                            suffix="+"
                        />
                    </div>

                </div>
            </section>

            {/* ================= CTA STRIP ================= */}
            <section className="py-16 px-6 bg-rotaract-cranberry text-white">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-bold font-heading">
                            Ready to Make a Real Impact?
                        </h3>
                        <p className="text-white/80 text-sm md:text-base font-light">
                            Join the Rotaract Club of BMSCE and develop leadership skills, forge lifelong friendships, and serve the community.
                        </p>
                    </div>

                    <Link
                        href="/join-the-club"
                        className="px-8 py-3.5 rounded-xl bg-rotaract-navy hover:bg-rotaract-dark text-white font-semibold shadow-lg transition-all duration-200 flex-shrink-0 flex items-center gap-2 group"
                    >
                        <span>Become a Member</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

        </div>
    );
}