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





/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useFavorites } from "../FavoritesContext";
import { useMessages } from "../MessageContext";
import { useEffect } from "react";
import styles from "./FlatCard.module.css";

const FlatCard = ({
  flat,
  onDelete,
  onRemoveFavorite,
  compactView = false,
  }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { addFavorite, favorites } = useFavorites();
  const { sendMessage, fetchMessagesForFlat, markAsRead, deleteMessage } =
    useMessages();
  const [unreadCount, setUnreadCount] = useState(0);
  const [flatMessages, setFlatMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");

  const isFavorite = favorites.find((fav) => fav.flatId === flat.id);

  useEffect(() => {
    if (flat.id) {
      fetchMessagesForFlat(flat.id).then(({ messages, unreadCount }) => {
        setFlatMessages(messages);
        setUnreadCount(unreadCount); // ✅ We set the number of unread messages
      });
    }
  }, [flat.id]);

  const handleMarkAsRead = async (messageId) => {
    await markAsRead(messageId);
    setFlatMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1)); // ✅ We reduce the number of unread messages
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setFlatMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId)
    );
    setUnreadCount((prevCount) =>
      flatMessages.find((msg) => msg.id === messageId && !msg.isRead)
        ? Math.max(0, prevCount - 1)
        : prevCount
    );
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert("Message content cannot be empty.");
      return;
    }
    await sendMessage(flat.id, messageContent);
    setMessageContent("");
    fetchMessagesForFlat(flat.id).then(setFlatMessages);
  };

  return (
    <PageAnimation> 
    <div className={styles.flatCard}>
      <img
        src={flat.imageUrl || "https://via.placeholder.com/200"}
        alt={flat.name}
        className={styles.flatImage}
      />

      <div className={styles.flatDetails}>
        <h3 className={styles.flatName}>{flat.name}</h3>

        <div className={styles.flatInfo}>
          <p>
            <strong>City:</strong> {flat.city}
          </p>
          <p>
            <strong>Price:</strong> €{flat.rentPrice}
          </p>
          <p>
            <strong>Size:</strong> {flat.areaSize} m²
          </p>
          <p>
            <strong>Available From:</strong> {flat.dateAvailable}
          </p>
          {!compactView && (
            <>
              <p>
                <strong>Street:</strong> {flat.street} {flat.streetNumber}
              </p>
              <p>
                <strong>Has AC:</strong> {flat.hasAC ? "Yes" : "No"}
              </p>
              <p>
                <strong>Year Built:</strong> {flat.yearBuilt}
              </p>
              <p>
                <strong>Owner:</strong> {flat.userName || "Unknown"}
              </p>
              <p>
                <strong>Email:</strong> {flat.ownerEmail || "Not available"}
              </p>
              <div className={styles.divMessages}>
                <div className={styles.messages}>
                  <h4>
                    Messages {unreadCount > 0 && `(${unreadCount} unread)`}:
                  </h4>
                  {flatMessages.length > 0 ? (
                    flatMessages.map((msg) => (
                      <div key={msg.id} className={styles.message}>
                        <p>
                          <strong>
                            {msg.senderName} ({msg.senderEmail}):
                          </strong>{" "}
                          {msg.content}
                        </p>
                        <p>
                          <small>
                            {new Date(msg.createdAt).toLocaleString()}
                          </small>
                        </p>

                        {/* ✅ Buton pentru a marca mesajul ca citit */}
                        {!msg.isRead && currentUser?.id === flat.userId && (
                          <button onClick={() => handleMarkAsRead(msg.id)}>
                            Mark as Read
                          </button>
                        )}
                        {/* ✅ Buton pentru ștergere mesaj */}
                        {currentUser?.id === flat.userId && (
                          <button onClick={() => handleDeleteMessage(msg.id)}>
                            Delete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No messages yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {currentUser?.id !== flat.userId && (
          <div className={styles.messageSection}>
            {!messageContent && (
              <button
                onClick={() => setMessageContent(" ")}
                className={styles.sendMessageButton}
              >
                Send Message
              </button>
            )}
            {messageContent !== "" && (
              <div className={styles.messageInput}>
                <textarea
                  placeholder="Write a message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                ></textarea>
                <div className={styles.messageActions}>
                  <button
                    onClick={handleSendMessage}
                    className={styles.sendButton}
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setMessageContent("")}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={() => navigate(`/flat/${flat.id}`)}>View</button>
          {currentUser?.id === flat.userId && (
            <>
              <button
                onClick={() => navigate(`/edit-flat/${flat.id}`)}
                className={styles.editButton}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(flat.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </>
          )}

          {/* {isFavorite ? (
            <button className={styles.favoriteButton} onClick={() => onRemoveFavorite(flat.id)}>☆</button>
          ) : (
            <button className={styles.favoriteButton} onClick={() => addFavorite(flat.id)}>⭐</button>
          )} */}

          <button
            className={styles.favoriteButton}
            onClick={() => {
              isFavorite ? onRemoveFavorite(flat.id) : addFavorite(flat.id);
            }}
          >
            {isFavorite ? "⭐" : "☆"}
          </button>
        </div>
      </div>
    </div>
    </PageAnimation>
  );
};

export default FlatCard;
