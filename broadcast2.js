const net = require("net");
const names = new Map()

const server = net.createServer((socket) => {
    let name = "";
    socket.write("Type your name and hit enter to join the chat: ")
    socket.on('data', (data) => {
        message = data.toString().trim();
        if(!name) {
            if(valid_name(message)) {
                name = message;
                names.set(name,socket);
                console.log("users:" + names.size)
            } else {
                socket.write("That name won't work, type another: ")
            }
            return      
        }
        for(let client of names.values()) {
            if(client != socket) {
                client.write(name + ": " + message + "\n");
            }
        }    
    });
    socket.on('end', () => {
        if(name) {
            delete names[name];
        }
        socket.destroy();
    })
    socket.on('error', (err) => {
        console.log(`Error: ${err.message}`);
        if(name) {
            delete names[name];
        }
        socket.destroy();
    })
});

function valid_name(name) {
    return name.length > 0 && name.length < 20 && names[name] == undefined;
}

server.listen(3000, () => {
    console.log('listening on 3000');
});
