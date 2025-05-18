/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../context/UserContext";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { currentUser } = useUser();
  const [favorites, setFavorites] = useState([]);

  // ✅ Function to retrieve current user's favorites
  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser]);

  const fetchFavorites = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", currentUser.id)
      );
      const querySnapshot = await getDocs(q);
      const favoritesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favoritesList);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // ✅ Function to add an apartment to favorites
  const addFavorite = async (flatId) => {
    if (!currentUser) {
      alert("You must be logged in to add favorites.");
      return;
    }

    try {
      const newFavorite = {
        userId: currentUser.id,
        flatId,
      };

      const docRef = await addDoc(collection(db, "favorites"), newFavorite);
      setFavorites([...favorites, { id: docRef.id, ...newFavorite }]);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  // ✅ Function to remove an apartment from favorites
  const removeFavorite = async (flatId) => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", currentUser.id),
        where("flatId", "==", flatId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const favoriteDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, "favorites", favoriteDoc.id));

        setFavorites(favorites.filter((fav) => fav.flatId !== flatId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
