const net = require('net');
const names = new Map();

const server = net.createServer((socket) => {
    socket.write("Type your name: ");
    let name = "";
    const messageTimestamps = [];

    socket.on('data',(data)=>{
        const message = data.toString().trim();
        console.log(`received data: ${message}`);
        if(rate_limit(messageTimestamps)) {
            socket.write('Exceeded rate limit, slow down!\n');
            return;
        }
        if (!name) {
            if(valid_name(message)) {
                name = message;
                names.set(socket,name);
                console.log(`${name} has joined the chat`)
                return
            } else {
                socket.write('Invalid name, type another: ');
                return
            }
        }
        broadcast(socket,message);
    });
    socket.on('end', () => {
        if(name) names.delete(socket);
    })
    socket.on('error',(err) => {
        console.log(`Socket error: ${err.message}`);
        if(name) names.delete(socket);
        socket.destroy();
    });
});

const RATE_LIMIT=5;
function rate_limit(messageTimestamps) {
    const now = Date.now();
    messageTimestamps.push(now);
    if (messageTimestamps.length < RATE_LIMIT) {
        return false;
    }
    const first = messageTimestamps[0];
    const last = messageTimestamps[RATE_LIMIT-1];
    messageTimestamps.shift();
    console.log(`message range ${last} to ${first} diff ${last-first}`);
    return (last - first < 60000);
}

function valid_name(name) {
    return name.length > 0 && name.length <= 20;
}

function broadcast(sender_socket,message) {
    for(let socket of names.keys()) {
        if(sender_socket != socket) {
            socket.write(names.get(sender_socket) + ": " + message + "\n")
        }
    }
}

server.listen(3000,()=> {
    console.log(`Listening on 3000`);
})