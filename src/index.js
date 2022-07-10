const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const filter = require('bad-words')
const { generatemessage , generatelocationmessage} = require('./utils/messages')
const { adduser , removeuser , getuser , getuserinroom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join',({username , room} , callback)=>{
        const { error , user } = adduser({ id : socket.id , username , room})
        if(error){
            return callback(error)
        }


        socket.join(user.room)//socket.join can be used only in server
        socket.emit('message', generatemessage('Admin', 'welcome'))
        socket.broadcast.to(user.room).emit('message' , generatemessage('Admin' , `${user.username} has joined`)) // sends to everyone other than the user itself
        io.to(user.room).emit('roomdata' , {
            room : user.room,
            users : getuserinroom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message , callback) => {
        const user = getuser(socket.id)
        const fil = new filter()
        if(fil.isProfane(message))
        {
            return callback('profanity is not allowed')
        }
        io.to(user.room).emit('message', generatemessage(user.username , message))
        callback()
    })
    socket.on('sendlocation' , (coords , callback)=>{
        const user = getuser(socket.id)
        io.to(user.room).emit('locationmessage' , generatelocationmessage(user.username , `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) 
        callback('location sent')
    })

    socket.on('disconnect' , ()=>{//spelling of disconnect should be exact same
        const user = removeuser(socket.id)
        if(user){
            io.to(user.room).emit('message' , generatemessage('Admin' , `${user.username} has left`))
            io.to(user.room).emit('roomdata' , {
                room : user.room,
                users : getuserinroom(user.room)
            })
        } 
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})