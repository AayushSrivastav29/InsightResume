import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { UserContext } from '../UserContext';
import axios from 'axios';


const ViewAnalysisPage = () => {
    const {token, path}= useContext(UserContext);
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/api/analyse/detail/${analysisId}`, {
          headers: {
            'Authorization': token 
          }
        });        
        const analysisData =  response.data.analysis;
        console.log('analysisData :>> ', analysisData);
        setAnalysis(analysisData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error loading analysis: {error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Analysis not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analyses
          </button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{analysis.jobTitle}</h1>
              <div className={`px-4 py-2 rounded-full text-lg font-semibold ${getMatchColor(analysis?.matchPercentage || 0)}`}>
                {analysis?.matchPercentage || 0}% Match
              </div>
            </div>
            <p className="text-gray-600">
              Analysis created on {formatDate(analysis.createdAt)}
            </p>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Matched Skills */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Matched Skills</h2>
            </div>
            {analysis?.matchedSkills?.length > 0 ? (
              <div className="space-y-2">
                {analysis.matchedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 capitalize">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No matched skills identified</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Missing Skills</h2>
            </div>
            {analysis?.missingSkills?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analysis.missingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700 capitalize">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No missing skills identified</p>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h2>
          </div>
          {analysis?.suggestions?.length > 0 ? (
            <div className="space-y-3">
              {analysis.suggestions
                .filter(suggestion => suggestion.trim() !== '') // Filter out empty suggestions
                .map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No suggestions available</p>
          )}
        </div>

        {/* Strength & Improvement Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strength Areas */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Strength Areas</h2>
            </div>
            {analysis?.strengthAreas?.length > 0 ? (
              <div className="space-y-2">
                {analysis.strengthAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific strength areas identified</p>
            )}
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Areas for Improvement</h2>
            </div>
            {analysis?.improvementAreas?.length > 0 ? (
              <div className="space-y-2">
                {analysis.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific improvement areas identified</p>
            )}
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {analysis.jobDescription}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAnalysisPage;