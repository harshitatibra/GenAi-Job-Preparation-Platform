const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is being generated",
    ),
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The behavioral question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .min(6)
    .describe(
      "Must contain at least 6 relevant behavioral interview questions, each with its intention and suggested answer",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of the skill gap"),
      }),
    )
    .describe("Skill gaps that the candidate has along with their severity"),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The focus of the preparation for that day, e.g., 'Data Structures', 'System Design', Mock Interviews etc.",
          ),
        tasks: z.array(
          z
            .string()
            .describe(
              "The tasks to be completed on that day, e.g., 'Read Chapter 1 of Data Structures', 'Solve 5 LeetCode problems', 'Conduct a mock interview' etc.",
            ),
        ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to improve their skills and prepare for the interview",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
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

1. Overall match score from 0 to 100.

2. Technical interview questions.
Generate relevant technical questions based on the candidate's
resume, self-description, and job description.

3. Behavioral interview questions.

IMPORTANT:
- Generate AT LEAST 6 behavioral interview questions.
- The behavioralQuestions array MUST contain 6 or more questions.
- behavioralQuestions MUST NOT be empty.
- Questions should be relevant to the target job and candidate.
- Personalize the questions using the candidate's resume and
  self-description wherever possible.
- Cover different behavioral areas such as:
  - teamwork
  - conflict resolution
  - leadership
  - problem solving
  - handling failure
  - communication
  - adaptability
  - handling pressure
  - motivation
- Each behavioral question must include:
  - question
  - intention
  - answer

4. Skill gaps with severity.

5. A day-wise preparation plan.

6. Job title.

Be realistic and don't give a high score simply because keywords match.

Be realistic and don't give a high score simply because keywords match.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],

    config: {
      responseMimeType: "application/json",

      responseJsonSchema: z.toJSONSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume PDF"),
  });

  const prompt = `
You are an expert Resume Writer, ATS Optimization Specialist, and Technical Recruiter.

Your task is to create a highly professional, ATS-friendly, job-tailored resume for the candidate using ONLY the information provided below.

====================
CANDIDATE INFORMATION
====================

CANDIDATE RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

====================
CORE OBJECTIVE
====================

Create a concise, highly relevant resume that maximizes the candidate's chances of passing an Applicant Tracking System (ATS) and being shortlisted by a human recruiter.

The resume must:
- Be specifically tailored to the provided job description.
- Prioritize the candidate's most relevant skills, projects, experience, and achievements.
- Naturally incorporate important keywords and technical terminology from the job description.
- Clearly demonstrate alignment between the candidate's background and the requirements of the role.
- Sound like a strong human-written resume, NOT generic, repetitive, or AI-generated.
- Be concise, factual, achievement-oriented, and professional.
- Be suitable for direct submission to a company.
- Contain NO spelling, grammar, punctuation, or formatting errors.

====================
TRUTHFULNESS & CONTENT RULES
====================

1. NEVER invent experience, employment, education, projects, certifications, technologies, responsibilities, metrics, achievements, or dates.

2. ONLY use information explicitly available in the candidate resume or self-description.

3. Do not claim that the candidate has experience with a technology merely because it appears in the job description.

4. If a job requirement matches an existing skill or experience in the candidate's information, emphasize it naturally.

5. You may rephrase, reorganize, and strengthen existing information, but you must preserve its factual meaning.

6. Do not fabricate numerical achievements. Only use metrics that are explicitly provided.

7. Do not add generic statements such as:
   - "Hardworking and motivated individual"
   - "Passionate about technology"
   - "Results-driven professional"
   - "Team player with excellent communication skills"
   unless they are specifically supported by the candidate's information.

====================
ATS OPTIMIZATION
====================

Optimize the resume for ATS parsing.

Follow these rules:

- Use standard resume section headings:
  SUMMARY
  EDUCATION
  EXPERIENCE
  PROJECTS
  SKILLS
  CERTIFICATIONS
  ACHIEVEMENTS
  or other standard sections only when relevant.

- Use conventional job titles, company names, dates, and locations.
- Use standard bullet points for experience and projects.
- Avoid tables for the main resume structure.
- Avoid multi-column layouts.
- Avoid text boxes, floating elements, icons, graphics, charts, progress bars, skill ratings, and decorative elements.
- Do not place important information inside images.
- Do not use unusual symbols that may break ATS parsing.
- Keep the document machine-readable and text-selectable.
- Use clear hierarchy through headings, bold text, spacing, and typography rather than visual graphics.

====================
JOB DESCRIPTION ANALYSIS
====================

Before writing the resume, internally analyze the job description and identify:

1. Required technical skills
2. Preferred technical skills
3. Programming languages
4. Frameworks and technologies
5. Databases and cloud technologies
6. Core CS concepts
7. Domain-specific terminology
8. Soft skills explicitly requested
9. Key responsibilities
10. Important keywords likely to be used by an ATS

Then map these requirements against the candidate's actual background.

Prioritize information that has the strongest relevance to the job.

Do NOT include keywords unnaturally just to increase keyword density.

====================
RESUME CONTENT STRATEGY
====================

SUMMARY:
- Write a 2–4 line professional summary.
- Mention the candidate's strongest relevant technical capabilities.
- Tailor it specifically to the target role.
- Avoid generic career objectives.

EXPERIENCE:
- Prioritize responsibilities and achievements relevant to the job description.
- Start bullets with strong action verbs.
- Focus on what the candidate actually built, developed, improved, analyzed, or contributed to.
- Use measurable impact only when supported by the provided information.

PROJECTS:
- Select the most relevant projects for the target role.
- Highlight technologies, architecture, technical challenges, implementation details, and measurable outcomes when available.
- Prefer technically specific bullets over generic descriptions.
- Avoid describing every minor feature.

SKILLS:
- Organize skills into logical categories.
- Include only technologies the candidate actually knows or has used.
- Prioritize skills that are relevant to the job description.
- Do not add skills solely because they appear in the job description.

EDUCATION:
- Include degree, institution, location, graduation year/date, and relevant academic information when provided.

CERTIFICATIONS:
- Include relevant certifications only when provided.

====================
BULLET POINT RULES
====================

For experience and project bullets:

- Prefer the structure:
  ACTION + TECHNICAL IMPLEMENTATION + PURPOSE/IMPACT

- Start with strong action verbs such as:
  Developed, Engineered, Implemented, Designed, Built, Integrated, Optimized, Automated, Deployed, Analyzed, Led, Improved, Developed, Architected.

- Avoid repetitive bullet openings.
- Avoid first-person pronouns.
- Avoid long paragraphs.
- Keep most bullets to 1–2 lines when rendered.
- Avoid excessive buzzwords.

Example of preferred style:

"Developed a Node.js microservice architecture with PostgreSQL and Docker to support scalable appointment and queue management."

Instead of:

"Worked on an innovative and scalable application using various technologies to improve the overall user experience."

====================
LENGTH & PRIORITIZATION
====================

The final resume must fit within 1–2 pages when converted to PDF.

Prioritize content in this order:

1. Relevant professional experience
2. Most relevant technical projects
3. Relevant technical skills
4. Education
5. Certifications/achievements

Remove or shorten low-value information if necessary.

Do not sacrifice readability merely to fit more content.

====================
HTML OUTPUT REQUIREMENTS
====================

Return ONLY valid, complete HTML.

Do NOT include:
- Markdown
- Code fences
- Explanations
- Comments outside the HTML
- JSON
- Any text before or after the HTML

The HTML must be directly usable by a standard HTML-to-PDF converter.

Use semantic HTML such as:
<header>
<section>
<h1>
<h2>
<h3>
<ul>
<li>
<p>

Use embedded CSS inside a <style> tag.

The HTML should:

- Use a clean, professional, minimal resume design.
- Be optimized for A4 paper.
- Use print-friendly styling.
- Use black/dark text with minimal or no decorative colors.
- Use a professional font such as Arial, Calibri, Helvetica, or a sans-serif fallback.
- Use consistent margins, spacing, font sizes, and line heights.
- Avoid excessive whitespace.
- Avoid overly dense text.
- Ensure headings and sections are visually distinct.
- Keep the candidate's name prominent at the top.
- Keep contact information clearly readable and ATS parsable.
- Ensure links, email, phone number, LinkedIn, and GitHub remain selectable text.

Recommended structure:

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Candidate Resume</title>
    <style>
        /* print-friendly resume CSS */
    </style>
</head>
<body>
    <!-- resume content -->
</body>
</html>

Use print CSS such as:

@page {
    size: A4;
    margin: 0.5in;
}

Avoid CSS features that commonly cause problems in HTML-to-PDF conversion.

====================
FINAL QUALITY CHECK
====================

Before returning the HTML, internally verify:

1. Is every claim supported by the candidate information?
2. Is the resume specifically tailored to the job description?
3. Are the most important job-description keywords naturally represented where truthful?
4. Are the candidate's strongest relevant skills and projects prioritized?
5. Is the resume ATS-readable?
6. Are there any tables, graphics, icons, text boxes, or multi-column layouts that could hurt ATS parsing?
7. Are there any spelling or grammatical errors?
8. Are bullet points concise and achievement-oriented?
9. Is there unnecessary or repetitive information?
10. Will the resume reasonably fit within 1–2 A4 pages?
11. Is the HTML valid and directly convertible to PDF?
12. Does the resume read like it was written specifically for this candidate and this role?

Make all necessary corrections before producing the final output.

IMPORTANT:
Return ONLY the final HTML document.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],

    config: {
      responseMimeType: "application/json",

      responseJsonSchema: z.toJSONSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};
