require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debug (optional but helpful)
console.log("🔗 Connecting to MongoDB...");
console.log("URI:", process.env.MONGO_URI);

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");

        // Server start AFTER DB connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("❌ MongoDB connection error:", err);
    });