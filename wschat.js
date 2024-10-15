/*
TEST WITH:
cd react-chat
npm start
*/

const http = require('http');
const WebSocket = require('ws');

let connections = new Map();

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Connect via WebSocket client.\n");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    let name = "";

    ws.send("Type your name to join the chat: ");

    ws.on("message", (message) => {
        const str = message.toString().trim();
        if(!name) {
            if(str.length === 0 || str.length > 20
            || connections.get(name)) {
                ws.send("That name won't work. Type another: ");
                return;
            }
            name = str;
            connections.set(name,ws);
            ws.send(`Welcome to the chat, ${name}`);
            console.log(`In room: ${[...connections.keys()].join(", ")}`)
            return;
        }
        broadcast(name,str);
    });

    ws.on("close", () => {
        if(name) connections.delete(name);
    });
});

function broadcast(sender_name, message) {
    connections.forEach((ws, key) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(`${sender_name}: ${message}`);
        }
    });
}

const port = 2900;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});