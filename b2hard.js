const { timeStamp } = require("console");
const net = require("net");
const names = new Map()

const server = net.createServer((socket) => {
    socket.setEncoding('utf-8');
    let name = "";
    socket.write("Type your name and hit enter to join the chat: ")
    socket.on('data', (data) => {
        const message = data.toString().trim();
        if(!name) {
            if(valid_name(message)) {
                name = message;
                names.set(name,socket);
                console.log("users:" + names.size);
                socket.write("Welcome to the chat, " + name + "!\n");
            } else {
                socket.write("That name won't work, type another: ")
            }
            return      
        }
        if(rate_limit(socket)) return;
        for(let client of names.values()) {
            if(client != socket  && client.writable) {
                client.write(name + ": " + message + "\n");
            }
        }    
    });
    socket.on('end', () => {
        if(name) {
            names.delete(name);
        }
    })
    socket.on('error', (err) => {
        console.log(`Error: ${err.message}`);
        if(name) {
            names.delete(name);
        }
        socket.destroy();
    })
});

server.on('connection', (socket) => {
    if(ip_over_limit(socket)) {
        socket.write("Too many connections from your ip!");
        socket.end();
    }
})

const ipConnCount = new Map();
const MAX_IP_CONN = 3;
function ip_over_limit(socket) {
    const ip = socket.remoteAddress;
    conns = ipConnCount.get(ip) || 0;
    if (conns >= MAX_IP_CONN) {
        return true;
    }
    ipConnCount.set(ip,conns + 1);
    socket.on('end',() => {
        ipConnCount.set(ip,ipConnCount.get(ip) - 1)
    });
    return false;
}

function valid_name(name) {
    return name.length > 0 && name.length <= 20 && !names.has(name);
}

const SOCKET_RATE_LIMIT = 5;
const socket_limits = new Map();
function rate_limit(socket) {
    const now = Date.now()
    let message_history = socket_limits.get(socket);
    if (message_history) {
        message_history = message_history.filter(timeStamp => now - timeStamp < 60000);
        if (message_history.length > SOCKET_RATE_LIMIT) {
            console.log(`limiting messages for client`);
            socket.write('Too many messages! Wait before sending.\n')
            return true;
        }
    } else {
        message_history = []
    }
    message_history.push(now)
    socket_limits.set(socket,message_history)
}

server.listen(3000, () => {
    console.log('listening on 3000');
});
