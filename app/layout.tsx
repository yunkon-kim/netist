// src/app/layout.tsx
import type { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import "@/styles/global.css";
import styles from "@/styles/layout.module.css";

export const metadata: Metadata = {
  title: "Multi-Cloud Network Designer",
  description: "Design and manage your multi-cloud network infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className={styles.layoutWrapper}>
          <div className={styles.layoutContainer}>
            <main className={styles.mainContent}>
              <Navigation />
              <div className={styles.contentWrapper}>{children}</div>
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
