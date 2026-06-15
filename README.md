
# 🍃 Vanish Chat

Vanish Chat is a privacy-focused, ephemeral messaging application where chat rooms and messages self-destruct after a set time. Built with **Node.js**, **Express**, **Socket.io**, and **PostgreSQL**, it ensures that your conversations are temporary and leave minimal trace.

## 🔗 Live Demo
https://vanish-chat.onrender.com

## ✨ Key Features

- **Self-Destructing Rooms:** Rooms automatically expire after a set duration and are deleted from server memory
- **Real-time Chat:** Instant bidirectional communication powered by Socket.io
- **Owner Approval System:** Room creators can approve/deny join requests
- **Analytics Dashboard:** Track total rooms, messages, and active users via `/analytics` endpoint
- **PostgreSQL Integration:** Persistent storage for analytics and room history
- **Zero-Friction Secure Sharing:** Invite others via room ID

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Real-time:** Socket.io
- **Database:** PostgreSQL
- **Environment:** dotenv

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- npm (comes with Node.js)
- PostgreSQL database (local or cloud-based)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd vanish-chat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=3000
   ```

4. **Initialize the database:**
   ```bash
   node setup.js
   ```
   This creates the `rooms` analytics table in PostgreSQL.

5. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Navigate to `http://localhost:3000` in your browser

## 📊 API Endpoints

### Analytics
- **GET `/analytics`** - Returns aggregated room and message statistics
  ```json
  {
    "total_rooms": 42,
    "total_messages": 1250,
    "total_users": 156,
    "active_rooms": 8
  }
  ```

## 🔒 Security & Privacy

- **Ephemeral Design:** Rooms auto-expire and are purged from memory
- **No Message Persistence:** Chat messages are not stored in the database
- **Owner Approval:** Room creators control who joins
- **SSL Support:** Database connections use SSL encryption

## 📁 Project Structure

```
vanish-chat/
├── server.js          # Express & Socket.io server
├── db.js              # PostgreSQL database connection
├── setup.js           # Database initialization script
├── package.json       # Dependencies & scripts
└── public/
    ├── index.html     # Frontend HTML
    ├── script.js      # Client-side Socket.io logic
    └── style.css      # Styling
```

## 🐛 Troubleshooting

### "Failed to fetch analytics" error
- Ensure `.env` has a valid `DATABASE_URL`
- Run `node setup.js` to create the database table
- Check that PostgreSQL is running and accessible

