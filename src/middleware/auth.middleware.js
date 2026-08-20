const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const { redisClient } = require("../config/redis")

async function authMiddleware(req, res, next) {

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    try {

        // 1. Verify JWT
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        // 2. Hash the token
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        // 3. Check Redis
        const isBlacklisted = await redisClient.get(
            `blacklist:${tokenHash}`
        )

        if(isBlacklisted){
            return res.status(401).json({
                message: "Token has been revoked"
            })
        }

        // 4. Store decoded user information
        req.user = decodedToken

        // 5. Continue
        next()

    }
    catch(err){

        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

module.exports = authMiddleware