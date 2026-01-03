const socket = io();
let currentRoomId = null;


const lobby = document.getElementById('lobby');
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const requestList = document.getElementById('request-list');
const adminPanel = document.getElementById('admin-panel');



let roomKey = ""; 

function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15);
}

function createRoom() {
    const username = document.getElementById('create-username').value;
    const duration = document.getElementById('room-duration').value;
    
    if (!username || !duration) return alert("Fill all fields");

    roomKey = generateRandomKey();
    
    socket.emit("create-room", { username, duration: parseInt(duration) });
   
}

function joinRoom() {
    alert("Request sent");
    const username = document.getElementById('join-username').value;
    const inputVal = document.getElementById('join-roomId').value; 
    if (!username || !inputVal) return alert("Fill all fields");

    if (inputVal.includes(':')) {
        [currentRoomId, roomKey] = inputVal.split(':');
    } else {
        currentRoomId = inputVal;
        roomKey = "unknown"; 
    }

    socket.emit("join-room", { roomId: currentRoomId, username });
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    if (input.value.trim() && currentRoomId) {
        socket.emit("send-message", { roomId: currentRoomId, message: input.value });
        input.value = "";
    }
}


socket.on("room-created", ({ roomId }) => {
    currentRoomId = roomId;
    
    window.location.hash = `${roomId}:${roomKey}`;
    
    showChat();
    adminPanel.classList.remove('hidden');
    
    const shareLink = `${window.location.origin}/#${roomId}:${roomKey}`;
    addSystemMessage(`Room created! Share this secure link: ${shareLink}`);
});

socket.on("approved", ({ roomId }) => {
    currentRoomId = roomId;
    showChat();
    addSystemMessage(`Joined room: ${roomId}`);
});

socket.on("join-request", ({ roomId, requestedsockId, username }) => {
    const li = document.createElement('li');
    li.id = `req-${requestedsockId}`;
    li.innerHTML = `
        <span>${username} wants to join</span>
        <div class="box">
            <button class="btn-small" onclick="approve('${requestedsockId}')">Approve</button>
            <button class="btn-small" style="background:red" onclick="reject('${requestedsockId}')">Reject</button>
        </div>
    `;
    requestList.appendChild(li);
});

socket.on("new-message", ({ username, message, timeStamp }) => {
    const div = document.createElement('div');
    div.className = "msg";
    div.innerHTML = `<small>${new Date(timeStamp).toLocaleTimeString()}</small> <b>${username}:</b> ${message}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on("only 5 sec left", () => {
    document.getElementById('timer-warning').innerText = "⚠️ 5 SECONDS REMAINING!";
});


socket.on("room expired", () => {
    alert("Room expired!");
    window.location.replace(window.location.origin); 
});

socket.on("Room-closed", () => {
    alert("Owner left. Room closed.");
    window.location.replace(window.location.origin);
});





function approve(socketId) {
    socket.emit("approve-join", { roomId: currentRoomId, requestedsockId: socketId });
    document.getElementById(`req-${socketId}`).remove();
}

function reject(socketId) {
    socket.emit("reject-join", { roomId: currentRoomId, requestedsockId: socketId });
    document.getElementById(`req-${socketId}`).remove();
}

function showChat() {
    lobby.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    document.getElementById('display-room-id').innerText = `Room: ${currentRoomId}`;
}

function addSystemMessage(text) {
    const div = document.createElement('div');
    div.style.color = "gray";
    div.style.textAlign = "center";
    div.innerText = text;
    messagesDiv.appendChild(div);
}



window.onload = () => {
    if (window.location.hash) {
        const hashContent = window.location.hash.substring(1); 
        
        if (hashContent.includes(':')) {
            const [id, key] = hashContent.split(':');
            
            currentRoomId = id;
            roomKey = key;

            document.getElementById('join-roomId').value = id;

          
            window.history.replaceState(null, null, window.location.pathname);
            
            console.log("Secure data extracted and URL cleaned!");
        }
    }
};

