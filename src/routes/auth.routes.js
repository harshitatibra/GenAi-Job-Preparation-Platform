const {Router} = require("express")

const authRouter = Router()
const authController = require("../controllers/auth.controller")

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @desc Login user with email and password
 * @access Public
 */

authRouter.post("/login", authController.loginUserController)

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Public
 */

authRouter.post("/logout", authController.logoutUserController)

module.exports = authRouter