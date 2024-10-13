const net = require("net");
users = {};

const server = net.createServer((socket) => {
    console.log(`New client at port ${socket.remotePort}`);
    socket.write("Type your name and hit enter to start chatting.\n");
    let name = "";

    socket.on("data", (data) => {
        let str = data.toString().trim();
        if (str.length == 0) {
            return;
        }
        if (!name) {
            if (!users[str]) {
                users[str] = socket;
                name = str;
                socket.write(
                    `Hi ${name}. Type and hit enter to chat with others in the room. Type ? to see the list of users in the chat room\n`
                );
            } else {
                socket.write(
                    `The name ${str} is already in use. Type another name\n`
                );
            }
        } else if (str[0] == "?") {
            userlist = Object.keys(users).join(", ") + "\n"
            socket.write(userlist);
        } else {
            Object.keys(users).forEach((key) => {
                if (key == name) return;
                otherSocket = users[key];
                otherSocket.write(`${name}: ${str}\n`);
            });
        }
    });

    socket.on("end", () => {
        console.log("Client disconnected");
        if (name && users[name]) {
            delete users[name];
        }
    });

    socket.on("error", (err) => {
        console.log(`Error: ${err.message}`);
    });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
