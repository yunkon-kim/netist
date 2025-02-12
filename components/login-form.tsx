"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import styles from "@/styles/login.module.css";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username !== process.env.NEXT_PUBLIC_NETIST_ADMIN_USERNAME) {
      setError("Invalid username or password");
      return;
    }

    try {
      const hashedPassword = process.env.NEXT_PUBLIC_NETIST_ADMIN_PASSWORD;
      const isValid = await bcrypt.compare(password, hashedPassword || "");

      if (isValid) {
        sessionStorage.setItem("isLoggedIn", "true");
        window.dispatchEvent(new Event("storage"));
        router.push("/home");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={styles.input}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button}>
        Login
      </button>
    </form>
  );
}
