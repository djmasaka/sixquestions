const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors")
const path = require("path")

const corsOptions = {
	origin: "*"
};

const port = process.env.PORT || 3000;

const app = express();
app.use(cors(corsOptions))

const server = http.createServer(app);

const io = socketIo(server,{
  cors: {
    origin: "*",
  }
})



const formatMessage = require('./messages')
const { userJoin,  getCurrentUser,  userLeave,  getUsers} = require('./users')

io.on("connection", (socket) => {
  // console.log("New client connected");
  socket.on('joinChat', ({ username, room }) => {
    userJoin(socket.id, username, room)
    socket.join(room)
    io.to(room).emit('users', {users: getUsers(room)})
  })
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)
    console.log("Client disconnected");
  })
  socket.on("clientMessage", (data) =>{
    const user = getCurrentUser(socket.id)
    socket.to(user.room).emit("hostMessage", formatMessage(user.username, data))
  })
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/game/:id', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
});

app.use('/static', express.static(path.join(__dirname, '/build/static')))

server.listen(port, () => console.log(`Listening on port ${port}`));