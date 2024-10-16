const net = require('net');

const dataStore = new Map()

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const str = data.toString().trim();
        const params = str.split(/\s+/);
        const command = params[0].toLowerCase();
        if(params.length < 2) {
            socket.write("command requires key\n");
            return;
        }
        const key = params[1];
        switch (command) {
            case 'get':
                if(dataStore.has(key)) {
                    socket.write(dataStore.get(key));
                } else {
                    socket.write("null\n")
                } 
                // should write 'undefined' when it does not exist
                break;
            case 'set':
                if(params.length != 3) {
                    socket.write("invalid set\n");
                    break;
                }
                const value = params[2] + "\n";
                dataStore.set(key,value);
                socket.write("ok\n")
                break;
            default:
                socket.write("invalid command\n");
                break;
        }
    });

    socket.on('end',() => {
        socket.write("bye");
    });

    socket.on('error',(err) => {
        console.log(`Error: ${err.message}`);
        socket.destroy();
    })
});

server.listen(3000, () => {
    console.log("key/value store listening at port 3000");
});

