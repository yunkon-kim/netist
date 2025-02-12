// "use client";

// import { useState } from "react";
import DesignForm from "@/components/design/design-form";
import styles from "@/styles/design/design.module.css";

export default function DesignPage() {
  return (
    <div className={styles.pageContainer}>
      <DesignForm />
    </div>
  );
}
