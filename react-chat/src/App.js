import React, { useState, useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://localhost:2900');

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState(false);

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = (message) => {
      if (message.data.includes("Type your name to join the chat:")) {
        setInitialPrompt(true);
      }
      setChat((prev) => [...prev, message.data]);
    };
  }, []);

  const handleJoin = (event) => {
    event.preventDefault();
    if (name) {
      client.send(name);
      setJoined(true);
    }
  };

  const handleMessageSend = (event) => {
    event.preventDefault();
    if (message) {
      client.send(message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '10px', fontFamily: 'Arial' }}>
      {!joined ? (
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{ marginRight: '5px' }}
          />
          <button type="submit">Join Chat</button>
          {initialPrompt && (
            <div style={{ marginTop: '10px' }}>
              Type your name to join the chat:
            </div>
          )}
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', overflowY: 'auto', height: '300px', border: '1px solid #ccc' }}>
            {chat.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <form onSubmit={handleMessageSend}>
            <input
              type="text"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
              style={{ marginRight: '5px' }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
