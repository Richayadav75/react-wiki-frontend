import styles from "../assets/styles/components/Navbar.module.scss";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IMAGES } from "@/constants";

export default function Navbar() {
    const [searchParams] = useSearchParams();
    const currentTrack = searchParams.get("track") || "React";
    const [dateStr, setDateStr] = useState("");

    useEffect(() => {
        setDateStr(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' · Vol. I, No. 1');
    }, []);


    return (
        <header className={styles.masthead}>
            <div className={styles.mastheadTop}>
                <span>{dateStr}</span>
                <span>
                    <a href="https://github.com/Richayadav75/react-wiki" target="_blank" rel="noopener noreferrer">
                        github.com/Richayadav75/react-wiki
                    </a> · Wiki Edition
                </span>
            </div>
            <div className={styles.mastheadMain}>
                <Link to="/" className={styles.nameplate} style={{ textDecoration: 'none' }}>
                    The Code Times
                </Link>


                <div className={styles.mastheadRight}>
                    <div className={styles.editionLine}>Daily Learning Edition</div>
                    <div className={styles.editionNum}>Est. 2024</div>
                </div>
            </div>
            <div className={styles.navStrip}>
                <Link 
                    to="/?track=Fundamentals" 
                    className={`${styles.navItem} ${currentTrack === "Fundamentals" ? styles.navItemActive : ""}`}
                >
                    Basic Concepts
                </Link>
                <Link 
                    to="/?track=JavaScript" 
                    className={`${styles.navItem} ${currentTrack === "JavaScript" ? styles.navItemActive : ""}`}
                >
                    JavaScript
                </Link>
                <Link 
                    to="/?track=React" 
                    className={`${styles.navItem} ${currentTrack === "React" ? styles.navItemActive : ""}`}
                >
                    React
                </Link>
            </div>
        </header>
    );
}
