const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(3003, ()=>{
    console.log("Ride Server Started at 3003");
});