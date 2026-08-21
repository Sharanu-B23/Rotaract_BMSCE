"use client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface StatProps {
    end: number;
    label: string;
    prefix?: string;
    suffix?: string;
}

export default function StatCounter({ end, label, prefix = "", suffix = "+" }: StatProps) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const duration = 2000; // 2 seconds
            const increment = end / (duration / 16); // 60fps target

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [inView, end]);

    return (
        <div ref={ref} className="p-6 text-center bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-4xl font-extrabold text-rotaract-magenta mb-2 font-heading">
                {prefix}{count}{suffix}
            </div>
            <div className="text-sm font-medium text-slate-600 font-body">{label}</div>
        </div>
    );
}