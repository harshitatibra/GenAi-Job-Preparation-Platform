const {Router} = require("express")

const authRouter = Router()
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")
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

/**
 * @route GET /api/auth/get-me
 * @desc get the current logged in user details
 * @access private
 */

authRouter.get("/get-me", authMiddleware, authController.getMeController)

module.exports = authRouter