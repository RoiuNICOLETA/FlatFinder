/* eslint-disable react/prop-types */
import { createContext, useContext } from "react";

const ImgBBContext = createContext();

const IMGBB_API_KEY = "9465adc2806cfd6c4112903b98767677";

export const ImgBBProvider = ({ children }) => {
  const uploadImage = async (imageFile) => {
    if (!imageFile) {
      console.error("No image file provided.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("key", IMGBB_API_KEY);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.data.url; // ✅ Returns the URL of the image
      } else {
        console.error("Image upload failed:", data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  return (
    <ImgBBContext.Provider value={{ uploadImage }}>
      {children}
    </ImgBBContext.Provider>
  );
};

export const useImgBB = () => {
  const context = useContext(ImgBBContext);
  if (!context) {
    throw new Error("useImgBB must be used within an ImgBBProvider");
  }
  return context;
};
