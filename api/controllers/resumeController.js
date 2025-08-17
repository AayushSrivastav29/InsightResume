const fs = require("fs").promises;
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Resume = require("../models/resumeSchema");
const skillsData = require("../data/skillsData");
const experiencePatterns = require("../data/experienceData");
const certificationKeywords = require("../data/certificationsData");
const { GoogleGenAI } = require("@google/genai");

// Initialize OpenAI
const geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

// Helper function to extract text from different file types
const extractTextFromFile = async (filePath, mimetype) => {
  try {
    const fileBuffer = await fs.readFile(filePath);

    switch (mimetype) {
      case "application/pdf":
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;

      case "application/msword":
        // For older .doc files - basic text extraction
        return fileBuffer.toString("utf8").replace(/[^\x20-\x7E]/g, " ");

      default:
        throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error("Failed to extract text from file");
  }
};

// AI-powered resume parsing function
const parseResumeWithAI = async (resumeText) => {
  try {
    const prompt = `
You are an expert resume parser. Extract structured information from the following resume text and return it as a valid JSON object with the exact structure below. Be comprehensive and accurate.

Required JSON structure:
{
  "contactInfo": {
    "name": "Full name of the person",
    "email": "email@example.com or null if not found",
    "phone": "phone number or null if not found",
    "location": "city, state/country or null if not found",
    "linkedin": "LinkedIn profile URL or null if not found",
    "github": "GitHub profile URL or null if not found",
    "website": "Personal website URL or null if not found"
  },
  "skills": [
    "List of technical skills, programming languages, frameworks, tools, software, etc."
  ],
  "experience": [
    {
      "jobTitle": "Job title/position",
      "company": "Company name",
      "duration": "Duration (e.g., Jan 2020 - Dec 2022)",
      "location": "Work location or null",
      "achievements": ["Key achievements and responsibilities"]
    }
  ],
  "education": [
    {
      "degree": "Degree type and field",
      "institution": "School/University name",
      "graduationYear": "Year or null if not specified",
      "gpa": "GPA or null if not mentioned",
      "location": "Institution location or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained or null",
      "expiryDate": "Expiry date or null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Technologies used"],
      "duration": "Project duration or null"
    }
  ],
  "languages": ["Programming and spoken languages"],
  "summary": "Professional summary or objective (2-3 sentences)"
}

Important instructions:
1. Return ONLY valid JSON, no additional text or explanations
2. If information is not available, use null or empty array []
3. Be thorough in extracting technical skills (programming languages, frameworks, tools, databases, etc.)
4. Extract both hard skills (technical) and relevant soft skills
5. Include years of experience when mentioned
6. Extract all certifications, licenses, and professional credentials
7. If no clear sections exist, infer from context

Resume text:
${resumeText}
`;

    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
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
      generationConfig: {
        temperature: 0.1,
        max_tokens: 2000,
      },
    });

    const extractedContent =
      response.candidates[0].content.parts[0].text.trim();

    // Clean up the response to ensure it's valid JSON
    let cleanedContent = extractedContent;
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent
        .replace(/```json\n?/, "")
        .replace(/```$/, "");
    }
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/```\n?/, "").replace(/```$/, "");
    }

    const parsedData = JSON.parse(cleanedContent);

    // Transform AI response to match our schema format
    const transformedData = {
      contactInfo: parsedData.contactInfo || {},
      skills: parsedData.skills || [],
      experience:
        parsedData.experience?.map((exp) => ({
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          duration: exp.duration || "",
          location: exp.location || null,
          achievements: exp.achievements || [],
        })) || [],
      education:
        parsedData.education?.map((edu) => ({
          degree: edu.degree || "",
          institution: edu.institution || "",
          graduationYear: edu.graduationYear || null,
          gpa: edu.gpa || null,
          location: edu.location || null,
        })) || [],
      certifications:
        parsedData.certifications?.map((cert) => ({
          name: cert.name || "",
          issuer: cert.issuer || "",
          date: cert.date || null,
          expiryDate: cert.expiryDate || null,
        })) || [],
      projects: parsedData.projects || [],
      languages: parsedData.languages || [],
      summary: parsedData.summary || "",
    };

    console.log("AI extraction successful:", {
      skillsCount: transformedData.skills.length,
      experienceCount: transformedData.experience.length,
      educationCount: transformedData.education.length,
      certificationsCount: transformedData.certifications.length,
    });

    return transformedData;
  } catch (error) {
    console.error("AI parsing error:", error);
    console.error("AI response was:", error.message);

    // Fallback to manual parsing if AI fails
    console.log("Falling back to manual parsing...");
    return parseResumeDataManual(resumeText);
  }
};

