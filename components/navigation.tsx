"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "@/styles/navigation.module.css";

export default function Navigation() {
  const path = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 로그인 상태 체크 (sessionStorage 사용)
    const checkLoginStatus = () => {
      const status = sessionStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(status);
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("storage"));
    setShowDropdown(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logoWrapper}>
        <Link href="/">
          <div className={styles.logo}>Netist</div>
        </Link>
      </div>
      <ul className={styles.menuListHorizontal}>
        <li>
          <Link href="/home">
            <span
              className={`${styles.menuItem} ${
                path === "/home" ? styles.active : ""
              }`}
            >
              Home {path === "/home" ? "🔥" : ""}
            </span>
          </Link>
        </li>
        <li>
          <Link href="/sketch">
            <span
              className={`${styles.menuItem} ${
                path === "/sketch" ? styles.active : ""
              }`}
            >
              Sketch {path === "/sketch" ? "🔥" : ""}
            </span>
          </Link>
        </li>
        <li>
          <Link href="/craft">
            <span
              className={`${styles.menuItem} ${
                path === "/craft" ? styles.active : ""
              }`}
            >
              Craft {path === "/craft" ? "🔥" : ""}
            </span>
          </Link>
        </li>
      </ul>
      <div className={styles.socialLinks}>
        <a href="https://github.com/yunkon-kim/netist" target="_blank">
          <Image
            className={styles.socialLogo}
            src="/images/logo/github-mark.png"
            alt="GitHub"
            width={0}
            height={0}
            unoptimized
          />
        </a>
        <a href="https://github.com/cloud-barista" target="_blank">
          <Image
            className={styles.socialLogo}
            src="/images/logo/cloud-barista.png"
            alt="Cloud-Barista organization"
            width={0}
            height={0}
            unoptimized
          />
        </a>
      </div>
      <div className={styles.signInWrapper}>
        {isLoggedIn ? (
          <div className={styles.profileContainer} ref={dropdownRef}>
            <div
              className={styles.profileIcon}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Image
                src="/images/profile/default.png"
                alt="Profile"
                width={36}
                height={36}
                className={styles.profileImage}
              />
            </div>
            {showDropdown && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownItem}>Profile</div>
                <div className={styles.dropdownItem} onClick={handleSignOut}>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className={styles.signInButton}>Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
