/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../context/UserContext";

const FlatContext = createContext();

export const FlatProvider = ({ children }) => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser(); // ✅ We get the current user for name and email

  // ✅ Fetch flats from Firestore
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const flatsCollection = collection(db, "flats");
        const flatsSnapshot = await getDocs(flatsCollection);
        const flatList = flatsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Flats from Firestore:", flatList);
        setFlats(flatList);
      } catch (error) {
        console.error("Error fetching flats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlats();
  }, []);

  // ✅ Get flats from Firestore
  const getFlats = async () => {
    try {
      const flatsCollection = collection(db, "flats");
      const flatsSnapshot = await getDocs(flatsCollection);
      const flatList = flatsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlats(flatList);
    } catch (error) {
      console.error("Error fetching flats:", error);
    }
  };

  //✅  Add a new flat(include owner details)
  const addFlat = async (flatData) => {
    try {
      const flatWithOwner = {
        ...flatData,
        userName: currentUser?.userName || "Unknown",
        ownerEmail: currentUser?.email || "Not available",
      };

      const docRef = await addDoc(collection(db, "flats"), flatWithOwner);
      const newFlat = { id: docRef.id, ...flatWithOwner };

      setFlats((prevFlats) => [...prevFlats, newFlat]);

      // ✅ Forces flats to reload
      await getFlats();

      return docRef.id;
    } catch (error) {
      console.error("Error adding flat:", error);
      throw error;
    }
  };

  //✅  Update flat details
  const updateFlat = async (flatId, updatedData) => {
    try {
      const flatRef = doc(db, "flats", flatId);
      await updateDoc(flatRef, updatedData);
      setFlats(
        flats.map((flat) =>
          flat.id === flatId ? { ...flat, ...updatedData } : flat
        )
      );
    } catch (error) {
      console.error("Error updating flat:", error);
    }
  };

  // ✅Delete a flat
  const deleteFlat = async (flatId) => {
    try {
      await deleteDoc(doc(db, "flats", flatId));
      setFlats(flats.filter((flat) => flat.id !== flatId));
    } catch (error) {
      console.error("Error deleting flat:", error);
    }
  };

  return (
    <FlatContext.Provider
      value={{ flats, loading, addFlat, updateFlat, deleteFlat }}
    >
      {children}
    </FlatContext.Provider>
  );
};

export const useFlats = () => useContext(FlatContext);
