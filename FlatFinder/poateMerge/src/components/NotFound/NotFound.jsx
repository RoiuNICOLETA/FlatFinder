/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css"; 

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1>404</h1>
      <h2>Oops! Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className={styles.homeButton}>Go Back Home</Link>
    </div>
  );
};

export default NotFound;
