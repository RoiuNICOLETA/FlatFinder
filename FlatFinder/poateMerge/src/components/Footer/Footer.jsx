import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

const Footbar = () => {
  return (
    <footer className={styles.footbar}>
      <div className={styles.container}>
        <div className={styles.links}>
          <h3>FlatFinder</h3>
          <ul>
            <li><Link to="/about">Despre noi</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/terms">Termeni și condiții</Link></li>
            <li><Link to="/privacy">Politica de confidențialitate</Link></li>
          </ul>
        </div>
        <div className={styles.contact}>
          <h3>Contact</h3>
          <p>Email: contact@flatfinder.com</p>
          <p>Telefon: +40 123 456 789</p>
          <p>Adresă: Strada Exemplu, Nr. 10, București</p>
        </div>
      </div>
      <div className={styles.copy}>
        <p>&copy; {new Date().getFullYear()} FlatFinder. Toate drepturile rezervate.</p>
      </div>
    </footer>
  );
};

export default Footbar;
