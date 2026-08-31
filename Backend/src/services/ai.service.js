const {GoogleGenAI} = require("@google/genai");
const z = require("zod");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    title: z.string().describe("The title of the job for which the interview report is being generated"),
    matchScore : z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap")
    })).describe("Skill gaps that the candidate has along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The focus of the preparation for that day, e.g., 'Data Structures', 'System Design', Mock Interviews etc."),
        tasks: z.array(z.string().describe("The tasks to be completed on that day, e.g., 'Read Chapter 1 of Data Structures', 'Solve 5 LeetCode problems', 'Conduct a mock interview' etc."))
    })).describe("A day-wise preparation plan for the candidate to improve their skills and prepare for the interview"),
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert career coach and technical interviewer.

Analyze the candidate against the provided job description.

CANDIDATE RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Generate a comprehensive interview preparation report.

Evaluate:
1. Overall match score from 0 to 100
2. Technical interview questions
3. Behavioral interview questions
4. Skill gaps with severity
5. A day-wise preparation plan
6. Job title

Be realistic and don't give a high score simply because keywords match.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],

        config: {
            responseMimeType: "application/json",

            responseJsonSchema: z.toJSONSchema(interviewReportSchema)
        }
    });

    return JSON.parse(response.text);
}


module.exports = {
    generateInterviewReport
};