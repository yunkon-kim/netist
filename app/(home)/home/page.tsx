import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <Image
            className={styles.logo}
            src="/images/logo/cloud-barista.png"
            alt="Cloud-Barista Logo"
            width={0}
            height={0}
            priority
            unoptimized
          />
        </div>
        <h1 className={styles.title}>Empowering Your Cloud Journey</h1>
        <p className={styles.description}>
          The Cloud-Barista Community drives innovation in multi-cloud
          technology to create a global cloud integration platform and leverage
          cloud diversity and infinite potential.
        </p>
        <Link
          href="https://github.com/cloud-barista"
          className={styles.button}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Cloud-Barista Community
        </Link>
      </div>
    </div>
  );
}
