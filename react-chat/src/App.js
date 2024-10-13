import React, { useState, useEffect } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://localhost:2900');

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    client.onmessage = (message) => {
      setChat((prev) => [...prev, message.data]);
    };
  }, []);

  const handleJoin = () => {
    if (name) {
      client.send(name);
      setJoined(true);
    }
  };

  const handleMessageSend = () => {
    if (message) {
      client.send(message);
      setMessage('');
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div>
          <div>
            {chat.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleMessageSend}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
