
import express from "express";
import http from "http";
import crypto from "crypto";

import {Server} from "socket.io";
const app=express();

const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));


app.get("/",(req,res)=>{
    res.send("Server alive!!");
})

const rooms = {};

io.on("connection",socket=>{
    console.log("Connected:",socket.id);

    socket.on("disconnect",()=>{
     console.log("Disconnected:",socket.id);
     for(const roomId in rooms)
     {
        if(rooms[roomId].ownerSocketid===socket.id)
        {
            io.to(roomId).emit("Room-closed");
            delete rooms[roomId];
            continue;
        }
        if(rooms[roomId].pendingReq[socket.id])
        {
            delete rooms[roomId].pendingReq[socket.id];
        }
         if(rooms[roomId].users[socket.id])
        {
            const delUser=rooms[roomId].users[socket.id];
             delete rooms[roomId].users[socket.id];
             io.to(roomId).emit("user-left",delUser);
             break;
        
        }
     }
    });
    
    socket.on("create-room",({username,duration})=>{
      
        let roomId;
        do{
            roomId=crypto.randomBytes(4).toString("hex");
        }while(rooms[roomId]);

        const expiryDelay = duration * 1000;
        const warningDelay = (expiryDelay - 5000)<5000?expiryDelay:(expiryDelay - 5000);

        rooms[roomId]={
            roomId,
            ownerSocketid:socket.id,
            users:{[socket.id]:username},
            pendingReq:{},
            createdAt:Date.now(),
             expiryTime:Date.now()+expiryDelay,
             warningTimeout:setTimeout(()=>{       
               io.to(roomId).emit("only 5 sec left");
             },warningDelay),
            expiryTimeout:setTimeout(()=>{
               io.to(roomId).emit("room expired");
               delete rooms[roomId];
             },expiryDelay)
        };
        socket.join(roomId);
        socket.emit("room-created", { roomId });

    });

    socket.on("join-room",({roomId,username})=>{
    let k=rooms[roomId];
    if(!k) return; 
    if(k.users[socket.id]||k.pendingReq[socket.id]) return;
     k.pendingReq[socket.id]=username;
    io.to(k.ownerSocketid).emit("join-request",{
        roomId,
        requestedsockId:socket.id,
        username
    });
    });

   

    socket.on("approve-join",({roomId,requestedsockId})=>{
     let room=rooms[roomId];
     if(!room)
     { 
        return;
     }
     if(!(socket.id===room.ownerSocketid))
        {
            return;
        }
     if(!room.pendingReq[requestedsockId])
    {
        return;
     }
     const target=io.sockets.sockets.get(requestedsockId);
     if(!target)
        {
            return;
        }
     target.join(roomId);
     target.emit("approved",{roomId});
    const username=room.pendingReq[requestedsockId];
     delete room.pendingReq[requestedsockId];
     room.users[requestedsockId]=username;  
     io.to(roomId).emit("user-joined",{username});          
    });

    socket.on("reject-join",({roomId,requestedsockId})=>{
        let room=rooms[roomId];
            if(!room)
            {
              return;
            } 
         if(!(socket.id===room.ownerSocketid))
            {
                return;
            }
         if(!room.pendingReq[requestedsockId])
            {
                return;
            }
        let t=io.sockets.sockets.get(requestedsockId);
        delete room.pendingReq[requestedsockId];
        if(!t)
            {
              return;
            } 
        t.emit("join-rejected",{roomId});
        
    });

    socket.on("send-message",({roomId,message})=>{
     let room=rooms[roomId];
     if(!room) 
        {
            return;
        }
     let username=room.users[socket.id];
     if(!username) {
        return;
     }
     const timeStamp=new Date().toISOString();
     io.to(roomId).emit("new-message",{
        username,
        message,
        timeStamp
     });
    });


    
});


const port=3000;
server.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});



