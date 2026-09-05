const express = require("express")
const cookieParser = require ("cookie-parser")
const app = express()
const cors = require("cors")
const path = require('path');
const publicDir = path.join(__dirname, '..', 'public');



app.use(express.json())
app.use(cookieParser())
app.use(express.static(publicDir));
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/interview", interviewRouter)

app.use("/api/auth", authRouter)

module.exports = app