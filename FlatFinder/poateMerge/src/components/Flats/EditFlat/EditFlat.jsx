/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
const PageAnimation = ({ children }) => {
  const [setAnimationComplete] = useState(false);

  return (
    <motion.div
      initial={{
        scaleY: 0.2,
        opacity: 0,
        rotateX: -60,
        filter: "blur(10px)",
      }}
      animate={{
        scaleY: 1,
        opacity: 1,
        rotateX: 0,
        filter: "blur(0px)",
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

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFlats } from "../FlatContext";
import styles from "./EditFlat.module.css";
import { useFlatDetails } from "../FlatDetailsContext";

const EditFlat = () => {
  const { flats, updateFlat } = useFlats();
  const { flatId } = useParams();
  const navigate = useNavigate();
  const { flatDetails, fetchFlatDetails, updateFlatDescription } =
    useFlatDetails();
  const [description, setDescription] = useState("");

  // ✅We take over the current apartment
  const currentFlat = flats.find((flat) => flat.id === flatId);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    street: "",
    streetNumber: "",
    areaSize: "",
    hasAC: false,
    yearBuilt: "",
    rentPrice: "",
    dateAvailable: "",
  });

  useEffect(() => {
    fetchFlatDetails(flatId);
  }, [flatId]);

  useEffect(() => {
    if (flatDetails) {
      setDescription(flatDetails.description || "");
    }
  }, [flatDetails]);

  const handleSave = async () => {
    await updateFlatDescription(flatId, description);
    alert("Description updated successfully!");
    navigate(`/flat/${flatId}`); // ✅ Redirects the user
  };
  // ✅We populate the form with the existing data
  useEffect(() => {
    if (currentFlat) {
      setFormData({ ...currentFlat });
    }
  }, [currentFlat]);

  //✅ We handle changes in inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //✅ We reset to the initial values
  const handleReset = () => {
    setFormData({ ...currentFlat });
  };

  // ✅Save the changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting update for:", formData);

    //✅ Simple validation
    for (const key in formData) {
      if (!formData[key] && key !== "hasAC") {
        alert(`Field "${key}" is required.`);
        return;
      }
    }

    try {
      await updateFlat(flatId, formData);
      alert("Flat updated successfully!");
      navigate("/my-flats"); // ✅ We are redirecting the user
    } catch (error) {
      console.error("Error updating flat:", error);
      alert("An error occurred while updating the flat.");
    }
  };

  return (
    <PageAnimation>
      <div className={styles.editFlatContainer}>
        <h2>Edit Flat</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Flat Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="street"
            placeholder="Street"
            value={formData.street}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="streetNumber"
            placeholder="Street Number"
            value={formData.streetNumber}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="areaSize"
            placeholder="Area Size (mp)"
            value={formData.areaSize}
            onChange={handleInputChange}
            required
          />
          <label>
            <input
              className={styles.checkBox}
              type="checkbox"
              name="hasAC"
              checked={formData.hasAC}
              onChange={handleInputChange}
            />{" "}
            Has AC
          </label>
          <input
            type="number"
            name="yearBuilt"
            placeholder="Year Built"
            value={formData.yearBuilt}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="rentPrice"
            placeholder="Rent Price (EUR)"
            value={formData.rentPrice}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="dateAvailable"
            value={formData.dateAvailable}
            onChange={handleInputChange}
            required
          />
          <div className={styles.editFlatDescription}>
            <h2>Edit Flat Description</h2>
            <div className={styles.textareaSave}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
              />
              <button onClick={handleSave} className={styles.saveButton}>
                Save
              </button>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.updateButton}>
              Update
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-flats")}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </PageAnimation>
  );
};

export default EditFlat;
