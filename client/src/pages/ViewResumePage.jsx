import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
} from 'lucide-react';
import { UserContext } from '../UserContext';
import axios from 'axios';

const ViewResumePage = () => {
  const { token, path } = useContext(UserContext);
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/api/resume/${resumeId}`, {
          headers: {
            'Authorization': token 
          }
        });        
        const ResumeData = response.data.resume;
        console.log('ResumeData :>> ', ResumeData);
        setResume(ResumeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResume();
    }
  }, [resumeId, token, path]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 text-red-500 mx-auto mb-4">❌</div>
          <p className="text-gray-600 mb-4">Error loading resume: {error}</p>
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

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Resume not found</p>
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

  const { extractedData } = resume;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-white p-5 border-b border-gray-300 mb-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={()=>navigate(-1)}
                className="bg-transparent border-0 cursor-pointer mr-4 flex items-center hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <div>
                <h1 className="m-0 text-2xl font-bold">{resume.filename}</h1>
                <p className="mt-1 mb-0 text-gray-600 text-sm">
                  Uploaded on {formatDate(resume.uploadedAt)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5">
        
        {/* Contact Information */}
        <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
          <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
            Contact Information
          </h2>
          
          <div className="mt-4">
            <p className="mb-2"><strong>Name:</strong> {extractedData.contactInfo.name || 'Not provided'}</p>
            
            {extractedData.contactInfo.email && (
              <p className="mb-2">
                <strong>Email:</strong>
                <a 
                  href={`mailto:${extractedData.contactInfo.email}`}
                  className="text-blue-500 no-underline ml-1 hover:text-blue-600"
                >
                  {extractedData.contactInfo.email}
                </a>
              </p>
            )}
            
            {extractedData.contactInfo.phone && (
              <p className="mb-2">
                <strong>Phone:</strong>
                <a 
                  href={`tel:${extractedData.contactInfo.phone}`}
                  className="text-blue-500 no-underline ml-1 hover:text-blue-600"
                >
                  {extractedData.contactInfo.phone}
                </a>
              </p>
            )}
            
            {extractedData.contactInfo.address && (
              <p className="mb-2"><strong>Address:</strong> {extractedData.contactInfo.address}</p>
            )}
          </div>
        </div>


        {/* Professional Summary */}
        {extractedData.summary && (
          <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
            <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
              Professional Summary
            </h2>
            <p className="leading-relaxed mt-4">{extractedData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {extractedData.skills && extractedData.skills.length > 0 && (
          <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
            <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
              Technical Skills
            </h2>
            <div className="mt-4">
              {extractedData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm mr-2 mb-2"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {extractedData.experience && extractedData.experience.length > 0 && (
          <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
            <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
              Work Experience
            </h2>
            
            <div className="mt-5">
              {extractedData.experience.map((exp, index) => (
                <div key={index} className={` pl-4 ${index < extractedData.experience.length - 1 ? 'mb-6' : ''}`}>
                  <h3 className="mt-0 mb-1 text-base font-semibold">{exp.jobTitle}</h3>
                  <p className="my-1 font-bold text-gray-800">{exp.company}</p>
                  <p className="my-1 text-gray-600 text-sm">
                    {exp.duration} | {exp.location}
                  </p>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-2">
                      <h4 className="my-2 text-sm text-gray-800 font-medium">Key Achievements:</h4>
                      <ul className="ml-5 leading-relaxed">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="mb-1 text-sm">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {extractedData.education && extractedData.education.length > 0 && (
          <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
            <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
              Education
            </h2>
            
            <div className="mt-5">
              {extractedData.education.map((edu, index) => (
                <div key={index} className={` pl-4 ${index < extractedData.education.length - 1 ? 'mb-5' : ''}`}>
                  <h3 className="mt-0 mb-1 text-base font-semibold">{edu.degree}</h3>
                  <p className="my-1 font-bold text-gray-800">{edu.institution}</p>
                  <p className="my-1 text-gray-600 text-sm">
                    Graduated: {edu.graduationYear} | {edu.location}
                  </p>
                  {edu.gpa && (
                    <p className="my-1 text-sm">
                      <strong>GPA:</strong> {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {extractedData.certifications && extractedData.certifications.length > 0 && (
          <div className="bg-white p-5 mb-5 border border-gray-300 rounded">
            <h2 className="mt-0 text-lg border-b-2 border-blue-500 pb-2">
              Certifications
            </h2>
            
            <div className="mt-4">
              {extractedData.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded mb-3">
                  <div>
                    <h3 className="m-0 text-base font-medium">{cert.name}</h3>
                    {cert.issuer && (
                      <p className="m-0 text-sm text-gray-600">{cert.issuer}</p>
                    )}
                  </div>
                  {cert.date && (
                    <span className="text-sm text-gray-600">{cert.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResumePage;