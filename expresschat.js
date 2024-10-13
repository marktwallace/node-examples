const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connections = {};

function broadcast(speaker, message) {
    Object.values(connections).forEach((socket) => {
        socket.send(`${speaker}: ${message}`);
    });
}

wss.on("connection", (ws) => {
    let name = "";

    ws.send("Type your name to join the chat.");

    ws.on("message", (message) => {
        const str = message.toString().trim();

        if (!name) {
            if (str.length === 0 || connections[str]) {
                ws.send("Invalid or already used name. Try another.");
                return;
            }
            name = str;
            connections[name] = ws;
            ws.send(`Welcome to the chat, ${name}`);
            return;
        }

        broadcast(name, str);
    });

    ws.on("close", () => {
        delete connections[name];
    });
});

const port = 2900;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
