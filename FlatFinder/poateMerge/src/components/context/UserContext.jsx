/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

//✅  We create the context for the user
const UserContext = createContext();

// ✅ Function to retrieve user from Firestore
const fetchUser = async (setCurrentUser, setIsAdmin) => {
  try {
    const userId = localStorage.getItem("userId"); // ✅ We retrieve the userId from localStorage
    if (!userId) {
      setCurrentUser(null);
      setIsAdmin(false);
      return;
    }

    const userDoc = doc(db, "users", userId); // ✅ Correct reference to Firestore
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const isAdminStatus = userData.role === "admin"; // ✅ We save the correct role

      setCurrentUser({ id: userId, ...userData });
      setIsAdmin(isAdminStatus); // ✅ We update isAdmin correctly

      localStorage.setItem("userId", userId); // ✅ We save the userId in localStorage
    } else {
      console.error("User not found in Firestore");
      setCurrentUser(null);
      setIsAdmin(false);
      localStorage.removeItem("userId");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    setCurrentUser(null);
    setIsAdmin(false);
  }
};

// ✅The context provider
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minute în secunde

  // ✅We retrieve the user from localStorage on initialization
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      setIsAdmin(userData.role === "admin");
    }
  }, []);

  // ✅ We call `fetchUser()` on each refresh to reload the user data
  useEffect(() => {
    fetchUser(setCurrentUser, setIsAdmin);
  }, [currentUser?.id]); // ✅ It reloads every time the user changes

  // ✅ Visible timer for logout
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            alert("Session expired. Please log in again.");
            handleLogout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Decreases every second

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/login"; // ✅ We avoid the problem with useNavigate()
  };

  // ✅ Function for deleting the user's account and its apartments
  const deleteUserAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible."
    );
    if (!confirmDelete) return;
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.id);
      await deleteDoc(userRef);

      const flatsCollection = collection(db, "flats");
      const flatsSnapshot = await getDocs(flatsCollection);
      const userFlats = flatsSnapshot.docs.filter(
        (flatDoc) => flatDoc.data().userId === currentUser.id
      );

      for (let flat of userFlats) {
        await deleteDoc(doc(db, "flats", flat.id));
      }
      handleLogout();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // ✅ We convert seconds to minutes and seconds for the timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        handleLogout,
        deleteUserAccount,
        timeLeft,
        formatTime,
        setIsAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ✅ Hook for using the context
export const useUser = () => useContext(UserContext);

// ✅ Add export for `fetchUser`
export { fetchUser };
