import { Outlet } from "react-router-dom"; 
import NavBar from "../Navbar/NavBar"; 
import Footer from "../Footer/Footer"; 
import styles from "./AppLayout.module.css"


const AppLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer className={styles.footer} />
    </div>
  );
};

export default AppLayout;
