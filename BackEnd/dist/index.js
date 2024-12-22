"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        //@ts-ignore
        const pasrsedMessage = JSON.parse(message);
        if (pasrsedMessage.type == "join") {
            console.log("user joined room " + pasrsedMessage.payload.roomId);
            allSockets.push({
                socket,
                room: pasrsedMessage.payload.roomId
            });
        }
        if (pasrsedMessage.type == "chat") {
            console.log("user wants to chat");
            // const currentUserRoom = allSockets.find((x) => x.socket == socket);
            let currentUserRoom = null;
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].socket == socket) {
                    currentUserRoom = allSockets[i].room;
                }
            }
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].room == currentUserRoom) {
                    allSockets[i].socket.send(pasrsedMessage.payload.message);
                }
            }
        }
    });
});
