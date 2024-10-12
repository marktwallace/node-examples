const net = require('net');

const connections = [];

function show_directory(socket) {
    socket.write('Directory of connections:\n')
    for (var sock of connections) {
        socket.write(`Connection at remote address: ${sock.remoteAddress}:${sock.remotePort}\n`);
    }
    socket.write('\n');
}

function broadcast(speaker,data) {
    for (var sock of connections) {
        console.log(`Testing ${sock.remotePort} vs ${speaker.remotePort}\n`)
        if(sock.remotePort != speaker.remotePort) {
            console.log('yes')
            sock.write(`Port ${speaker.remotePort} says: ${data.toString().trim()}\n`);
        }
    }
}

// Create a new server instance
const server = net.createServer((socket) => {
  console.log('Client connected');

  connections.push(socket);
  console.log('Client connected. Total connections:', connections.length);

  // Send a welcome message to the client
  socket.write(`You are connection ${connections.length} at ${socket.remoteAddress}:${socket.remotePort} \n`);

  // Handle data from the client
  socket.on('data', (data) => {
    command_prefix = data.toString().trim()[0];
    console.log('Command:' + command_prefix)
    switch(command_prefix) {
        case '?':
            show_directory(socket);
            break;
        default:
            broadcast(socket,data);
    }
    console.log(`Received: ${data}`);
  });

  // Handle client disconnection
  socket.on('end', () => {
    console.log('Client disconnected');
  });

  // Handle error events
  socket.on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
});

// Listen on a specific port
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

