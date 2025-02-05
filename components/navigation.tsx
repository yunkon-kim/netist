"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "@/styles/navigation.module.css";

export default function Navigation() {
  const path = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.logoWrapper}>
        <Link href="/">
          <div className={styles.logo}>Netist</div>
        </Link>
      </div>
      <ul className={styles.menuListHorizontal}>
        <li>
          <Link href="/">
            <span
              className={`${styles.menuItem} ${
                path === "/" ? styles.active : ""
              }`}
            >
              Home {path === "/" ? "🔥" : ""}
            </span>
          </Link>
        </li>
        <li>
          <Link href="/design">
            <span
              className={`${styles.menuItem} ${
                path === "/design" ? styles.active : ""
              }`}
            >
              Design {path === "/design" ? "🔥" : ""}
            </span>
          </Link>
        </li>
      </ul>
      <div className={styles.socialLinks}>
        <a href="https://github.com/yunkon-kim" target="_blank">
          <img src="/images/logo/github-mark.png" alt="GitHub" />
        </a>
        <a href="https://github.com/cloud-barista" target="_blank">
          <img
            src="/images/logo/cloud-barista.png"
            alt="Cloud-Barista organization"
          />
        </a>
      </div>
    </nav>
  );
}
