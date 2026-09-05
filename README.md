# AI INTERVIEW PLANNER

## Features
- User registration and login
- JWT-based authentication
- Resume upload
- AI-generated interview reports
- Technical and behavioral questions
- Skill gap analysis
- Interview preparation plan
- Interview report PDF generation using Puppeteer
- User-specific interview reports

## Installation & Setup
Steps to clone, install dependencies, configure `.env`, and run frontend/backend.

## Environment Variables
List the required variables, without exposing actual secrets.

## How to run
cd Backend - in one terminal
cd Frontent - in another terminal
npm run dev (in both the terminals)

## Run the backend with Docker
From the `Backend` directory, build the image and pass the local environment file at runtime:

```powershell
docker build -t genai-project .
docker run --env-file .env -p 3000:3000 genai-project
```

The `.env` file must define `MONGO_URI`, `JWT_SECRET`, and `REDIS_URL`. Do not copy it into the image or commit it to source control.
