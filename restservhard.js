/*
TEST WITH:
curl -X POST \
  -d "{ \"artist\": \"Elvis Costello\" }" \
  -H "Content-Type: application/json" \
  http://localhost:3000/artist
*/
const http = require("http");

const router = (req, res) => {
    const { method, url } = req;
    res.setHeader("Content-Type", "application/json");

    console.log(`method=${method} url=${url}`);

    if (method == "GET" && url == "/happy") {
        res.statusCode = 200;
        res.end(JSON.stringify({ artist: "Elvis Costello" }));
    } else if (method == "POST" && url == "/artist") {
        const contentType = req.headers["content-type"];
        if (contentType !== "application/json") {
            res.statusCode = 415;
            return res.end(JSON.stringify({ error: "Unsupported Media Type" }));
        }    
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
            if (body.length > 1e6) { // 1MB limit
                res.statusCode = 413;
                res.end(JSON.stringify({ error: "Payload Too Large" }));
                req.connection.destroy(); // kill connection to stop the problem
            }        
        });
        req.on("end", () => {
            try {
                const posted_object = JSON.parse(body);
                res.statusCode = 201;
                res.end(JSON.stringify({ response: "received", payload: posted_object }));
            } catch (error) {
                res.statusCode = 400;
                console.log(`Invalid json: ${error.message}`)
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};

const server = http.createServer(router);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
