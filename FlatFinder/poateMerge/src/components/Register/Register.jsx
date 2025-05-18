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


/* eslint-disable react-refresh/only-export-components */
import { Form, useNavigate } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import styles from "./Register.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const actionRegister = async ({ request }) => {
  const formData = await request.formData();
  const user = {
    userName: formData.get("userName"),
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
  };

  console.log("Form data submitted:", user);
  return null;
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const validateForm = async (event) => {
    event.preventDefault();
    setErrors([]); //✅ We reset the errors

    const userName = event.target.userName.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();
    const confirmPassword = event.target.confirmPassword.value.trim();
    const firstName = event.target.firstName.value.trim();
    const lastName = event.target.lastName.value.trim();
    const birthDate = event.target.birthDate.value;

    let validationErrors = [];

    //✅ Check empty fields
    if (!userName) validationErrors.push("User Name is required.");
    if (!email) validationErrors.push("Email is required.");
    if (!password) validationErrors.push("Password is required.");
    if (!firstName) validationErrors.push("First Name is required.");
    if (!lastName) validationErrors.push("Last Name is required.");
    if (!birthDate) validationErrors.push("Birth Date is required.");

    //✅ Check email format
    if (email && !email.match(/^\S+@\S+\.\S+$/))
      validationErrors.push("Invalid email format.");
    if (firstName.length < 2)
      validationErrors.push("First Name must be at least 2 characters long.");
    if (lastName.length < 2)
      validationErrors.push("Last Name must be at least 2 characters long.");

    //✅ Age verification (18-120 years)
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        validationErrors.push("Invalid birth date format.");
      } else {
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDifference = today.getMonth() - birthDateObj.getMonth();
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
        ) {
          age--;
        }
        if (age < 18 || age > 120) {
          validationErrors.push("Age must be between 18 and 120 years.");
        }
      }
    }

    //✅ Password validation
    if (password.length < 6)
      validationErrors.push("Password must be at least 6 characters long.");
    if (!password.match(/[a-zA-Z]/))
      validationErrors.push("Password must contain at least one letter.");
    if (!password.match(/[0-9]/))
      validationErrors.push("Password must contain at least one number.");
    if (!password.match(/[^a-zA-Z0-9]/))
      validationErrors.push(
        "Password must contain at least one special character."
      );

    // ✅Password confirmation check
    if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach((error) =>
        toast.error(`❌ ${error}`, { position: "bottom-right" })
      );
      return;
    }

    // ✅Save to Firestore
    const user = {
      userName,
      email,
      password,
      firstName,
      lastName,
      birthDate,
      role: "user",
    };

    try {
      const docRef = await addDoc(collection(db, "users"), user);
      console.log("Document written with ID: ", docRef.id);

      toast.success("✅ Register successful!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: styles.toastSuccess,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error adding document: ", error);

      toast.error(
        "❌ An error occurred while saving the data. Please try again.",
        { position: "bottom-right" }
      );
    }
  };

  return (
    <PageAnimation>
    <div className={styles.registerContainer}>
      <ToastContainer />
      <h2>Register</h2>

      {errors.length > 0 && (
        <div className={styles.errorBox}>
          {errors.map((error, index) => (
            <p key={index} className={styles.errorText}>
              {error}
            </p>
          ))}
        </div>
      )}

      <Form method="post" onSubmit={validateForm}>
        <input type="text" name="userName" placeholder="User Name" required />
        <input type="email" name="email" placeholder="Email" required />

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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
        />
        <input type="text" name="firstName" placeholder="First Name" required />
        <input type="text" name="lastName" placeholder="Last Name" required />
        <input type="date" name="birthDate" required />
        <button type="submit">Register</button>
      </Form>
    </div>
    </PageAnimation>
  );
};

export default Register;
