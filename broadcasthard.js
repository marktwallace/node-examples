/*
Battle-hardened broadcast chat, handles:
1. Client Connection Errors
2. Check client.writeable in broadcast
3. Server side errors, EADDRINUSE and EACCES
4. Data validation and length limit before broadcast
5. Graceful shutdown with SIGINT
6. Limit client connections
7. Incomplete data packets (buffer and messages.pop)
8. socket.on('timeout',...
9. socket.destroy() after disconect
10. Per-client rate limiting: under_rate_limit()
11. utf-8 encoding only
12. exit(1) on uncaught exception
14. limit number of connections from a single IP
*/

const net = require('net');
const clients=[];
const server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    clients.push(socket);
    server.on('connection', (socket) => {
        console.log('check connection limits...')
        if (over_ip_connection_limit(socket)) {
            socket.write('Connection limit exceeded for your IP.\n');
            socket.end(); 
        } else if (clients.length >= server.maxConnections) {
            socket.write('too many clients, rejected!\n');
            socket.end();
        }
    });
    // frame messages w/ newline
    let buffer = '';
    socket.on('data', (data) => {
        buffer += data.toString();
        let messages = buffer.split('\n');
        buffer = messages.pop(); // retain incomplete message
        messages.forEach((message) => {
            if (isValid(message)) {
                if (under_rate_limit(socket)) {
                    broadcast(message,socket);
                }
            } else {
                console.log('client sent bad data');
                socket.write('invalid message\n')
            }
        });
    });
    // alternate, rate limit messages
    socket.on('end', ()=> {
        remove_client(socket);
    });
    socket.on('error', (err)=> {
        console.log(`Error: ${err.message}, removing client`)
        remove_client(socket);
    });
    socket.setTimeout(60000 * 5); // 5 minute timeout
    socket.on('timeout', () => {
        console.log('Client timed out');
        socket.end();
    });
});

// do this just after creating server:
server.maxConnections = 5;

function remove_client(socket) {
    const index = clients.indexOf(socket);
    if (index !== -1) {
        clients.splice(index, 1);
    }
    socket.destroy(); // release all socket resources
}

const MAX_MESSAGE_SIZE = 50;
function isValid(data) {
    // Put some validation here
    if (typeof data != 'string') return false;
    if (data.length == 0) return false;
    if (data.length > MAX_MESSAGE_SIZE) return false;
    return true;
}

function broadcast(message,sender) {
    clients.forEach((client) => {
        if(client != sender) {
            if (client.writable) {
                client.write(message + "\n");
            } else {
                console.log("Failed to write to client")
            }
        }
    });
}

const clientMessageTimes = new Map();
const CLIENT_RATE_LIMIT = 5;
function under_rate_limit(socket) {
    const now = Date.now();
    const lastMinuteMessages = clientMessageTimes.get(socket) || [];
    const recentMessages = lastMinuteMessages.filter(msgTime => now - msgTime < 60000);
    if (recentMessages.length >= CLIENT_RATE_LIMIT) {
        console.log(`Rate limiting client at port ${socket.remotePort}`);
        socket.write('Too many messages!. Wait before sending...\n');
        return false;
    }
    recentMessages.push(now);
    clientMessageTimes.set(socket, recentMessages);
    return true
}

const ipConnectionCounts = new Map();
const MAX_CONNECTIONS_PER_IP = 3;
function over_ip_connection_limit(socket) {
    const clientIp = socket.remoteAddress;
    const connections = ipConnectionCounts.get(clientIp) || 0;
    if (connections >= MAX_CONNECTIONS_PER_IP) {
        console.log(`Too many connections from ${clientIp}`);
        return true;
    }
    ipConnectionCounts.set(clientIp, connections + 1);
    // this will clean up after the socket ends:
    socket.on('end', () => {
        ipConnectionCounts.set(clientIp, ipConnectionCounts.get(clientIp) - 1);
    });
    return false;
}

server.listen(3000,() => {
    console.log('listening on ',3000)
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('Port is already in use');
    } else if (err.code === 'EACCES') {
        console.log('Permission denied. ');
    } else {
        console.log(`Server error: ${err.message}`);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('handling SIGINT');
    // TODO: This can hang if clients are suspended, so not very safe yet
    clients.forEach(client => client.end());
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.log(`Uncaught exception: ${err.message}`);
    // TODO: Clean up here
    process.exit(1);
});
