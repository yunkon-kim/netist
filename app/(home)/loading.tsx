import styles from "@/styles/loading.module.css";

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loadingDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
}
