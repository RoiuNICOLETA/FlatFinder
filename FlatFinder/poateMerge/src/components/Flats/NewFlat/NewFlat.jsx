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

/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useFlats } from "../FlatContext";
import { useImgBB } from "../ImgBBContext"; // ✅ Folosim ImgBB pentru încărcare imagini
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "./NewFlat.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewFlat = () => {
  const { addFlat } = useFlats();
  const imgBB = useImgBB();

  const { currentUser } = useUser();
  const navigate = useNavigate();

  if (!imgBB || !imgBB.uploadImage) {
    console.error(
      "useImgBB is undefined. Make sure ImgBBProvider is wrapping the component."
    );
    return <p>Error: Image upload service is not available.</p>;
  }

  const { uploadImage } = imgBB;

  // ✅ States for form data
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
    description: "",
  });

  // ✅ States for image and loading
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Function for changing the values of the form data.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Image selection function
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // ✅ Form reset function
  const handleReset = () => {
    setFormData({
      name: "",
      city: "",
      street: "",
      streetNumber: "",
      areaSize: "",
      hasAC: false,
      yearBuilt: "",
      rentPrice: "",
      dateAvailable: "",
      description: "",
    });
    setImage(null);
  };

  // ✅ Form submission function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: all fields are mandatory (except checkbox)
    for (const key in formData) {
      if (!formData[key] && key !== "hasAC") {
        alert(`Field "${key}" is required.`);
        return;
      }
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.dateAvailable > today) {
      toast.error("❌ Date available cannot be in the future."),
        { position: "bottom-right" };
      return;
    }
    if (!image) {
      toast.error("❌ Please select an image."), { position: "bottom-right" };
      return;
    }

    setUploading(true);

    try {
      // ✅ We upload the image to ImgBB and get the URL
      const imageUrl = await uploadImage(image);
      if (!imageUrl) {
        throw new Error("Image upload failed");
      }

      // ✅ We add the apartment with the image URL
      await addFlat({
        ...formData,
        userId: currentUser?.id || "guest", // ✅ We add the userId if it exists
        imageUrl,
      });

      toast.success("✅ Flat added successfully!"),
        { position: "bottom-left" };
      setTimeout(() => navigate("/my-flats"), 3000); // ✅ Redirects to MyFlats
    } catch (error) {
      console.error("Error adding flat:", error);
      toast.error("❌ Failed to add flat."), { position: "bottom-right" };
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageAnimation>
      <div className={styles.newFlatContainer}>
        <ToastContainer />
        <h2>Add New Flat</h2>

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

          {/* ✅ Texting for description */}
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />

          {/* ✅ Input for image selection */}
          <input
            className={styles.chooseFile}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          {uploading && <div className={styles.loader}></div>}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={uploading}
              className={styles.saveButton}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </PageAnimation>
  );
};

export default NewFlat;
