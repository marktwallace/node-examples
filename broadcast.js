const net = require('net');
const clients = [];

const server = net.createServer((socket) => {
    clients.push(socket);
    console.log(`connection number ${clients.length}`);
    socket.on('data', (data) => {
        broadcast(data, socket);
    });
    socket.on('end', () => {
        console.log(`socket end, connection count: ${clients.length}`);
        clients.splice(clients.indexOf(socket), 1);
    });
    socket.on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });
});

function broadcast(message, senderSocket) {
    clients.forEach((client) => {
        if (client !== senderSocket) {
            client.write(message);
        }
    });
}

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
