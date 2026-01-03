
# 🍃 Vanish Chat

Vanish Chat is a privacy-focused, ephemeral messaging application where chat rooms and messages self-destruct after a set time. Built with **Node.js**, **Socket.io**, and **CryptoJS**, it ensures that your conversations leave no trace.

## ✨ Key Features

- **Self-Destructing Rooms:** Rooms are deleted from server memory automatically when the timer hits zero.
- **In-Memory Storage:** No persistent databases (MySQL/Postgres) are used. Once the server restarts or the room expires, the data is gone forever.
- **Zero-Friction Secure Sharing:** Invite others via a secure link. The encryption key is stored in the URL hash (`#`), meaning it's never sent to the server.
- **Real-time Interaction:** Bi-directional communication powered by Socket.io with an owner-approval system for joining rooms.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Flexbox), JavaScript (ES6)
- **Backend:** Node.js, Express.js
- **Real-time:** Socket.io
- **Security:** CryptoJS (AES Encryption)


## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/irene-r-susan/vanish-chat.git](https://github.com/irene-r-susan/vanish-chat.git)
   cd vanish-chat

    - Install dependencies: npm install
    - Start the server: node server.js

    Open the app: Navigate to http://localhost:3000 in your browser.

2. **How the Encryption Works**

   Vanish Chat uses Client-Side Encryption.
   When a room is created, a Secret Key is generated in the creator's browser.

    This key is appended to the URL as a "Fragment Identifier" (e.g., localhost:3000/#roomID:SecretKey).

    Crucially, browsers do not send the fragment identifier to the server.

    When you send a message, it is encrypted locally. The server receives a string like U2FsdGVkX19....

    Other participants use the key from their URL to decrypt and read the message.

3. **Project Structure**

CHAT_ROOM
├── public/              # Frontend assets
│   ├── index.html       # UI Structure
│   ├── style.css        # Custom Styling (Side-by-side cards)
│   └── script.js        # Frontend Logic & E2EE
├── server.js            # Node.js/Socket.io Backend logic
├── package.json         # Dependencies & Scripts
└── README.md            # You are here!       
