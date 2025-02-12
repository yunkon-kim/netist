import Image from "next/image";
import styles from "@/styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <p>© 2025 Cloud-Barista. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
