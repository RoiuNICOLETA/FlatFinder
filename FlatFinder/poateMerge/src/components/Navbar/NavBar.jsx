/* eslint-disable react/prop-types */
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo2.png";
import { useUser } from "../../components/context/UserContext";

const NavBar = () => {
  const { currentUser, handleLogout, deleteUserAccount, timeLeft, formatTime } =
    useUser();
  const [displayUser, setDisplayUser] = useState(null);
  const location = useLocation();
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Some people are looking for a beautiful place. Others make it beautiful."
  );
  const [key, setKey] = useState(0); // ✅ We change the `key` to force the message to be re-rendered

  useEffect(() => {
    setDisplayUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setWelcomeMessage(
        `HELLO, ${currentUser.firstName.toUpperCase()} ${currentUser.lastName.toUpperCase()}!`
      );
      setKey((prevKey) => prevKey + 1); // ✅ We change `key` to force the re-rendering of the AnimatedText
    } else {
      setWelcomeMessage(
        "Some people are looking for a beautiful place. Others make it beautiful."
      );
      setKey((prevKey) => prevKey + 1); // ✅ We also provide re-rendering to return to the original message
    }
  }, [currentUser]);

  return (
    <nav className={styles.navbar}>
      {/* ✅ LOGO AND SESSION (TIME) */}
      <div className={styles.topBar}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="FlatFinder Logo" className={styles.logoImage} />
        </div>

        {/* ✅ MOTIVATION TEXT / HELLO MESSAGE */}
        <AnimatedText key={key} text={welcomeMessage} />

        {displayUser && (
          <p className={styles.sessionTime}>
            Session expires in: <strong>{formatTime(timeLeft)}</strong>
          </p>
        )}
      </div>

      {/* ✅ NAVIGATION MENU */}
      <div className={styles.navLinks}>
        {!displayUser ? (
          <>
            <Link
              to="/login"
              className={location.pathname === "/login" ? styles.active : ""}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={location.pathname === "/register" ? styles.active : ""}
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className={location.pathname === "/" ? styles.active : ""}
            >
              Home
            </Link>
            <Link
              to="/my-flats"
              className={location.pathname === "/my-flats" ? styles.active : ""}
            >
              My Flats
            </Link>
            <Link
              to="/new-flat"
              className={location.pathname === "/new-flat" ? styles.active : ""}
            >
              Add New Flat
            </Link>
            <Link
              to="/favorites"
              className={
                location.pathname === "/favorites" ? styles.active : ""
              }
            >
              ⭐ Favorites
            </Link>
            <Link
              to={`/profile/${currentUser?.id}`}
              className={
                location.pathname.includes("/profile") ? styles.active : ""
              }
            >
              My Profile
            </Link>
            {currentUser?.role === "admin" && (
              <Link
                to="/users"
                className={location.pathname === "/users" ? styles.active : ""}
              >
                Manage Users
              </Link>
            )}
            <Link
              to="/logout"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </Link>
            <Link
              to="#"
              onClick={deleteUserAccount}
              className={styles.deleteButton}
            >
              Delete Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* ✅ MOVE AnimatedText OUTSIDE THE COMPONENT */
export const AnimatedText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText(""); // ✅ We reset the text when the `key changes`
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 100); // Letter appearance speed (100ms)

      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return <span className={styles.animatedText}>{displayedText}</span>;
};

export default NavBar;
