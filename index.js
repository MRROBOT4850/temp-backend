// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// const nodemailer = require("nodemailer");
// const { RateLimiterMemory } = require("rate-limiter-flexible");

// const getClientIp = require("./utils/getIP");
// const { cleanMessage } = require("./utils/filter");

// const BannedIP = require("./models/BannedIP");
// const IPLog = require("./models/IPLog");

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.set("trust proxy", true);

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["https://movie-maniacs.vercel.app","https://ghost-talk-tan.vercel.app","http://localhost:5173"],
//     credentials: true
//   }
// });

// const PORT = process.env.PORT || 5000;

// // ✅ MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.log(err));


// // 📧 Nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL,
//     pass: process.env.PASS
//   }
// });

// let emailQueue = [];

// // send email after 1 hour
// setInterval(async () => {
//   if (emailQueue.length === 0) return;

//   const email = emailQueue.shift();

//   try {
//     await transporter.sendMail(email);
//     console.log("Email sent");
//   } catch (err) {
//     console.log("Email error", err);
//   }
// }, 60 * 60 * 1000); // 1 hour


// // ⚡ Rate limiter
// const limiter = new RateLimiterMemory({
//   points: 5,
//   duration: 10
// });


// // 🚫 BAN middleware
// io.use(async (socket, next) => {
//   const ip = getClientIp(socket);
//   const fingerprint = socket.handshake.auth?.fingerprint;

//   const banned = await BannedIP.findOne({
//     $or: [{ ip }, { fingerprint }]
//   });

//   if (banned) return next(new Error("Banned"));

//   socket.userIP = ip;
//   socket.fingerprint = fingerprint;

//   next();
// });


// // 🧠 violation tracking
// const violations = new Map();


// // 🔌 SOCKET
// io.on("connection", (socket) => {

//   console.log("Connected:", socket.id);

//   // JOIN
//   socket.on("join-room", async ({ roomId }) => {

//     socket.join(roomId);

//     await IPLog.create({
//       ip: socket.userIP,
//       fingerprint: socket.fingerprint,
//       roomId
//     });

//     const room = io.sockets.adapter.rooms.get(roomId);
//     const size = room ? room.size : 0;

//     io.to(roomId).emit("room-size", size);
//   });


//   // MESSAGE
//   socket.on("send-message", async ({ roomId, message, sender }) => {

//     try {
//       await limiter.consume(socket.userIP);
//     } catch {
//       socket.emit("error", "Too many messages");
//       return;
//     }

//     const cleaned = cleanMessage(message);

//     // violation check
//     if (cleaned !== message) {
//       let count = violations.get(socket.userIP) || 0;
//       count++;
//       violations.set(socket.userIP, count);

//       if (count >= 3) {
//         await BannedIP.create({
//           ip: socket.userIP,
//           fingerprint: socket.fingerprint,
//           reason: "Abuse",
//           expiresAt: new Date(Date.now() + 60 * 60 * 1000)
//         });

//         socket.disconnect();
//         return;
//       }
//     }

//     io.to(roomId).emit("message-received", {
//       sender,
//       message: cleaned
//     });
//   });


//   // DISCONNECT
//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((roomId) => {
//       if (roomId !== socket.id) {
//         setTimeout(() => {
//           const room = io.sockets.adapter.rooms.get(roomId);
//           const size = room ? room.size : 0;
//           io.to(roomId).emit("room-size", size);
//         }, 100);
//       }
//     });
//   });

// });


// // 📩 API to request room email
// // app.post("/notify-room", (req, res) => {
// //   const { email } = req.body;

// //   emailQueue.push({
// //     from: process.env.GMAIL,
// //     to: email,
// //     subject: "Room Available",
// //     text: "A room is now available. Join now!"
// //   });

// //   res.json({ success: true });
// // });
// app.post("/send-gmail",async (req,res)=>{
 
//   const {to}=req.body;
//   const subject="Regarding Scheduling of Room";
  
//     const mailOptions = {
//         from:process.env.GMAIL,
//         to,
//         subject,
//         text:"Your Request is accepted . Now you can join a room .",
//        html: `
//           <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//             <h2 style="color: #4CAF50;">Request Accepted!</h2>
//             <p>Your request has been approved. You can now join a room.</p>
//             <p>
//               <a href="https://ghost-talk-tan.vercel.app/generate-room" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
//                 Join a Room
//               </a>
//             </p>
//             <p>If you have any questions, feel free to reply to this email.</p>
//           </div>
//         `

        
//     };

//     //gmailQueue.push(mailOptions);

//   try{
//       gmailQueue.push(mailOptions);
//       console.log(mailOptions);
//       res.status(200).json({
//         success:true,
//         message:"Your Request is Scheduled."
//       })
//       //console.log("request chal gyi hai "+gmailQueue.length)
//   }
//   catch(e){
//       console.log(e);
//       res.json({
//         success:false,
//         message:e
//       })
//   }
 


// })

// // 🧹 auto remove expired bans
// setInterval(async () => {
//   await BannedIP.deleteMany({
//     expiresAt: { $lt: new Date() }
//   });
// }, 10 * 60 * 1000);


// // 🌐 test route
// app.get("/", (req, res) => {
//   res.send("Server running");
// });
// app.get('/check-rooms/:roomId', (req, res) => {
//   const { roomId } = req.params;

//   if (!roomId) {
//     return res.status(400).json({ success: false, message: "Room ID is required" });
//   }

//   const exists = roomMap.has(roomId);

//   return res.json({ success: exists });
// });

// server.listen(PORT, () => {
//   console.log("Server running on", PORT);
// });

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const { RateLimiterMemory } = require("rate-limiter-flexible");

const getClientIp = require("./utils/getIP");
const { cleanMessage } = require("./utils/filter");

