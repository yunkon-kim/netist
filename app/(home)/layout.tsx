import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import styles from "@/styles/layout.module.css";
import { initializeProvidersAndRegions } from "@/lib/tumblebug/api";

async function initializeApp() {
  try {
    await initializeProvidersAndRegions();
  } catch (error) {
    console.error("Failed to initialize CSP regions:", error);
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initializeApp();
  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.layoutContainer}>
        <main className={styles.mainContent}>
          <Navigation />
          <div className={styles.contentWrapper}>{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
