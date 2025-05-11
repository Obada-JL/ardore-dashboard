import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = 'https://api.lineduc.com';
const API_ENDPOINTS = {
  GET_MESSAGES: `${BASE_URL}/api/getMessages`,
  UPDATE_MESSAGE: `${BASE_URL}/api/updateMessage`,
  DELETE_MESSAGE: `${BASE_URL}/api/deleteMessage`,
};

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch messages from the API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_MESSAGES);
        setMessages(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to fetch messages.";
        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في جلب الرسائل",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Toggle read/unread status and update the database
  const toggleReadStatus = async (_id, isRead) => {
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.UPDATE_MESSAGE}/${_id}`,
        {
          isRead: !isRead,
        }
      );

      if (response.data) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message._id === _id ? { ...message, isRead: !isRead } : message
          )
        );
        
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث حالة الرسالة بنجاح",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error("Failed to update message status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update message status.";
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة الرسالة. الرجاء المحاولة مرة أخرى",
      });
    }
  };

  // Delete a message and update the state
  const deleteMessage = async (_id) => {
    try {
      // Show confirmation dialog first
      const result = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تتمكن من استرجاع هذه الرسالة!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "نعم، احذفها!",
        cancelButtonText: "إلغاء"
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`${API_ENDPOINTS.DELETE_MESSAGE}/${_id}`);

        if (response.status === 200) {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== _id)
          );

          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الرسالة بنجاح",
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete message.";
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في حذف الرسالة. الرجاء المحاولة مرة أخرى",
      });
    }
  };

  // Format timestamp for better readability
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        الرسائل
      </h1>
      <ul style={{ listStyle: "none", padding: "0" }}>
        {messages.map((message) => (
          <li
            key={message._id}
            style={{
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: message.isRead ? "#f5f5f5" : "#fff8e1",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              overflowWrap: "break-word",
              wordWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <strong style={{ fontSize: "16px", color: "#555" }}>
                {message.senderName}
              </strong>
              <span
                style={{ marginLeft: "10px", color: "#888", fontSize: "14px" }}
              >
                {message.senderEmail}
              </span>
            </div>
            <p
              style={{
                marginBottom: "10px",
                color: "#333",
                fontSize: "14px",
                lineHeight: "1.5",
                maxHeight: "200px",
                overflow: "auto",
                paddingRight: "10px",
              }}
            >
              {message.recievedMessage}
            </p>
            <p
              style={{
                marginBottom: "15px",
                fontSize: "12px",
                color: "#999",
              }}
            >
              {formatTimestamp(message.timestamp)}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => toggleReadStatus(message._id, message.isRead)}
                style={{
                  padding: "8px 15px",
                  backgroundColor: message.isRead ? "#007BFF" : "#28A745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {message.isRead ? "Mark as Unread" : "Mark as Read"}
              </button>
              <button
                onClick={() => deleteMessage(message._id)}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#FF4136",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesPage;