const BannedIP = require("./models/BannedIP");
const IPLog = require("./models/IPLog");

const app = express();
app.use(express.json());
app.use(cors());
app.set("trust proxy", true);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://movie-maniacs.vercel.app",
      "https://ghost-talk-tan.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* =========================
   📦 ROOM SYSTEM
========================= */
const roomMap = new Map();
const ROOM_LIMIT = 100;
const ROOM_TTL_MS = 60 * 60 * 1000;

/* =========================
   📧 EMAIL SYSTEM
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS
  }
});

let emailQueue = [];

// process queue every 1 min (not 1 hour)
setInterval(async () => {
  if (emailQueue.length === 0) return;

  const email = emailQueue.shift();

  try {
    await transporter.sendMail(email);
    console.log("Email sent");
  } catch (err) {
    console.log("Email error", err);
  }
}, 60 * 1000);

/* =========================
   ⚡ RATE LIMIT
========================= */
const limiter = new RateLimiterMemory({
  points: 5,
  duration: 10
});

/* =========================
   🚫 BAN MIDDLEWARE
========================= */
io.use(async (socket, next) => {
  const ip = getClientIp(socket);
  const fingerprint = socket.handshake.auth?.fingerprint;

  const banned = await BannedIP.findOne({
    $or: [{ ip }, { fingerprint }]
  });

  if (banned) return next(new Error("Banned"));

  socket.userIP = ip;
  socket.fingerprint = fingerprint;

  next();
});

/* =========================
   🧠 VIOLATION TRACK
========================= */
const violations = new Map();

/* =========================
   🔌 SOCKET
========================= */
io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

socket.on("join-room", async ({ roomId, name }) => {

  if (!roomMap.has(roomId)) {
    socket.emit("error", "Room does not exist");
    return;
  }
   
  socket.join(roomId);
  const ip = socket.userIP;
  const fingerprint = socket.fingerprint;
 const existing = await IPLog.findOne({
    ip,
    roomId
  });

  if (!existing) {
    await IPLog.create({
      ip,
      fingerprint,
      roomId
    });
  }


  // ✅ OPTIONAL: notify others in room
  socket.to(roomId).emit("user-joined", name || "Someone joined");

  // ✅ get updated room size
  const size = io.sockets.adapter.rooms.get(roomId)?.size || 0;

  // 🔥 THIS is your online user update event
  io.to(roomId).emit("room-size", size);
});


  socket.on("send-message", async ({ roomId, message, sender }) => {

    try {
      await limiter.consume(socket.userIP);
    } catch {
      socket.emit("error", "Too many messages");
      return;
    }

    const cleaned = cleanMessage(message);

    if (cleaned !== message) {
      let count = violations.get(socket.userIP) || 0;
      count++;

      if (count >= 3) {
        await BannedIP.create({
          ip: socket.userIP,
          fingerprint: socket.fingerprint,
          reason: "Abuse",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        socket.disconnect();
        return;
      }

      violations.set(socket.userIP, count);
    }

    io.to(roomId).emit("message-received", {
      sender,
      message: cleaned
    });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        setTimeout(() => {
          const size = io.sockets.adapter.rooms.get(roomId)?.size || 0;
          io.to(roomId).emit("room-size", size);
        }, 100);
      }
    });
  });
});

/* =========================
   🧩 APIs
========================= */

// CREATE ROOM
app.post("/register-room", (req, res) => {
  const { roomId } = req.body;

  if (!roomId || typeof roomId !== "string") {
    return res.status(400).json({ success: false, message: "Invalid roomId" });
  }

  if (roomMap.size >= ROOM_LIMIT) {
    return res.status(400).json({
      success: false,
      message: "Room limit reached"
    });
  }

  if (roomMap.has(roomId)) {
    return res.status(400).json({
      success: false,
      message: "Room already exists"
    });
  }

  roomMap.set(roomId, Date.now());

  res.json({
    success: true,
    message: "Room created",
    roomsLeft: ROOM_LIMIT - roomMap.size
  });
});

// CHECK ROOM
app.get("/check-rooms/:roomId", (req, res) => {
  const exists = roomMap.has(req.params.roomId);
  res.json({ success: exists });
});

// ROOM COUNT
app.get("/get-roomCount", (req, res) => {
  res.json({
    roomCount: ROOM_LIMIT - roomMap.size
  });
});

// EMAIL API
app.post("/send-gmail", (req, res) => {
  const { to } = req.body;

  const mailOptions = {
    from: process.env.GMAIL,
    to,
    subject: "Room Approved",
    html: `<h2>Your request is approved</h2>
           <a href="https://ghost-talk-tan.vercel.app/generate-room">Join Room</a>`
  };

  emailQueue.push(mailOptions);

  res.json({
    success: true,
    message: "Email queued"
  });
});

// HEALTH
app.get("/ping", (req, res) => res.send("pong"));
app.get("/", (req, res) => res.send("Server running"));

/* =========================
   🧹 ROOM CLEANUP
========================= */
setInterval(() => {
  const now = Date.now();

  for (const [roomId, createdAt] of roomMap.entries()) {
    if (now - createdAt > ROOM_TTL_MS) {
      roomMap.delete(roomId);

      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients) {
        for (const socketId of clients) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.leave(roomId);
            socket.disconnect(true);
          }
        }
      }

      console.log("Room expired:", roomId);

      if (emailQueue.length > 0) {
        console.log("Processing queued emails...");
      }
    }
  }
}, 60 * 1000);

/* =========================
   🚫 CLEAN EXPIRED BANS
========================= */
setInterval(async () => {
  await BannedIP.deleteMany({
    expiresAt: { $lt: new Date() }
  });
}, 10 * 60 * 1000);

/* =========================
   🚀 START SERVER
========================= */
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});