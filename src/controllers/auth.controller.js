const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { redisClient } = require("../config/redis")
const config = require("../config/config");

/**
 * 
 * @route POST /api/auth/register
 * @desc Register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res){
    const {username, email, password} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message: "Please provide all required fields"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User with this email or username already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({ id:user._id }, config.JWT_SECRET, { expiresIn: "1d" })

    res.cookie("token",token)
    
    res.status(201).json({
        message: "User registered successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 *@name loginUserController
 *@route POST /api/auth/login
 *@desc Login a user, expects email and password in the request body
 */

async function loginUserController(req,res) {
    const {email, password} = req.body

    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if(!isValidPassword){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const token = jwt.sign({ id:user._id }, config.JWT_SECRET, { expiresIn: "1d" })

    res.cookie("token",token)
    
    res.status(201).json({
        message: "User loggedIn successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function logoutUserController(req, res) {
    const token = req.cookies.token

    if(!token){
        return res.status(400).json({
            message: "User is not logged in"
        })
    }

    try{
        const decodedToken = jwt.decode(token)

        if(decodedToken && decodedToken.exp){
            const currenTime = Math.floor(Date.now()/1000)

            const remainingTime = decodedToken.exp - currenTime

            if(remainingTime > 0){
                const tokenHash = crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex")

                await redisClient.set(
                    `blacklist:${tokenHash}`,
                    "true",
                    {
                        EX: remainingTime
                    }
                )
            }
        }
        res.clearCookie("token")

        return res.status(200).json({
            message: "User logged out successfully"
        })
    }
    catch(err){
        console.log(err)

        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController
}

