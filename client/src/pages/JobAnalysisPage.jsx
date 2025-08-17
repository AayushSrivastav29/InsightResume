import React, { useState, useEffect, useContext } from "react";
import {
  Search,
  Upload,
  FileText,
  Target,
  Loader,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import axios from "axios";

export default function JobAnalysisPage() {
  const { token, path } = useContext(UserContext);
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${path}/api/resume/`, {
        headers: { Authorization: `${token}` },
      });
      setResumes(response.data.resumes || []);
      if (response.data.resumes && response.data.resumes.length > 0) {
        setSelectedResume(response.data.resumes[0]._id);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleAnalyze = async (e) => {
     if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedResume || !jobTitle.trim()) {
      setError("Please select a resume and enter a job title");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await axios.post(
        `${path}/api/analyse/analyze`,
        {
          resumeId: selectedResume,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        },
        {
          headers: { Authorization: `${token}` },
        }
      );

      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error.response?.data?.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreRing = (score) => {
    if (score >= 80) return "stroke-green-600";
    if (score >= 60) return "stroke-yellow-600";
    return "stroke-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Job Match Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Analyze how well your resume matches a specific job opportunity
            </p>
          </div>

          {!analysisResult ? (
            /* Analysis Form */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Resume Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Select Resume
                    </label>
                    {resumes.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No resumes found</p>
                        <button
                          onClick={() => navigate("/upload")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Upload Resume
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resumes.map((resume) => (
                          <div
                            key={resume._id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedResume === resume._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedResume(resume._id)}
                          >
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-gray-600 mr-3" />
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {resume.filename}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Uploaded{" "}
                                  {new Date(
                                    resume.uploadedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-medium text-blue-900 mb-3">
                      Analysis Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        Be specific with job titles for better results
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        Include full job descriptions when available
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        Analysis takes 10-30 seconds to complete
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Column - Job Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Software Engineer, Marketing Manager"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Job Description (Optional but Recommended)
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description here for more accurate analysis..."
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Including the full job description provides more detailed
                      and accurate analysis
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Analyze Button */}
                  <form onSubmit={(e)=>handleAnalyze(e)}>
                  <button
                    disabled={analyzing || !selectedResume || !jobTitle.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    {analyzing ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2" />
                        Analyze Match
                      </>
                    )}
                  </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-8">
              {/* Header with Score */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {jobTitle}
                    </h2>
                    <p className="text-gray-600">Match Analysis Results</p>
                  </div>
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      setJobTitle("");
                      setJobDescription("");
                      setError("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    New Analysis
                  </button>
                </div>

                {/* Score Circle */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${
                          (analysisResult.analysis?.matchPercentage || 0) * 3.52
                        } 352`}
                        className={getScoreRing(
                          analysisResult.analysis?.matchPercentage || 0
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {analysisResult.analysis?.matchPercentage || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-center p-4 rounded-lg ${getScoreColor(
                    analysisResult.analysis?.matchPercentage || 0
                  )}`}
                >
                  <p className="font-semibold">
                    {(analysisResult.analysis?.matchPercentage || 0) >= 80
                      ? "Excellent Match! You're a strong candidate for this role."
                      : (analysisResult.analysis?.matchPercentage || 0) >= 60
                      ? "Good Match! Some areas could be improved."
                      : "Needs Improvement. Consider enhancing your resume."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Matched Skills */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Matched Skills
                    </h3>
                  </div>
                  {analysisResult.analysis?.matchedSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.analysis.matchedSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No matched skills identified
                    </p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Missing Skills
                    </h3>
                  </div>
                  {analysisResult.analysis?.missingSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.analysis.missingSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      Great! No critical skills missing
                    </p>
                  )}
                </div>

                {/* Strength Areas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Strength Areas
                    </h3>
                  </div>
                  {analysisResult.analysis?.strengthAreas?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult.analysis.strengthAreas.map(
                        (strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Analyzing your strengths...</p>
                  )}
                </div>

                {/* Improvement Areas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <BookOpen className="w-6 h-6 text-orange-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Improvement Areas
                    </h3>
                  </div>
                  {analysisResult.analysis?.improvementAreas?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult.analysis.improvementAreas.map(
                        (area, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{area}</span>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-600">Your resume looks great!</p>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">
                    AI Suggestions
                  </h3>
                </div>
                {analysisResult.analysis?.suggestions?.length > 0 ? (
                  <div className="space-y-4">
                    {analysisResult.analysis.suggestions.map(
                      (suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <p className="text-gray-700">{suggestion}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No specific suggestions at this time
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Download Report
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Save Analysis
                </button>
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setJobTitle("");
                    setJobDescription("");
                    setError("");
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
