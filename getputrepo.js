const http = require('http');
const repo = new Map()
const router = (req,res) => {
    const {method,url} = req
    res.setHeader("Content-type","application/json");
    console.log(`method=${method}, url=${url}`)
    path = url.substring(1).split('/');
    if(path[0] != 'repo') {
        res.statusCode = 404;
        res.end(JSON.stringify({error: "Not Found"}));
        return
    }
    if(path.length != 2) {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Path malformed"}));
        return
    }
    const regex = /[a-z0-9]/;
    const docname = path[1];
    if(!docname.match(regex)) {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Invalid document name"}));
        return
    }
    if(method == "GET") {
        console.log('GET',docname)
        if(repo.has(docname)) {
            res.end(repo.get(docname));
        }
    } else if(method == "PUT") {
        console.log('PUT',docname)
        let body="";
        req.on('data',(chunk) => {
            body += chunk.toString();
        });
        req.on('end',()=>{
            repo.set(docname,body);
            res.statusCode = 201;
            res.end(JSON.stringify({reponse: "stored", docname: docname}))
        })
    } else {
        res.statusCode = 400;
        res.end(JSON.stringify({error: "Unsupported http method"}));
        return
    }

}
const server = http.createServer(router);
server.listen(3000,()=>{
    console.log('listening at 3000')
})