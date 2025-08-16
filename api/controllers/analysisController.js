const Resume = require("../models/resumeSchema");
const JobAnalysis = require('../models/jobAnalysisSchema');
const skillsData = require('../data/skillsData')
const experiencePatterns = require("../data/experienceData");
const certificationKeywords = require("../data/certificationsData");
const  { GoogleGenAI } = require("@google/genai");

// Initialize OpenAI
const geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

// Helper function to extract skills and requirements from job description
const parseJobRequirements = async(jobText) => {
  let requirements = {
    skills: [],
    experience: [],
    education: [],
    certifications:[],
    keywords: []
  };

  const jobUpper = jobText.toUpperCase();

  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a job description parser. Extract structured JSON only with keys: skills (array), experience (array), education (array), certifications (array), keywords (array). Do not include explanations or text outside JSON.",
        },
        {
          role: "user",
          content: jobText,
        },
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const parsed = JSON.parse(response.candidates[0].content[0].text);

    requirements= {
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      education: parsed.education || [],
      certifications: parsed.certifications || [],
      keywords: parsed.keywords || [],
    };

    return requirements;

  } catch (error) {
    console.log("Parsing manually details from job title+ description ->", error.message);

  // Extract technical skills
  skillsData.forEach(skill => {
    if (jobUpper.includes(skill.toUpperCase())) {
      requirements.skills.push(skill);
    }
  });


  // Extract experience requirements
  experiencePatterns.forEach(pattern => {
    const matches = jobText.match(pattern);
    if (matches) {
      requirements.experience.push(...matches);
    }
  });

  
  // Extract certifications requirements
  certificationKeywords.forEach(pattern => {
    const matches = jobText.match(pattern);
    if (matches) {
      requirements.certifications.push(...matches);
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

  educationPatterns.forEach(pattern => {
    const matches = jobText.match(pattern);
    if (matches) {
      requirements.education.push(...matches);
    }
  });

  // Extract important keywords (common job-related terms)
  const importantKeywords = [
    'develop', 'design', 'implement', 'maintain', 'optimize', 'debug',
    'test', 'deploy', 'monitor', 'architect', 'scale', 'integrate',
    'collaborate', 'lead', 'manage', 'analyze', 'research', 'innovate'
  ];

  importantKeywords.forEach(keyword => {
    if (jobUpper.includes(keyword.toUpperCase())) {
      requirements.keywords.push(keyword);
    }
  });

  return requirements;
  }
};

// Helper function to calculate match percentage and analysis
const analyzeResumeMatch = (resumeData, jobRequirements, jobTitle) => {
  const analysis = {
    matchPercentage: 0,
    matchedSkills: [],
    missingSkills: [],
    suggestions: [],
    strengthAreas: [],
    improvementAreas: [],
    score: {
      skills: 0,
      experience: 0,
      education: 0,
      overall: 0
    }
  };

  // Skills matching (40% weight)
  const resumeSkills = resumeData.extractedData.skills.map(skill => skill.toLowerCase());
  const requiredSkills = jobRequirements.skills.map(skill => skill.toLowerCase());
  
  const matchedSkills = resumeSkills.filter(skill => 
    requiredSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
  );

  const missingSkills = requiredSkills.filter(reqSkill => 
    !resumeSkills.some(skill => skill.includes(reqSkill) || reqSkill.includes(skill))
  );

  analysis.matchedSkills = matchedSkills;
  analysis.missingSkills = missingSkills.slice(0, 10); // Limit to top 10 missing skills

  if (requiredSkills.length > 0) {
    analysis.score.skills = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  } else {
    analysis.score.skills = 100; // If no specific skills required, full score
  }

  // Experience matching (30% weight)
  const hasExperience = resumeData.extractedData.experience.length > 0;
  analysis.score.experience = hasExperience ? 85 : 60; // Basic scoring

  // Education matching (20% weight)  
  const hasEducation = resumeData.extractedData.education.length > 0;
  const educationMatch = jobRequirements.education.some(req => 
    resumeData.extractedData.education.some(edu => 
      edu.toLowerCase().includes(req.toLowerCase().split(' ')[0])
    )
  );
  
  if (educationMatch) {
    analysis.score.education = 100;
  } else if (hasEducation) {
    analysis.score.education = 75;
  } else {
    analysis.score.education = 50;
  }

  // Calculate overall match percentage
  analysis.score.overall = Math.round(
    (analysis.score.skills * 0.4) + 
    (analysis.score.experience * 0.3) + 
    (analysis.score.education * 0.2) + 
    (10) // 10% base score for having a resume
  );

  analysis.matchPercentage = analysis.score.overall;

  // Generate suggestions based on analysis
  if (analysis.missingSkills.length > 0) {
    analysis.suggestions.push(
      `Consider learning these in-demand skills: ${analysis.missingSkills.slice(0, 5).join(', ')}`
    );
  }

  if (analysis.score.experience < 70) {
    analysis.suggestions.push(
      'Highlight more specific work experience and achievements in your resume'
    );
  }

  if (analysis.score.skills > 80) {
    analysis.strengthAreas.push('Strong technical skill set matching job requirements');
  }

  if (analysis.score.experience > 80) {
    analysis.strengthAreas.push('Relevant work experience');
  }

  if (analysis.score.education > 80) {
    analysis.strengthAreas.push('Educational background aligns with requirements');
  }

  // Improvement areas
  if (analysis.score.skills < 60) {
    analysis.improvementAreas.push('Technical skills need enhancement');
  }

  if (analysis.score.experience < 60) {
    analysis.improvementAreas.push('More relevant work experience needed');
  }

  // Job-specific suggestions
  const jobTitleLower = jobTitle.toLowerCase();
  if (jobTitleLower.includes('frontend') || jobTitleLower.includes('ui')) {
    analysis.suggestions.push('Focus on frontend technologies like React, Vue, or Angular');
  } else if (jobTitleLower.includes('backend') || jobTitleLower.includes('api')) {
    analysis.suggestions.push('Emphasize backend technologies and API development experience');
  } else if (jobTitleLower.includes('fullstack') || jobTitleLower.includes('full stack')) {
    analysis.suggestions.push('Showcase both frontend and backend development skills');
  }

  return analysis;
};


// @route   POST api/analysis/job-description
// @desc    Analyze against title + job description
// @access  Private
const analyseResume=async (req, res) => {
  try {
    const { resumeId, jobTitle, jobDescription } = req.body;

    // Validation
    if (!resumeId || !jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID, job title, and job description are required'
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide a detailed job description.'
      });
    }

    // Get resume data
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Parse job requirements from full description
    const jobRequirements = await parseJobRequirements(`${jobTitle} ${jobDescription}`);

    // Perform detailed analysis
    const analysisResult = analyzeResumeMatch(resume, jobRequirements, jobTitle);

    // Enhanced suggestions for full job description analysis
    analysisResult.suggestions.push(
      'Customize your resume to include keywords from the job description',
      'Quantify your achievements with specific numbers and metrics',
      'Tailor your professional summary to match the job requirements'
    );

    // Save detailed analysis to database
    const analysis = new JobAnalysis({
      userId: req.user.id,
      resumeId: resumeId,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      analysis: analysisResult
    });

    await analysis.save();

    res.json({
      success: true,
      message: 'Detailed resume analysis completed successfully',
      analysis: {
        id: analysis._id,
        jobTitle: analysis.jobTitle,
        matchPercentage: analysisResult.matchPercentage,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
        suggestions: analysisResult.suggestions,
        strengthAreas: analysisResult.strengthAreas,
        improvementAreas: analysisResult.improvementAreas,
        score: analysisResult.score,
        jobRequirements: jobRequirements,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    console.error('Job description analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during detailed resume analysis'
    });
  }
};

// @route   GET api/analysis/:resumeId
// @desc    Get analysis history for a specific resume
// @access  Private

const getAnalysisHistory= async (req, res) => {
  try {
    const { resumeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify resume belongs to user
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.id
    }).select('filename');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Get total count for pagination
    const totalCount = await JobAnalysis.countDocuments({
      resumeId: resumeId,
      userId: req.user.id
    });

    // Get analysis history
    const analyses = await JobAnalysis.find({
      resumeId: resumeId,
      userId: req.user.id
    })
    .select('-userId') // Exclude userId from response
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      resume: {
        id: resume._id,
        filename: resume.filename
      },
      analyses: analyses.map(analysis => ({
        id: analysis._id,
        jobTitle: analysis.jobTitle,
        matchPercentage: analysis.analysis.matchPercentage,
        createdAt: analysis.createdAt,
        summary: {
          matchedSkills: analysis.analysis.matchedSkills.length,
          missingSkills: analysis.analysis.missingSkills.length,
          suggestions: analysis.analysis.suggestions.length
        }
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analysis history'
    });
  }
};

// @route   GET api/analysis/detail/:analysisId
// @desc    Get detailed analysis by ID
// @access  Private

const getAnalysisHistoryById= async (req, res) => {
  try {
    const analysis = await JobAnalysis.findOne({
      _id: req.params.analysisId,
      userId: req.user.id
    }).populate('resumeId', 'filename');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'JobAnalysis not found'
      });
    }

    res.json({
      success: true,
      analysis: {
        id: analysis._id,
        jobTitle: analysis.jobTitle,
        jobDescription: analysis.jobDescription,
        resume: {
          id: analysis.resumeId._id,
          filename: analysis.resumeId.filename
        },
        matchPercentage: analysis.analysis.matchPercentage,
        matchedSkills: analysis.analysis.matchedSkills,
        missingSkills: analysis.analysis.missingSkills,
        suggestions: analysis.analysis.suggestions,
        strengthAreas: analysis.analysis.strengthAreas,
        improvementAreas: analysis.analysis.improvementAreas,
        score: analysis.analysis.score,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    console.error('Get analysis detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analysis details'
    });
  }
};

// @route   DELETE api/analysis/:analysisId
// @desc    Delete analysis
// @access  Private
const deleteAnalysis= async (req, res) => {
  try {
    const analysis = await JobAnalysis.findOneAndDelete({
      _id: req.params.analysisId,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'JobAnalysis not found'
      });
    }

    res.json({
      success: true,
      message: 'JobAnalysis deleted successfully'
    });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting analysis'
    });
  }
};

module.exports = {
    deleteAnalysis,
    getAnalysisHistoryById,
    getAnalysisHistory,
    analyseResume
};