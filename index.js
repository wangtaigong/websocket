const http = require('http')
const WebSocket = require('./websocket')

const serv = http.createServer((req, res) => {
    // console.log('res==========', res);
    res.end('websocket test\r\n');
})

serv.on('upgrade', (req, socket, updateHeaders) => {
    const ws = new WebSocket(req, socket, updateHeaders)
    ws.on('data', data => {
        console.log(data);
    })
})

serv.listen('3000')