// Fallback manual parsing function (original logic)
const parseResumeDataManual = (text) => {
  const extractedData = {
    contactInfo: {},
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    summary: "",
  };

  try {
    // Extract email
    const emailMatch = text.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    );
    if (emailMatch) {
      extractedData.contactInfo.email = emailMatch[0];
    }

    // Extract phone number
    const phoneMatch = text.match(
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    );
    if (phoneMatch) {
      extractedData.contactInfo.phone = phoneMatch[0];
    }

    // Extract common skills (basic keyword matching)
    const textUpper = text.toUpperCase();
    skillsData.forEach((skill) => {
      if (textUpper.includes(skill.toUpperCase())) {
        extractedData.skills.push(skill);
      }
    });

    // Extract education (basic pattern matching)
    const educationPatterns = [
      /Bachelor[^\n]*/gi,
      /Master[^\n]*/gi,
      /PhD[^\n]*/gi,
      /Doctorate[^\n]*/gi,
      /Associate[^\n]*/gi,
      /Diploma[^\n]*/gi,
      /Certificate[^\n]*/gi,
      /Vocational Training[^\n]*/gi,
      /Apprenticeship[^\n]*/gi,
      /Bootcamp[^\n]*/gi,
      /Professional Development[^\n]*/gi,
    ];

    educationPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        extractedData.education.push(
          ...matches.map((match) => ({
            degree: match,
            institution: "",
            graduationYear: null,
            gpa: null,
            location: null,
          }))
        );
      }
    });

    // Extract experience (basic pattern - look for job titles and companies)
    experiencePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        extractedData.experience.push(
          ...matches.slice(0, 10).map((match) => ({
            jobTitle: match,
            company: "",
            duration: "",
            location: null,
            achievements: [],
          }))
        );
      }
    });

    // Extract certifications
    certificationKeywords.forEach((cert) => {
      if (textUpper.includes(cert.toUpperCase())) {
        extractedData.certifications.push({
          name: cert,
          issuer: "",
          date: null,
          expiryDate: null,
        });
      }
    });
  } catch (error) {
    console.error("Manual resume parsing error:", error);
  }

  return extractedData;
};

