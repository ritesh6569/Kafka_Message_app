import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function App() {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    sender: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('newMessage', (messageData) => {
      console.log('New message received:', messageData);
      setMessages(prev => [messageData, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sender.trim() || !formData.message.trim()) {
      alert('Please fill in both sender name and message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/messages', formData);
      
      if (response.data.success) {
        setFormData({
          sender: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container">
      <div className="app-header">
        <h1>🚀 Kafka Message App</h1>
        <p>Real-time messaging powered by Apache Kafka and Zookeeper</p>
      </div>

      <div className="main-content">
        <div className="message-form">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="sender">Your Name:</label>
              <input
                type="text"
                id="sender"
                name="sender"
                value={formData.sender}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="send-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

  
        <div className="messages-container">
          <h2>Live Messages</h2>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              No messages yet. Send one to get started!
            </p>
          ) : (
            <ul className="message-list">
              {messages.map((msg) => (
                <li key={msg.id} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">{msg.sender}</span>
                    <span className="message-timestamp">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="status-indicator">
        <h3>Connection Status</h3>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected to Kafka'}
          {connectionStatus === 'connecting' && '🟡 Connecting...'}
          {connectionStatus === 'disconnected' && '🔴 Disconnected'}
        </div>
      </div>
    </div>
  );
}

export default App; 