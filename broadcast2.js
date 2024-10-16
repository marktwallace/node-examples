const net = require("net");
const names = new Map()

const server = net.createServer((socket) => {
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

function valid_name(name) {
    return name.length > 0 && name.length <= 20 && !names.has(name);
}

server.listen(3000, () => {
    console.log('listening on 3000');
});
