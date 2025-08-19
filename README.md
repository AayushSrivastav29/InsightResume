## Insight Resume

Insight Resume  helps users upload resumes (PDF/DOC/DOCX), extracts structured data (skills, experience, education, certifications, contact info), and evaluates how well a resume matches a target job title or job description. It returns a match percentage plus tailored suggestions to improve the resume and increase ATS compatibility.

## Table of Contents

2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Architecture & Flow](#architecture--flow)
5. [Getting Started](#getting-started)

   - [Prerequisites](#prerequisites)
   - [Install](#install)
   - [Environment Variables](#environment-variables)

6. [Database Schemas (Summary)](#database-schemas-summary)
7. [API Endpoints (Summary)](#api-endpoints-summary)
8. [Resume Parsing & AI Analysis](#resume-parsing--ai-analysis)
9. [File Storage — Backblaze B2 (and S3 option)](#file-storage--backblaze-b2-and-s3-option)
10. [Scoring & Matching Algorithm](#scoring--matching-algorithm)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Recommendations](#deployment-recommendations)
13. [Future Enhancements](#future-enhancements)
14. [Contributing](#contributing)
15. [License](#license)

---

## Key Features

- Resume upload (PDF / DOC / DOCX)
- Automatic text extraction and structured parsing (skills, experience, education)
- AI-powered semantic analysis and suggestions (Gemini or other LLM)
- Job title & full job description analysis
- Match percentage + breakdown (skills, experience, education, certifications)
- Resume preview and manual corrections
- History of analyses per resume
- Secure file storage (Backblaze B2) with optional S3-compatible storage
- Scalable architecture with rate-limiting for AI calls and caching

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (document-oriented for resumes)
- **AI / NLP:** Gemini API 
- **File Processing:** multer, pdf-parse, mammoth (
- **File Storage:** Backblaze B2 (primary configured), AWS S3 compatible option
- **Authentication:** JWT, bcrypt

---

## Architecture & Flow

1. Client uploads resume via React UI (drag-and-drop or file selector).
2. Backend receives file (multer middleware) and streams to Backblaze B2 (or local/temporary storage) for persistence.
3. Resume file is parsed (pdf-parse, mammoth) and converted to text.
4. Parser extracts sections: skills, experience, education, certifications.
5. AI Analyzer (Gemini) runs a prompt-based analysis comparing extracted resume data with job title/description and returns a structured assessment.
6. Backend computes final match percentage (weighted scoring), stores analysis + metadata in MongoDB, and returns results to frontend.

---

## Getting Started

### Prerequisites

- Node.js (16+)
- npm or yarn
- MongoDB (local or Atlas)
- Gemini API key (or other LLM provider)
- Backblaze B2 account & bucket (or S3 credentials if using S3-compatible endpoint)

### Install

```bash
# clone
git clone <repo-url>
cd ai-resume-matcher

# backend
cd server
npm install

# frontend
cd ../client
npm install
```

### Environment Variables

Create a `.env` in the `server/` folder with the following keys (example):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-matcher
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

# Backblaze B2 credentials (if using official B2 SDK)
B2_APPLICATION_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=your_b2_bucket_name

# If using S3-compatible access to Backblaze B2 (optional)
S3_ENDPOINT=https://s3.<region>.backblazeb2.com
S3_ACCESS_KEY_ID=your_s3_access_key
S3_SECRET_ACCESS_KEY=your_s3_secret_key
S3_BUCKET=your_s3_bucket_name

# Other
LOG_LEVEL=info
RATE_LIMIT_REQUESTS=60
```

---

## Database Schemas (Summary)

**User**

- \_id, name, email (unique), password (hashed), role, createdAt

**Resume**

- \_id, userId, filename, storageUrl, originalText, extractedData {skills, experience, education, certifications, contactInfo}, uploadedAt

**Analysis**

- \_id, userId, resumeId, jobTitle, jobDescription, analysis {matchPercentage, matchedSkills, missingSkills, suggestions, strengths, weaknesses}, createdAt

(Full field lists / types should be defined in `api/models/`.)

---

## API Endpoints (Summary)

**Auth**

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login
- `GET /api/auth/profile` — user profile (protected)

**Resume**

- `POST /api/resume/upload` — upload & parse resume (multipart/form-data)
- `GET /api/resume/` — list user's resumes
- `GET /api/resume/:id` — get resume metadata
- `DELETE /api/resume/:id` — delete resume (and file)

**Analysis**

- `POST /api/analysis/analyze` — analyze resume vs job title (or full description)
- `GET /api/analysis/:resumeId` — get analysis history
- `POST /api/analysis/job-description` — analyze free-form job description

**Admin**

- Endpoints to view/delete users, audits, and archived data (protected by role)

---

## Resume Parsing & AI Analysis

**Parsing Steps**

1. Accept file via multer.
2. If PDF: use `pdf-parse`; if DOCX: use `mammoth` or `docx-parser`.
3. Clean extracted text, normalize whitespace, and split into heuristic sections (look for section headers like "Skills", "Experience", "Education").
4. Extract bullets, dates, company names using regex and lightweight heuristics.

**AI Analysis**

- Build a structured prompt combining parsed resume data and job title/description.
- Ask the LLM to: 1) identify matched skills, 2) list missing or weak skills, 3) suggest concise resume improvements, and 4) provide ATS-friendly keyword recommendations.
- Parse the LLM response into JSON (or a predictable structure) and compute a numeric match percentage.

**Prompting tip**: Keep prompts deterministic and request JSON output from the model to reduce parsing errors.

---

**Notes**

- When deleting a resume, remove both the DB entry and the file in B2/S3.
- Consider lifecycle rules: auto-archive older resumes (e.g., move to cold storage or set lifecycle to delete after X months) to manage costs.

---

## Scoring & Matching Algorithm

A recommended weighted scoring example (configurable):

- Skills match — 40%
- Experience level — 30%
- Education — 20%
- Additional factors (certifications, ATS formatting) — 10%

**High-level approach**

1. Extract `requiredSkills` from job description.
2. Compute skill overlap and assign relevance weights (e.g., exact matches > synonyms > related skills).
3. Normalize experience (years) and compare with job's required years.
4. Score education/certification matches.
5. Aggregate into final score and round to integer percent.

Provide breakdowns on the UI so users can see which area affected their score.

---

## Testing Strategy

- Unit tests for parser functions and matching algorithms (Jest).
- Integration tests for file upload pipeline and AI calls (mock Gemini during CI).
- End-to-end tests for major flows (Cypress or Playwright).
- Manual user testing with varied resume formats and job descriptions.

---

## Deployment Recommendations

- Host frontend on Vercel/Netlify.
- Host backend on Render/Railway/DigitalOcean App Platform or a container host.
- Use MongoDB Atlas for production DB.
- Store secrets in the hosting provider's secret manager.
- Implement rate-limiting and caching for AI calls (e.g., Redis) to control costs.
- Configure logging and alerting (Sentry / LogDNA).

---

## Future Enhancements

- Multi-language resume parsing
- LinkedIn profile import & analysis
- Interview prep & question suggestions
- Salary insights & job market trends
- Video resume analysis
- Analytics dashboard for admin

---

## Contributing

1. Fork the repo
2. Create a feature branch `feat/your-feature`
3. Submit PR with clear description and tests

---

## License

MIT © Aayush Srivastav

---
