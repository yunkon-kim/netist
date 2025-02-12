import styles from "@/styles/layout.module.css";

export default function IndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.layoutContainer}>
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
