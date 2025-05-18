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





import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../context/UserContext";
import styles from "./Profile.module.css";
import vintage13 from "../../assets/vintage13.png";

const Profile = () => {
  const { currentUser, deleteUserAccount } = useUser();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const targetUserId = userId || currentUser.id;
        const userDoc = doc(db, "users", targetUserId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setFormData(userData);
          setOriginalData(userData);
        } else {
          alert("User not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser, navigate]);

  if (loading) return 
  // <p>Loading...</p>
    <div className={styles.loader}></div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(originalData);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      if (
        !formData.userName ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.birthDate
      ) {
        alert("Please fill in all required fields.");
        return;
      }
      const targetUserId = userId || currentUser.id;
      const userDoc = doc(db, "users", targetUserId);
      await updateDoc(userDoc, formData);
      alert("Profile updated successfully!");
      setIsEditing(false);

      if (currentUser.id === targetUserId) {
        navigate("/profile");
      } else {
        navigate("/users");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  return (
    <PageAnimation>
    <>
      <div className={styles.profileContainer}>
        <h2>Profile</h2>
        <p> ____________________________</p>
        {isEditing ? (
          <form className={styles.profileForm} onSubmit={handleSave}>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              required
            />
            <input type="email" name="email" value={formData.email} disabled />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              required
            />

            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          
          <div className={styles.profileInfo}>
            <p>
              <strong>User Name:</strong> {formData.userName}
            </p>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <p>
              <strong>First Name:</strong> {formData.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {formData.lastName}
            </p>
            <p>
              <strong>Birth Date:</strong> {formData.birthDate}
            </p>
            <p>_____________________________</p>
            <button onClick={() => setIsEditing(true)}className={styles.editButton}>Edit Profile</button>
            <button onClick={deleteUserAccount} className={styles.deleteButton}>
              Delete Account
            </button>
          </div>
          
        )}
        <div className={styles.imgProfile}>
          <img
            src={vintage13}
            alt="FlatFinder img"
            className={styles.profileImage}
          />
        </div>
      </div>
    </>
    </PageAnimation>
  );
};

export default Profile;

