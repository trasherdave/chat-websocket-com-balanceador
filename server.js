const portaPadrao = 8001



const express = require('express')
const app = express()

app.use(express.static("public"))

const http = require('http').Server(app)
const serverSocket = require('socket.io')(http)
serverSocket.set('transports',['websocket'])


const porta = process.argv.length == 3 ? process.argv[2] : process.env.PORT || portaPadrao

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(porta, function(){

    if (process.env.HEROKU_APP_NAME) 
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador no endereço do balanceador de carga')
})

app.get('/', function (requisicao, resposta) {
    resposta.sendFile(__dirname + '/index.html')
})


serverSocket.on('connect', function(socket){
    socket.on('login', function (nickname) {
        socket.nickname = nickname
        const msg = nickname + ' conectou'
        console.log(msg)
        serverSocket.emit('chat msg', msg)
    })

    socket.on('disconnect', function(){
        console.log('Cliente desconectado: ' + socket.nickname)
    })

    socket.on('chat msg', function(msg){
        serverSocket.emit('chat msg', `${socket.nickname} diz: ${msg}`)
    })

    socket.on('status', function(msg){
        console.log(msg)
        socket.broadcast.emit('status', msg)
    })
})

