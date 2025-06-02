const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(3001, ()=>{
    console.log("Server Started at 3001");
});