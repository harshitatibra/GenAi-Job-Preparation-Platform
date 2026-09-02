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

/**
 * @GET /api/interview/report/:interviewId
 * @description: Retrieve a specific interview report by its ID.
 * 
 */

interviewRouter.get("/report/:interviewId", authMiddleware, interviewController.getInterviewReportByIdController)

/**
 * @GET /api/interview/reports
 * @description get all interview reports for a user
 */
interviewRouter.get("/reports", authMiddleware, interviewController.getAllInterviewReportsController)

/**
 * @GET /api/interview/resume/pdf
 * @description: Generate a PDF of the interview report based on the candidate's resume, self-description, and job description.
 */

interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController)

/**
 * @DELETE /api/interview/report/:interviewId
 * @description: Delete a specific interview report by its ID.
 */

interviewRouter.delete("/report/:interviewId", authMiddleware, interviewController.deleteInterviewReportByIdController)

module.exports = interviewRouter;