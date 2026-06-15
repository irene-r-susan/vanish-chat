
import express from "express";
import http from "http";
import crypto from "crypto";
import dotenv from "dotenv";

import {Server} from "socket.io";
import pool from "./db.js";

dotenv.config();

// Auto-create rooms table on startup
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expired_at TIMESTAMP,
        peak_user_count INT DEFAULT 0,
        total_messages INT DEFAULT 0,
        is_expired BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('✅ Rooms table initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

await initializeDatabase();

const app=express();

const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));


app.get("/",(req,res)=>{
    res.send("Server alive!!");
})

app.get("/analytics", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_rooms,
                SUM(total_messages) as total_messages,
                SUM(peak_user_count) as total_users,
                COUNT(CASE WHEN is_expired = false THEN 1 END) as active_rooms
            FROM rooms;
        `);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Analytics query error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

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
            messageCount:0,
            peakUserCount:1,
            warningTimeout:setTimeout(()=>{       
               io.to(roomId).emit("only 5 sec left");
             },warningDelay),
            expiryTimeout:setTimeout(()=>{
               io.to(roomId).emit("room expired");
               // Update database before deleting room
               pool.query(
                   `UPDATE rooms SET expired_at = $1, peak_user_count = $2, total_messages = $3, is_expired = true 
                    WHERE room_id = $4`,
                   [Date.now(), rooms[roomId].peakUserCount, rooms[roomId].messageCount, roomId]
               ).catch(err => console.error('Error updating room expiry:', err));
               delete rooms[roomId];
             },expiryDelay)
        };

        // Insert room into database
        pool.query(
            `INSERT INTO rooms (room_id, created_at) VALUES ($1, $2)
             ON CONFLICT (room_id) DO NOTHING`,
            [roomId, Date.now()]
        ).catch(err => console.error('Error inserting room:', err));

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
     
     // Track peak user count
     const currentUserCount = Object.keys(room.users).length;
     if(currentUserCount > room.peakUserCount) {
         room.peakUserCount = currentUserCount;
     }
     
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
     // Increment message count
     room.messageCount++;
     
     const timeStamp=new Date().toISOString();
     io.to(roomId).emit("new-message",{
        username,
        message,
        timeStamp
     });
    });


    
});


const port= process.env.PORT || 3000;;
server.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});



