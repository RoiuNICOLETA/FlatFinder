/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import {  useState } from 'react';


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

// ✅ Adăugat efectul de desfășurare la lista de favorite
import { useFavorites } from "../FavoritesContext";
import { useFlats } from "../FlatContext";
import FlatCard from "../FlatCard/FlatCard";
import styles from "./FavoritesList.module.css";


const FavoritesList = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { flats } = useFlats();

  // ✅ We only filter favorite apartments
  const favoriteFlats = flats.filter((flat) =>
    favorites.some((fav) => fav.flatId === flat.id)
  );

  return (
    <PageAnimation> {/* 🔹 Aplicat animația la întreaga listă */}
      <div className={styles.favoritesContainer}>
        <div className={styles.favoriteHead}>
          <h2>My Favorites</h2>
        </div>

        {favoriteFlats.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          <div className={styles.favoritesGrid}>
            {favoriteFlats.map((flat) => (
              <FlatCard
                key={flat.id}
                flat={flat}
                onRemoveFavorite={removeFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </PageAnimation>
  );
};

export default FavoritesList;
