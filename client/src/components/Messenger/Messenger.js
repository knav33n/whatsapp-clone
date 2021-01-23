import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { AppContext } from "../../context/AppContext";

let socket = null;

const Messenger = () => {
  if (!socket) {
    socket = io(`http://localhost:4650/chat`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }

  const { user, users } = useContext(AppContext);
  const userId = new URLSearchParams(useLocation().search).get("userId");
  const [form, setForm] = useState({
    from: {},
    to: {},
    message: "",
  });
  const [messages, setMessages] = useState([]);
  const { message } = form;

  useEffect(() => {
    setForm({
      ...form,
      from: user,
      to: users ? users.filter((u) => u.id === user.id)[0] : {},
    });
  }, [user, users]);

  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
        console.log(message);
      });
    }
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  if (!userId) return null;

  return (
    <main className="messenger">
      <p>{userId}</p>
      <form onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button>Send</button>
      </form>
    </main>
  );
};

export default Messenger;
