"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface StatCounterProps {
    icon: ReactNode;
    end: number;
    label: string;
    prefix?: string;
    suffix?: string;
}

export default function StatCounter({
    icon,
    end,
    label,
    prefix = "",
    suffix = "+",
}: StatCounterProps) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

    useEffect(() => {
        if (!inView) return;

        let start = 0;
        const duration = 2000; // 2 Seconds
        const frameDuration = 1000 / 60; // 60 FPS
        const totalFrames = Math.round(duration / frameDuration);
        const easeOutQuad = (t: number) => t * (2 - t);

        let currentFrame = 0;
        const counterInterval = setInterval(() => {
            currentFrame++;
            const progress = easeOutQuad(currentFrame / totalFrames);
            const currentCount = Math.round(end * progress);

            setCount(currentCount);

            if (currentFrame >= totalFrames) {
                setCount(end);
                clearInterval(counterInterval);
            }
        }, frameDuration);

        return () => clearInterval(counterInterval);
    }, [inView, end]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
        >
            <div className="p-3 mb-4 rounded-xl bg-rotaract-cranberry/10 text-rotaract-cranberry group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-rotaract-navy font-heading tracking-tight mb-1">
                {prefix}
                {count.toLocaleString()}
                {suffix}
            </div>
            <p className="text-xs md:text-sm font-bold text-rotaract-navy font-body text-center uppercase tracking-wider">
                {label}
            </p>
        </motion.div>
    );
}