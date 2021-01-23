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
  const workspace = socket.nsp;

  socket.on("userjoin", (data) => {
    let newUser =
      users.filter((u) => u.id === data.id).length === 0 ? true : false;
    if (newUser) {
      users.push(data);
      workspace.emit("new-user-joined", users);
    }
  });
});

const liveChat = io.of(`/chat`);
const redis_instance = redis.createClient({
  host: REDIS_HOST,
});
liveChat.on("connection", (socket) => {
  console.log("New connection!");

  const workspace = socket.nsp;
  const channel = `MESSAGES`;

  redis_instance.subscribe(channel);
  socket.on("disconnect", () => {
    console.log("Disconnected!");
    if (redis_instance) {
      redis_instance.unsubscribe(channel);
      redis_instance.quit();
    }
  });

  socket.on("message", (message) => {
    console.log(message);
    redis_instance.publish(channel, JSON.stringify(message));
  });

  redis_instance.on("message", function (channel, data) {
    workspace.emit("message", JSON.parse(data));
  });
});

http.listen(process.env.port || 4650, () =>
  console.log("Server running @ " + (process.env.port || 4650))
);
