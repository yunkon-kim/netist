import LoginForm from "@/components/login-form";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
