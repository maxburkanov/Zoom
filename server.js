const express = require("express")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const {v4: uuidV4} = require("uuid")

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", (request, response) => {
  response.redirect(`/${uuidV4()}`)
})

app.get("/:room", (request, response) => {
  response.render("room", { roomId: request.params.room })
})

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })

})



server.listen(3000)
