"use client";

import styles from "./Navbar.module.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function NavbarContent() {
    const searchParams = useSearchParams();
    const currentTopic = searchParams.get("topic") || "All Concepts";
    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        setDateStr(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' · Vol. I, No. 1');
    }, []);

    const navItems = ["All Concepts", "Hooks", "State Management", "Fundamentals", "Performance", "Patterns"];

    return (
        <header className={styles.masthead}>
            <div className={styles.mastheadTop}>
                <span>{dateStr}</span>
                <span>
                    <a href="https://github.com/Richayadav75/react-wiki" target="_blank" rel="noopener noreferrer">
                        github.com/Richayadav75/react-wiki
                    </a> · React Edition
                </span>
            </div>
            <div className={styles.mastheadMain}>
                <Link href="/" className={styles.nameplate}>
                    The React Times
                </Link>

                <div className={styles.mascotWrap} title="React Logo">
                    <svg width="60" height="60" viewBox="-11.5 -10.23174 23 20.46348" xmlns="http://www.w3.org/2000/svg" style={{marginTop: "8px", marginBottom: "8px"}}>
                        <circle cx="0" cy="0" r="2.05" fill="#149ECA" />
                        <g stroke="#149ECA" strokeWidth="1" fill="none">
                            <ellipse rx="11" ry="4.2" />
                            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                        </g>
                    </svg>
                    <div className={styles.mascotName}>⚛</div>
                </div>

                <div className={styles.mastheadRight}>
                    <div className={styles.editionLine}>Daily Practice Edition</div>
                    <div className={styles.editionNum}>Est. 2024</div>
                </div>
            </div>
            <div className={styles.navStrip}>
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={item === "All Concepts" ? "/" : `/?topic=${item}`}
                        className={`${styles.navItem} ${currentTopic === item ? styles.navItemActive : ""}`}
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </header>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NavbarContent />
        </Suspense>
    );
}
