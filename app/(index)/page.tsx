import Link from "next/link";
import styles from "@/styles/index.module.css";

export default function Index() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>Netist</div>
        </div>
        <h1 className={styles.title}>
          Sketch Like an Artist, Craft Like a Specialist
        </h1>
        <p className={styles.description}>
          Netist empowers you to sketch multi-cloud networks like an artist and
          craft them like a specialist. With its intuitive interface, it helps
          you design, create, and manage multi-cloud network architectures
          across various cloud service providers.
        </p>
        <Link href="/home" className={styles.button}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
