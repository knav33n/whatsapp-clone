const express = require("express");
const app = express();

const socketio = require("socket.io");
const http = require("http").createServer(app);
const io = socketio(http, { transports: ["websocket"] });
const REDIS_HOST = process.env.REDIS_HOST || `127.0.0.1`;
const cors = require("cors");
const redis = require("redis");

const users = [];

app.use(
  cors({
    origin: "http://localhost:1212",
  })
);

app.get("/", (req, res) => {
  res.send("Hello");
});

console.log(`Connecting to REDIS @ ${REDIS_HOST}`);
const liveUsers = io.of(`/join`);
liveUsers.on("connection", (socket) => {
  socket.on("userjoin", (data) => {
    let newUser =
      users.filter((u) => u.id === data.id).length === 0 ? true : false;
    if (newUser) {
      users.push(data);
      io.of(`/join`).emit("new-user-joined", users);
    }
  });
});

const liveChat = io.of(`/chat`);
const publisher = redis.createClient({
  host: REDIS_HOST,
});
liveChat.on("connection", (socket) => {
  console.log(`New connection ${socket.id}!`);
  const channel = `MESSAGES`;

  const subscriber = redis.createClient({
    host: REDIS_HOST,
  });
  subscriber.subscribe(channel);

  socket.on("disconnect", () => {
    console.log("Disconnected!");
    // subscriber.unsubscribe(channel);
    // subscriber.quit();
    // publisher.quit();
  });

  socket.on("send-message", (message, callback) => {
    publisher.publish(channel, JSON.stringify(message));
    callback();
  });

  subscriber.on("message", function (channel, data) {
    socket.broadcast.emit("message", JSON.parse(data));
  });
});

http.listen(process.env.port || 4650, () =>
  console.log("Server running @ " + (process.env.port || 4650))
);
