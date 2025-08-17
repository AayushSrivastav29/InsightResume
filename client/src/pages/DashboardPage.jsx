import React, { useState, useEffect, useContext } from 'react';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  History, 
  Plus, 
  Search,
  ChevronRight,
  Calendar,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import axios from 'axios';

export default function DashboardPage() {
  const { user, token, path, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    averageScore: 0,
    lastAnalysis: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's resumes
      const resumesResponse = await axios.get(`${path}/api/resume/`, {
        headers: { Authorization: `${token}` }
      });
      
      // Fetch recent analyses
      const analysesResponse = await axios.get(`${path}/api/analyse/recent`, {
        headers: { Authorization: `${token}` }
      });
      
      setResumes(resumesResponse.data.resumes || []);
      setAnalyses(analysesResponse.data.analyses || []);
      
      // Calculate stats
      const totalResumes = resumesResponse.data.resumes?.length || 0;
      const totalAnalyses = analysesResponse.data.analyses?.length || 0;
      const averageScore = analysesResponse.data.analyses?.length > 0 
        ? analysesResponse.data.analyses.reduce((acc, analysis) => 
            acc + (analysis.analysis?.matchPercentage || 0), 0) / analysesResponse.data.analyses.length
        : 0;
      
      setStats({
        totalResumes,
        totalAnalyses,
        averageScore: Math.round(averageScore),
        lastAnalysis: analysesResponse.data.analyses?.[0] || null
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`${path}/api/resume/delete/${resumeId}`, {
          headers: { Authorization: `${token}` }
        });
        setResumes(resumes.filter(resume => resume._id !== resumeId));
      } catch (error) {
        console.error('Error deleting resume:', error);
        alert('Failed to delete resume');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your resumes and track your job matching progress
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analyses Done</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Analysis</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastAnalysis ? formatDate(stats.lastAnalysis.createdAt) : 'None yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Resumes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Resumes</h2>
                <button 
                  onClick={() => navigate('/upload')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New
                </button>
              </div>
            </div>
            <div className="p-6">
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No resumes uploaded yet</p>
                  <p className="text-sm text-gray-500">Upload your first resume to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.slice(0, 3).map((resume) => (
                    <div key={resume._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{resume.filename}</h3>
                          <p className="text-sm text-gray-600">
                            Uploaded {formatDate(resume.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteResume(resume._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {resumes.length > 3 && (
                    <div className="text-center pt-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center mx-auto">
                        View all resumes
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Analyses</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analyses yet</p>
                  <p className="text-sm text-gray-500">Analyze your resume against a job description</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.slice(0, 3).map((analysis) => (
                    <div key={analysis._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {analysis.jobTitle}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysis.analysis?.matchPercentage >= 80 
                            ? 'bg-green-100 text-green-800'
                            : analysis.analysis?.matchPercentage >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {analysis.analysis?.matchPercentage || 0}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to analyze your resume?</h2>
            <p className="text-blue-100 mb-6">
              Upload a resume and job description to get instant AI-powered feedback
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/upload')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Upload Resume
              </button>
              <button 
                onClick={() => navigate('/analyze')}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
              >
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}