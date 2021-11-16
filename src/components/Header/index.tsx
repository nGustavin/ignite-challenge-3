import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      <Link href="/">
        <img src="images/Logo.svg" alt="logo" />
      </Link>
    </div>
  );
}
