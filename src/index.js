import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import process from 'process'
import { Server } from 'socket.io'
import http from 'http'
import { generateMessage, generateLocationMessage } from './utils/messages.js'
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = process.env.PORT || 3000

//Define paths for Express config
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.get('/', (_req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {


    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error, undefined)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome to our chat app!'))
        socket.broadcast.to(room).emit('message', generateMessage('Admin', `${username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback(undefined, 'Joined successfully')
    })

    socket.on('sendMessage', (msg, callback) => {
        if (!msg.trim()) {
            return callback('Could not send empty message', undefined)
        }

        const { user } = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback(undefined, 'Message received successfully') //acknowledgement
    })

    socket.on('sendLocation', (location, callback) => {
        const { user } = getUser(socket.id)
        if (user) {
            io.to(user.room).emit('locationMessage',
                generateLocationMessage(user.username, `http://google.com/maps?q=${location.latitude},${location.longitude}`)
            )
            callback(undefined, 'Location shared!')
        } else {
            callback('error', undefined)
        }
    })

    socket.on('disconnect', () => {
        const { user } = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has been left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })


})
server.listen(port, () => {
    console.log(`Server is listening in port ${port}`);
})