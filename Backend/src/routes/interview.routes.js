const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controllers/interview.controller")
const upload = require("../middleware/file.middleware");
const interviewRouter = express.Router();

/**
 * @POST /api/interview
 * @description: Generate an interview report based on the candidate's resume, self-description, and job description.
 * 
*/

interviewRouter.post("/", authMiddleware, upload.single("resume"), interviewController.generateInterviewReportController)
module.exports = interviewRouter;