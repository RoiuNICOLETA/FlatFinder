import FlatsList from "../../components/Flats/FlatsList/FlatsList";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      {/* <div className={styles.divText}>
        <h3 className={styles.textHome}>Welcome to FlatFinder</h3>
        <h3 className={styles.textHome}>Available Flats</h3>
      </div> */}

      <FlatsList />
    </div>
  );
};

export default Home;
