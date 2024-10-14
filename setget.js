const net = require('net');

const server = net.createServer((socket) => {
    console.log(`connection`);
    socket.on('data', (data) => {
        process_command(data, socket);
    });
    socket.on('end', () => {
        console.log(`socket end`);
        socket.destroy();
    });
    socket.on('error', (err) => {
        console.log(`Error: ${err.message}`);
        socket.destroy();
    });
});

let store = new Map();

function process_command(data,socket) {
    command = data.toString().trim();
    param = command.split(/\s+/);
    let resp
    switch (param[0].toLowerCase()) {
        case "get":
            if(!valid_key_name(param[1])) {
                resp = "invalid key name";
                return
            }
            resp = store[param[1]] !== undefined ? store[param[1]] : "key not found";
            break;
        case "set":
            if (param.length < 3) {
                resp = "command error: missing value for set";
                break;
            }
            if(!valid_key_name(param[1])) {
                resp = "invalid key name";
                return
            }
            store[param[1]] = param[2];
            resp = "OK";
            break;
        default:
            resp = "command error."
            break;
    }
    socket.write(resp + "\n");
}

function valid_key_name(key) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 256) {
        return false;
    }
    const validKeyPattern = /^[a-zA-Z0-9_-]+$/; 
    return validKeyPattern.test(key);
}

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