// @route   POST api/resume/upload
// @desc    Upload and parse resume with AI
// @access  Private
const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Extract text from uploaded file
    const extractedText = await extractTextFromFile(
      req.file.path,
      req.file.mimetype
    );

    if (!extractedText || extractedText.trim().length === 0) {
      // Clean up uploaded file if text extraction fails
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from file. Please ensure the file is not corrupted.",
      });
    }

    console.log("Starting AI-powered resume parsing...");

    // Parse resume data with AI (with fallback to manual parsing)
    const extractedData = await parseResumeWithAI(extractedText);

    // FIXED: Proper data validation and cleaning
    const validatedData = {
      contactInfo: {
        name: extractedData.contactInfo?.name || null,
        email: extractedData.contactInfo?.email || null,
        phone: extractedData.contactInfo?.phone || null,
        address: extractedData.contactInfo?.address || null,
      },
      skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
      experience: Array.isArray(extractedData.experience)
        ? extractedData.experience.map((exp) => ({
            jobTitle: exp.jobTitle || "",
            company: exp.company || "",
            duration: exp.duration || "",
            location: exp.location || null,
            achievements: Array.isArray(exp.achievements)
              ? exp.achievements
              : [],
          }))
        : [],
      education: Array.isArray(extractedData.education)
        ? extractedData.education.map((edu) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            graduationYear: edu.graduationYear || null,
            gpa: edu.gpa || null,
            location: edu.location || null,
          }))
        : [],
      certifications: Array.isArray(extractedData.certifications)
        ? extractedData.certifications.map((cert) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || null,
            expiryDate: cert.expiryDate || null,
          }))
        : [],
      summary:
        typeof extractedData.summary === "string" ? extractedData.summary : "",
    };

    // Debug log to verify data structure
    console.log("Validated data structure:", {
      contactInfo: typeof validatedData.contactInfo,
      skills: Array.isArray(validatedData.skills),
      experience: Array.isArray(validatedData.experience),
      education: Array.isArray(validatedData.education),
      certifications: Array.isArray(validatedData.certifications),
      summary: typeof validatedData.summary,
    });
    // Save resume to database
    const resume = new Resume({
      userId: req.user.id,
      filename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      originalText: extractedText,
      extractedData: validatedData,
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully with AI",
      resume: {
        id: resume._id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        extractedData: resume.extractedData,
        textPreview: extractedText.substring(0, 200) + "...",
        aiParsed: true,
        extractionStats: {
          skillsExtracted: validatedData.skills.length,
          experienceCount: validatedData.experience.length,
          educationCount: validatedData.education.length,
          certificationsCount: validatedData.certifications.length,
          hasSummary: !!validatedData.summary,
          contactInfo: validatedData.contactInfo
        },
      },
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    if (
      error.message ===
      "Invalid file type. Only PDF, DOC, and DOCX files are allowed."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Resume upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during file upload and processing",
    });
  }
};

// @route   POST api/resume/:id/reparse
// @desc    Re-parse existing resume with AI
// @access  Private
const reparseResumeWithAI = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    console.log("Re-parsing resume with AI...");

    // Re-parse with AI
    const extractedData = await parseResumeWithAI(resume.originalText);

    // Update resume with new extracted data
    resume.extractedData = extractedData;
    await resume.save();

    res.json({
      success: true,
      message: "Resume re-parsed successfully with AI",
      resume: {
        id: resume._id,
        filename: resume.filename,
        extractedData: resume.extractedData,
        extractionStats: {
          skillsExtracted: extractedData.skills.length,
          experienceCount: extractedData.experience.length,
          educationCount: extractedData.education.length,
          certificationsCount: extractedData.certifications.length,
          projectsCount: extractedData.projects?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Re-parse resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while re-parsing resume",
    });
  }
};

// @route   GET api/resume/
// @desc    Get user's resumes
// @access  Private
const getUserResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Resume.countDocuments({ userId: req.user.id });

    // Get resumes with pagination
    const resumes = await Resume.find({ userId: req.user.id })
      .select("-originalText -filePath") // Exclude large text field and file path for security
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      resumes: resumes.map((resume) => ({
        id: resume._id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        uploadedAt: resume.uploadedAt,
        extractedData: resume.extractedData,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching resumes",
    });
  }
};

// @route   GET api/resume/:id
// @desc    Get specific resume by ID
// @access  Private
const getResumeByID = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      resume: {
        id: resume._id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        uploadedAt: resume.createdAt,
        extractedData: resume.extractedData,
        originalText: resume.originalText,
      },
    });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching resume",
    });
  }
};

// @route   DELETE api/resume/:id
// @desc    Delete resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Delete file from filesystem
    if (resume.filePath) {
      try {
        await fs.unlink(resume.filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting resume",
    });
  }
};

// @route   PUT api/resume/:id/update-extracted-data
// @desc    Update extracted data for a resume (manual correction)
// @access  Private
const updateExtractedData = async (req, res) => {
  try {
    const { extractedData } = req.body;

    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: "Extracted data is required",
      });
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { extractedData: extractedData },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume data updated successfully",
      resume: {
        id: resume._id,
        filename: resume.filename,
        extractedData: resume.extractedData,
      },
    });
  } catch (error) {
    console.error("Update resume data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating resume data",
    });
  }
};

module.exports = {
  updateExtractedData,
  getResumeByID,
  getUserResumes,
  deleteResume,
  uploadAndParseResume,
  reparseResumeWithAI,
};
