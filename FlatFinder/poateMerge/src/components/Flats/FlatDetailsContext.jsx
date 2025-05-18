/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const FlatDetailsContext = createContext();

export const FlatDetailsProvider = ({ children }) => {
  const [flatDetails, setFlatDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Function to load apartment details
  const fetchFlatDetails = async (flatId) => {
    setLoading(true);
    try {
      const flatRef = doc(db, "flats", flatId);
      const flatSnap = await getDoc(flatRef);

      if (flatSnap.exists()) {
        setFlatDetails({ id: flatId, ...flatSnap.data() });
      } else {
        setFlatDetails(null);
      }
    } catch (error) {
      console.error("Error fetching flat details:", error);
    }
    setLoading(false);
  };

  //✅ Function for updating the description of the apartment
  const updateFlatDescription = async (flatId, newDescription) => {
    try {
      const flatRef = doc(db, "flats", flatId);
      await updateDoc(flatRef, { description: newDescription });

      setFlatDetails((prev) => ({ ...prev, description: newDescription }));
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  return (
    <FlatDetailsContext.Provider
      value={{ flatDetails, fetchFlatDetails, updateFlatDescription, loading }}
    >
      {children}
    </FlatDetailsContext.Provider>
  );
};

export const useFlatDetails = () => {
  const context = useContext(FlatDetailsContext);
  if (!context) {
    throw new Error("useFlatDetails must be used within a FlatDetailsProvider");
  }
  return context;
};
