/*
TEST WITH:
echo "1000" | nc -u 127.0.0.1 3000
*/

const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
    console.log(`Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    
    let resp;
    const receivedMessage = msg.toString().trim();

    if (!isNaN(receivedMessage)) {
        const nextNumber = parseInt(receivedMessage, 10) + 1;
        resp = nextNumber.toString() + "\n";
    } else {
        resp = "Error: Not a valid number\n";
    }

    server.send(resp, 0, resp.length, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error("Error sending response:", err);
        }
    });
});

server.on("listening", () => {
    const address = server.address();
    console.log(`UDP listener on ${address.address}:${address.port}`);
});

const PORT = 3000;
const HOST = "127.0.0.1";
server.bind(PORT, HOST);
