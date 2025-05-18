import { useEffect, useState } from "react";
import { useFlats } from "../FlatContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import FlatCard from "../FlatCard/FlatCard";
import styles from "./MyFlats.module.css";

const MyFlats = () => {
  const { flats, deleteFlat } = useFlats();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [userFlats, setUserFlats] = useState([]);

  // ✅ We filter the apartments of the logged in user
  useEffect(() => {
    if (currentUser) {
      setUserFlats(flats.filter((flat) => flat.userId === currentUser.id));
    }
  }, [flats, currentUser]);

  // ✅ Delete apartment
  const handleDelete = async (flatId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this flat?"
    );
    if (confirmDelete) {
      await deleteFlat(flatId);
    }
  };

  return (
    <div className={styles.myFlatsContainer}>
      <div className={styles.textareaSave}>
        <h2 className={styles.headerText}>My Flats</h2>

        <button
          className={styles.addFlatButton}
          onClick={() => navigate("/new-flat")}
        >
          Add New Flat
        </button>
      </div>

      <div className={styles.flatsGrid}>
        {userFlats.length > 0 ? (
          userFlats.map((flat) => (
            <FlatCard
              key={flat.id}
              flat={{
                ...flat,
                userName: currentUser?.userName || "Unknown",
                ownerEmail: currentUser?.email || "Not available",
              }}
              onDelete={handleDelete}
            /> // ✅ Folosim FlatCard
          ))
        ) : (
          <p>No flats added yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyFlats;
