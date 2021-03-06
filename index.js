// server and socket.io

require("dotenv/config")
const config = process.env;
const express = require("express");
const app = express();
const sv = require("http").Server;
const server = new sv(app)
const io = require("socket.io")(server);
const { v4: roomID } = require("uuid");
const cookieParser = require("cookie-parser");
const rooms = new Map();

// set up and run server
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cookieParser(config.cookie_parser));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    const userID = roomID();
    if (req.cookies.roomID) {
        return res.clearCookie("roomID").cookie("userID", userID).render("index", { userID: userID });
    } else res.cookie("userID", userID).render("index", { userID: userID });
});

app.get("/new", (req, res) => {
    const id = roomID();
    rooms.set(id, [req.cookies.userID]);
    res.cookie("roomID", id).redirect(`/${id}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomID: req.cookies.roomID || req.params.room, userID: req.cookies.userID });
});

app.post("/join", (req, res) => {
    const postInfo = req.body;
    const getId = rooms.get(postInfo.roomID);
    if (getId) {
        return res.cookie("roomID", postInfo.roomID).redirect(`/${postInfo.roomID}`);
    } else {
        return res.redirect("/");
    }
});

// socket.io listeners

io.on("connection", socket => {
    socket.on("newUser", userID => {
        console.log(userID)
    });
    socket.on("roomJoined", (roomID, userID) => {
        socket.join(roomID);
        socket.to(roomID).broadcast.emit("userConnected", userID);

        socket.on("disconnect", () => {
            socket.to(roomID).broadcast.emit("userDisconnected", userID);
        });
    });
});

server.listen(8080);