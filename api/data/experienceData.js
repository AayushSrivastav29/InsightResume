const experiencePatterns = [
  
  // e.g. "Senior , "Lead , "Junior"
  /\b(?:Senior|Staff|Lead|Principal|Junior|Jr\.?|Associate|Head|VP|Director|Chief|Intern)\b[\s\-:,]*\b(?:Software Engineer|Software Developer|Developer|Engineer|Data Scientist|Data Engineer|Data Analyst|Product Manager|Project Manager|Program Manager|Business Analyst|QA Engineer|Quality Assurance Engineer|SDET|Test Engineer|UX Designer|UI Designer|Graphic Designer|System Administrator|DevOps Engineer|SRE|Site Reliability Engineer|Network Engineer|Database Administrator|DBA|Security Engineer|Cloud Engineer|Full[- ]Stack Developer|Frontend Developer|Backend Developer|Mobile Developer|iOS Developer|Android Developer|Firmware Engineer|Embedded Engineer|Research Assistant|Teaching Assistant|Consultant|Designer|Architect|Analyst)\b[^\n]*/gi,

  // titles without seniority 
  /\b(?:Software Engineer|Software Developer|Developer|Engineer|Data Scientist|Data Analyst|Product Manager|Project Manager|Business Analyst|QA Engineer|DevOps Engineer|Designer|Architect|Consultant|Analyst|Administrator|Intern|Volunteer)\b[^\n]*/gi,

  // e.g. "January 2018 - Present", "Jan 2018 – Apr 2020"
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\s*[–—-]\s*(?:Present|Current|Now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4})/gi,

  // "Month YYYY to Month YYYY" and "from Month YYYY to Month YYYY"
  /\b(?:from\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\s+(?:to|[-–—])\s+(?:Present|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4})/gi,

  // YYYY - YYYY or YYYY to Present
  /\b(?:19|20)\d{2}\s*(?:to|[-–—])\s*(?:Present|(?:19|20)\d{2})\b/gi,

  // MM/YYYY - MM/YYYY or MM-YYYY formats e.g. "05/2019 - 08/2021"
  /\b(?:0?[1-9]|1[0-2])\/\d{4}\s*[–—-]\s*(?:Present|(?:0?[1-9]|1[0-2])\/\d{4})/gi,

  // Month YYYY single occurrences (start or end months)
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\b/gi,

  // "since YEAR" or "since Month YYYY"
  /\bsince\s+(?:\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4})\b/gi,

  // "Started in 2019", "joined in 2015"
  /\b(?:started|joined|employed|hired)\s+(?:in\s+)?(?:19|20)\d{2}\b/gi,

  // ------------ DURATION PHRASES ------------
  // e.g. "5 years experience", "3+ yrs experience", "Experience: 8 years"
  /\b\d+(\.\d+)?\+?\s*(?:years|yrs|year)\s+(?:of\s+)?experience\b/gi,
  /\bExperience\s*[:\-]\s*\d+(\.\d+)?\s*(?:years|yrs)\b/gi,

  // "Worked as X for Y years"
  /\bworked\s+as\s+[A-Za-z0-9\-\s\/&,.()]{1,60}\s+for\s+\d+\s+(?:years|yrs)\b/gi,

  // ------------ EMPLOYMENT TYPE ------------
  /\b(?:Full[- ]time|Part[- ]time|Contract|Temporary|Internship|Intern|Freelance|Consultant|Sabbatical|Volunteer|Seasonal)\b/gi,
]

module.exports=experiencePatterns;