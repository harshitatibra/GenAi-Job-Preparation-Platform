require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const { connectToRedis } = require("./src/config/redis")

connectToDB()

async function startServer() {
    await connectToDB()
    await connectToRedis()

    app.listen(3000, () => {
        console.log("Server is running on port 3000")
    })
}

startServer()