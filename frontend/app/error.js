"use client";

import styles from "./state.module.css";

export default function Error({ error, reset }) {
  return (
    <main className={styles.statePage}>
      <section className={styles.statePanel}>
        <p className={styles.eyebrow}>SignalFlow error</p>
        <div className={styles.errorMark}>!</div>
        <h1>The workspace hit a snag</h1>
        <p>
          The frontend stayed up, but this route failed to render. Retry the
          workspace; if it repeats, check the backend on port 8000.
        </p>
        {error?.message && <pre className={styles.errorBox}>{error.message}</pre>}
        <div className={styles.actions}>
          <button onClick={reset} type="button">
            Try again
          </button>
          <a href="/">Back to builder</a>
        </div>
      </section>
    </main>
  );
}
