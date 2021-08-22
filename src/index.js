import http from 'http'
import WebSocket from'./websocket.js'

const serv = http.createServer((req, res) => {
    console.log('res==========');
    res.end('websocket test\r\n');
})

serv.on('upgrade', (req, socket, updateHeaders) => {
    console.log(11);
    const ws = new WebSocket(req, socket, updateHeaders)
    ws.on('data', data => {
        console.log('data=', data, socket);
    })
})

serv.listen('3000')


