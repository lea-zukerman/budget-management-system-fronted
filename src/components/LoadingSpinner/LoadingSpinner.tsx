import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "טוען...",
}) => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner} />
      <span>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
