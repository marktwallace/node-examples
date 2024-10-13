const net = require('net');

const connections = {};

function show_directory(socket) {
    socket.write('Directory of connections:\n');
    for (let name in connections) {
        if (connections.hasOwnProperty(name)) {
            socket.write(`${name} is connected at ${connections[name].remoteAddress}:${connections[name].remotePort}\n`);
        }
    }
    socket.write('\n');
}

function broadcast(speaker, message) {
    for (let name in connections) {
        if (connections.hasOwnProperty(name) && name !== speaker) {
            connections[name].write(`${speaker}: ${message}\n`);
        }
    }
}

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.write('Type your name and hit enter to start chatting.\n')

  var name = '';

  socket.write('Commands: ? - show directory of users\n')

  socket.on('data', (data) => {
    str = data.toString().trim()
    switch(str[0]) {
        case '?':
            show_directory(socket);
            break;
        default:
            if(name == '') {
                if(str.length == 0) {
                    socket.write(`Bad name: ${str}, type another name.`)
                    break;
                }
                if(connections[str] != null) {
                    socket.write(`Name ${str} is use, type another name.`)
                    break;
                }
                name = str;
                connections[name] = socket;

                socket.write(`You are connected as ${name}\nTotal in chatroom: ${Object.keys(connections).length}\n`);

            } else {
                broadcast(name,str);
            }
            break;
    }
    console.log(`Received: ${data}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
    if(name != '') {
        delete connections[name]
    }
  });

  socket.on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

