/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
const PageAnimation = ({ children }) => {
  const [setAnimationComplete] = useState(false);

  return (
    <motion.div
      initial={{
        scaleY: 0.2,
        opacity: 0,
        rotateX: -60,
        filter: 'blur(10px)',
      }}
      animate={{
        scaleY: 1,
        opacity: 1,
        rotateX: 0,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: 1.2,
        ease: [0.32, 0.72, 0, 1],
      }}
      onAnimationComplete={() => setAnimationComplete(true)}
      className={styles.pageContainer}
    >
      {children}
    </motion.div>
  );
};


import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import styles from "./Login.module.css";
import { useUser } from "../../components/context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginUser = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const validateLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrorMessage("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = { id: userId, ...userDoc.data() };

        // ✅ We save the userId in localStorage
        localStorage.setItem("userId", userId);
        setCurrentUser(userData); // ✅ We update the user in the context

        toast.success("✅ Login successful!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: styles.toastSuccess, // ✅ Apply the custom style
        });

        setTimeout(() => navigate("/"), 2000); // ✅ After 2 seconds, it redirects to the homepage
      } else {
        setErrorMessage("Incorrect email or password.");
        toast.error("❌ Incorrect email or password!", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error fetching user: ", error);
      setErrorMessage("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <PageAnimation>
    <div className={styles.loginContainer}>
      <ToastContainer />{" "}
      {/* ✅ Add the Toast container to display notifications */}
      <h2>Login</h2>
      <form method="post" onSubmit={validateLogin}>
        <input
          className={styles.inputMail}
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
    </PageAnimation>
  );
};

export default LoginUser;
