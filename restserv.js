// TEST WITH:
/*
curl -X POST \
  -d "{ \"artist\": \"Elvis Costello\" }" \
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
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const posted_object = JSON.parse(body);
            res.statusCode = 201;
            res.end(JSON.stringify({ response: "received", payload: posted_object }));
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
