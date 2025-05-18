/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../../components/context/UserContext";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const { currentUser } = useUser();

  const sendMessage = async (flatId, content) => {
    if (!content.trim()) {
      alert("Message content cannot be empty.");
      return;
    }

    if (!currentUser) {
      alert("You must be logged in to send a message.");
      return;
    }

    try {
      const newMessage = {
        flatId,
        userId: currentUser.id,
        userName: currentUser.name || "Anonymous",
        userEmail: currentUser.email || "No email",
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "messages"), newMessage);
      setMessages((prev) => [...prev, { id: docRef.id, ...newMessage }]);
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const fetchMessagesForFlat = async (flatId) => {
    try {
      const q = query(
        collection(db, "messages"),
        where("flatId", "==", flatId)
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      return {
        messages,
        unreadCount: messages.filter((msg) => !msg.isRead).length,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { messages: [], unreadCount: 0 };
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, { isRead: true });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        sendMessage,
        fetchMessagesForFlat,
        markAsRead,
        deleteMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);
