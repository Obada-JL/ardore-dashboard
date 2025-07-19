import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_ENDPOINTS } from '../config/api';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read, replied

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Clear expired token and redirect to login
  const handleTokenExpiration = () => {
    localStorage.removeItem('token');
    Swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "Your session has expired. Please login again.",
      confirmButtonText: "Go to Login"
    }).then(() => {
      // Redirect to login page or refresh
      window.location.href = '/login'; // Adjust the login URL as needed
    });
  };

  // Set up axios default headers
  const setupAxiosAuth = () => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Fetch messages from the API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setupAxiosAuth();
        const url = filter === 'all' ?
          API_ENDPOINTS.GET_MESSAGES :
          `${API_ENDPOINTS.GET_MESSAGES}?status=${filter}`;

        const response = await axios.get(url);

        // Handle different response structures
        const messagesData = response.data.messages || response.data;
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to fetch messages.";
        setError(errorMessage);

        // Check if it's a token expiration error
        if (err.response?.status === 401 &&
          (errorMessage.includes('expired') || errorMessage.includes('Token has expired'))) {
          handleTokenExpiration();
          return;
        }

        // Check if it's an auth error
        if (err.response?.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Authentication Required",
            text: "Please login to access messages",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch messages",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [filter]);

  // Update message status
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      setupAxiosAuth();
      const response = await axios.patch(
        `${API_ENDPOINTS.GET_MESSAGES}/${messageId}/status`,
        { status: newStatus }
      );

      if (response.data) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message._id === messageId ? { ...message, status: newStatus } : message
          )
        );

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Message status updated successfully",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      // Handle token expiration
      if (err.response?.status === 401 &&
        err.response?.data?.message?.includes('expired')) {
        handleTokenExpiration();
        return;
      }

      console.error("Failed to update message status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update message status. Please try again",
      });
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to recover this message!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        setupAxiosAuth();
        const response = await axios.delete(API_ENDPOINTS.DELETE_MESSAGE(messageId));

        if (response.status === 200) {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== messageId)
          );

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Message has been deleted successfully",
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (err) {
      // Handle token expiration
      if (err.response?.status === 401 &&
        err.response?.data?.message?.includes('expired')) {
        handleTokenExpiration();
        return;
      }

      console.error("Failed to delete message:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete message. Please try again",
      });
    }
  };

  // Format timestamp for better readability
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#FFA726';
      case 'read': return '#42A5F5';
      case 'replied': return '#66BB6A';
      case 'flagged': return '#EF5350';
      case 'archived': return '#9E9E9E';
      default: return '#FFA726';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'unread': return 'Unread';
      case 'read': return 'Read';
      case 'replied': return 'Replied';
      case 'flagged': return 'Flagged';
      case 'archived': return 'Archived';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div>Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: "#333", margin: 0 }}>Contact Messages</h1>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'unread', 'read', 'replied', 'flagged'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === status ? '#007BFF' : '#f8f9fa',
                color: filter === status ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No messages found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {messages.map((message) => (
            <div
              key={message._id}
              style={{
                padding: "20px",
                backgroundColor: message.status === 'unread' ? "#fff8e1" : "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #ddd",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                position: 'relative'
              }}
            >
              {/* Status badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: getStatusColor(message.status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getStatusText(message.status)}
              </div>

              {/* Message header */}
              <div style={{ marginBottom: "15px", paddingRight: '80px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: "18px", color: "#333" }}>
                  {message.senderName}
                </h3>
                <div style={{ color: "#666", fontSize: "14px", marginBottom: '5px' }}>
                  <strong>Email:</strong> {message.senderEmail}
                </div>
                {message.senderPhone && (
                  <div style={{ color: "#666", fontSize: "14px", marginBottom: '5px' }}>
                    <strong>Phone:</strong> {message.senderPhone}
                  </div>
                )}
                {message.subject && (
                  <div style={{ color: "#666", fontSize: "14px", marginBottom: '5px' }}>
                    <strong>Subject:</strong> {message.subject}
                  </div>
                )}
                <div style={{ color: "#999", fontSize: "12px" }}>
                  <strong>Received:</strong> {formatTimestamp(message.timestamp)}
                </div>
              </div>

              {/* Message content */}
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #eee',
                marginBottom: '15px'
              }}>
                <p style={{
                  margin: 0,
                  color: "#333",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.recievedMessage}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: 'wrap' }}>
                {message.status === 'unread' && (
                  <button
                    onClick={() => updateMessageStatus(message._id, 'read')}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#28A745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Mark as Read
                  </button>
                )}

                {message.status === 'read' && (
                  <>
                    <button
                      onClick={() => updateMessageStatus(message._id, 'unread')}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#FFA726",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      Mark as Unread
                    </button>
                    <button
                      onClick={() => updateMessageStatus(message._id, 'replied')}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#66BB6A",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      Mark as Replied
                    </button>
                  </>
                )}

                <button
                  onClick={() => updateMessageStatus(message._id, 'flagged')}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: message.status === 'flagged' ? "#666" : "#EF5350",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  {message.status === 'flagged' ? 'Unflag' : 'Flag'}
                </button>

                <button
                  onClick={() => updateMessageStatus(message._id, 'archived')}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#9E9E9E",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Archive
                </button>

                <button
                  onClick={() => deleteMessage(message._id)}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#DC3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
