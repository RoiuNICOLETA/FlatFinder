/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useUser } from "../../context/UserContext";
import styles from "./FlatView.module.css";
import { useFlatDetails } from "../FlatDetailsContext";

const FlatView = () => {
  const { flatId } = useParams();
  const { currentUser } = useUser();
  const { flatDetails, fetchFlatDetails, loading } = useFlatDetails();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [owner, setOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const flatRef = doc(db, "flats", flatId);
        const flatSnapshot = await getDoc(flatRef);

        if (flatSnapshot.exists()) {
          const flatData = flatSnapshot.data();
          // console.log("Flat data:", flatData); // ✅ Debugging pentru verificare

          setFlat(flatData);

          if (flatData.userId) {
            const ownerRef = doc(db, "users", flatData.userId);
            const ownerSnapshot = await getDoc(ownerRef);
            if (ownerSnapshot.exists()) {
              setOwner(ownerSnapshot.data());
            }
          }
        } else {
          alert("Flat not found");
          setFlat(null);
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching flat:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("flatId", "==", flatId));
        const snapshot = await getDocs(q);

        const messageList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const messageData = { id: docSnap.id, ...docSnap.data() };

            const senderRef = doc(db, "users", messageData.userId);
            const senderSnap = await getDoc(senderRef);

            if (senderSnap.exists()) {
              const senderData = senderSnap.data();
              messageData.senderName = senderData.fullName;
              messageData.senderEmail = senderData.email;
            } else {
              messageData.senderName = "Unknown User";
              messageData.senderEmail = "No email available";
            }

            return messageData;
          })
        );

        setMessages(messageList);
        setUnreadCount(messageList.filter((msg) => !msg.isRead).length); // ✅ Sets the number of unread messages
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchFlat();
    fetchMessages();
  }, [flatId, navigate]);

  useEffect(() => {
    fetchFlatDetails(flatId);
  }, [flatId]);

  useEffect(() => {
    if (flat?.userId) {
      const fetchOwner = async () => {
        try {
          const ownerRef = doc(db, "users", flat.userId);
          const ownerSnapshot = await getDoc(ownerRef);
          if (ownerSnapshot.exists()) {
            setOwner(ownerSnapshot.data()); // ✅ We retrieve the correct userName
          }
        } catch (error) {
          console.error("Error fetching owner:", error);
        }
      };
      fetchOwner();
    }
  }, [flat?.userId]);

  const markAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, { isRead: true });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1)); // ✅ We reduce the number of unread messages
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
      setUnreadCount((prevCount) =>
        messages.find((msg) => msg.id === messageId && !msg.isRead)
          ? Math.max(0, prevCount - 1)
          : prevCount
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (loading) return <div className={styles.loader}></div>;
  if (!flat) return <p>Flat not found.</p>;

  return (
    <div className={styles.flatViewContainer}>
      {/* ✅ Show apartment image */}
      {flat.imageUrl && (
        <img src={flat.imageUrl} alt={flat.name} className={styles.flatImage} />
      )}
      <h2>{flat.name}</h2>

      {/* ✅ Organization in two columns */}
      <div className={styles.sectionsContainer}>
        {/* ✅ Apartment details */}
        <div className={styles.flatDetailsContainer}>
          <h3>Apartment Details</h3>
          <p>
            <strong>City:</strong> {flat.city}
          </p>
          <p>
            <strong>Street:</strong> {flat.street} {flat.streetNumber}
          </p>
          <p>
            <strong>Area Size:</strong> {flat.areaSize} mp
          </p>
          <p>
            <strong>Has AC:</strong> {flat.hasAC ? "Yes" : "No"}
          </p>
          <p>
            <strong>Year Built:</strong> {flat.yearBuilt}
          </p>
          <p>
            <strong>Rent Price:</strong> €{flat.rentPrice}
          </p>
          <p>
            <strong>Available From:</strong> {flat.dateAvailable}
          </p>
          <p>
            <strong>Owner:</strong> {owner?.userName || "Unknown"}
          </p>
          {owner && (
            <p>
              <strong>Email:</strong> {flat.ownerEmail || "Not available"}
            </p>
          )}
        </div>

        {/* ✅ Messages */}
        <div className={styles.messagesContainer}>
          <h3>Messages {unreadCount > 0 && `(${unreadCount} unread)`}:</h3>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageCard} ${
                  msg.isRead ? styles.read : styles.unread
                }`}
              >
                <p>
                  <strong>
                    {msg.senderName} ({msg.senderEmail}):
                  </strong>{" "}
                  {msg.content}
                </p>
                <p>
                  <small>{new Date(msg.createdAt).toLocaleString()}</small>
                </p>
                {!msg.isRead && currentUser?.id === flat.userId && (
                  <button
                    className={styles.readButton}
                    onClick={() => markAsRead(msg.id)}
                  >
                    Mark as Read
                  </button>
                )}
                {currentUser?.id === flat.userId && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteMessage(msg.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>

        {/* ✅ Apartment description */}
        <div className={styles.descriptionContainer}>
          <h3>Apartment Description</h3>
          <p>{flatDetails.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FlatView;
