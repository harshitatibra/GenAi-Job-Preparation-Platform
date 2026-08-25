const redis = require("redis")
const config = require("./config");

const redisClient = redis.createClient({
    url: config.REDIS_URL
})

redisClient.on("error", (err) => {
    console.log("Redis Error:", err)
})

async function connectToRedis() {
    try {
        await redisClient.connect()
        console.log("Connected to Redis")
    }
    catch(err) {
        console.log("Redis connection error:", err)
    }
}

module.exports = {
    redisClient,
    connectToRedis
}