import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client";
import { AppContext } from "../../context/AppContext";
import { BsCaretLeft } from "react-icons/bs";
import "./Messenger.scss";

let socket = null;

const UserMessage = ({ message }) => (
  <div className="user-msg">
    <span>{message}</span>
  </div>
);

const ContactMessage = ({ message }) => (
  <div className="contact-msg">
    <span>{message}</span>
  </div>
);

const Messenger = () => {
  if (!socket) {
    socket = io(`http://localhost:4650/chat`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }

  const { user, users } = useContext(AppContext);
  const { userId } = useParams();
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
      to: users && userId ? users.filter((u) => u.id === userId)[0] : {},
    });
    setMessages([]);
  }, [user, users, userId]);

  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
        setMessages((oldMessages) => {
          return [...oldMessages, message];
        });
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
    if (form.message !== "") {
      socket.emit("send-message", form, () => {
        setForm((oldForm) => {
          return { ...oldForm, message: "" };
        });
      });
    }
  };

  if (!userId) return null;

  return (
    <main className="messenger">
      <h1>
        {window.innerWidth < 769 && (
          <Link to="/">
            <BsCaretLeft color="#0082fb" />
          </Link>
        )}
        {users.filter((u) => u.id === userId)[0].name}
      </h1>
      <div>
        {messages.map((m) => {
          if (m.from.id === user.id) {
            return <UserMessage message={m.message} />;
          } else if (m.from.id === userId) {
            return <ContactMessage message={m.message} />;
          }
        })}
      </div>
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
