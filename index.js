import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", socket => {
  console.log("player connected", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 400,
    y: 300,
    hp: 100
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("playerJoined", players[socket.id]);

  socket.on("move", data => {
    if (!players[socket.id]) return;
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    io.emit("playerMoved", players[socket.id]);
  });

  socket.on("attack", () => {
    io.emit("playerAttack", socket.id);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerLeft", socket.id);
    console.log("disconnect:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on " + PORT));
