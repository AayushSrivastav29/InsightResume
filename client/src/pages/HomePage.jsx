import React, { useState, useContext } from 'react';
import { Upload, FileText, Zap, CheckCircle, Star, ArrowRight, Users, Target, Clock, Shield } from 'lucide-react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function HomePage() {
  const [dragActive, setDragActive] = useState(false);
  const {token} = useContext(UserContext);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Analysis",
      description: "Get instant, comprehensive feedback on your resume using advanced AI technology."
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600" />,
      title: "Job Match Score",
      description: "See how well your resume matches specific job descriptions with detailed scoring."
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Instant Results",
      description: "Upload your resume and get detailed analysis results in seconds, not hours."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes Applicant Tracking Systems with our optimization tips."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "Insight Resume helped me identify gaps in my resume I never noticed. Got 3x more interviews!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      content: "The job match score feature is incredible. I tailored my resume and landed my dream job.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      content: "Quick, accurate, and actionable feedback. This tool is a game-changer for job seekers.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <NavBar/>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Zap className="w-4 h-4 mr-1" />
                AI-Powered Resume Analysis
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Get Your Resume
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Job Match Score
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your resume and job description to get AI-powered analysis, identify gaps, 
              and improve your chances of landing interviews instantly.
            </p>
            
            {/* Upload Area */}
            <div className="max-w-2xl mx-auto mb-8">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <button onClick={()=> token ? (navigate('/upload')):(navigate('/signup'))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 mb-2"
                  >
                    Choose File
                  </button>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                500K+ analyzed
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                4.9/5 rating
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                100% secure
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Insight Resume?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive resume analysis to help you stand out in today's competitive job market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your resume analyzed in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload Resume
              </h3>
              <p className="text-gray-600 mb-4">
                Upload your resume and paste the job description you're targeting
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                2. AI Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                Our AI analyzes your resume against the job requirements in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                3. Get Results
              </h3>
              <p className="text-gray-600 mb-4">
                Receive detailed feedback, match score, and improvement suggestions
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button
            onClick={()=> token ? (navigate('/dashboard')):(navigate('/signup'))}
             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Try It Now - It's Free!
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Job Seekers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals who've improved their resumes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Improve Your Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get instant AI-powered analysis and boost your job match score today
          </p>
          <button
          onClick={()=> token ? (navigate('/analyze')):(navigate('/signup'))}
          className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
            Start Free Analysis
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </button>
          <p className="text-blue-100 mt-4 text-sm">
            No payment required • Results in seconds • 100% free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Insight Resume
              </h3>
              <p className="text-gray-300 mb-4">
                AI-powered resume analysis to help you land your dream job. 
                Get instant feedback, improve your match score, and stand out from the competition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Insight Resume. Made by Aayush Sivastav. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}