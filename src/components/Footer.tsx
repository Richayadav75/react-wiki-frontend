import styles from "../assets/styles/components/Footer.module.scss";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <p>The React Times is a curated interface over the react-wiki dataset.</p>
            <p style={{ marginTop: '4px' }}>Designed for focused practice and mastery.</p>
        </footer>
    );
}
