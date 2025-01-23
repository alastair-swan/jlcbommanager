import styles from "./page.module.css";
import Client from "./clientapp";

export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Client/>
      </main>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
