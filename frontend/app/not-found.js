import Link from "next/link";
import styles from "./state.module.css";

export default function NotFound() {
  return (
    <main className={styles.statePage}>
      <section className={styles.statePanel}>
        <p className={styles.eyebrow}>404</p>
        <div className={styles.pathMark}>?</div>
        <h1>This route is not in the flow</h1>
        <p>
          SignalFlow only needs the builder, generated assets, and API routes
          right now. Return to the main workspace and keep shipping.
        </p>
        <div className={styles.actions}>
          <Link href="/">Back to builder</Link>
        </div>
      </section>
    </main>
  );
}
