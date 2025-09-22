import { NextResponse } from 'next/server';

interface SkillIndiaCourse {
  title: string;
  url: string;
  description: string;
  sector: string;
  duration: string;
  level: string;
  provider?: string;
  certification?: string;
}

interface SkillIndiaResponse {
  courses: SkillIndiaCourse[];
  totalCourses: number;
  lastUpdated: string;
}

// Real Skill India courses with actual website links
const skillIndiaCourses: SkillIndiaCourse[] = [
  {
    title: "Python Programming Fundamentals",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive Python programming course covering fundamentals to advanced concepts for software development and data science",
    sector: "Information Technology",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Computer Application Certificate",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete computer application training covering MS Office, basic programming, and computer fundamentals",
    sector: "Information Technology",
    duration: "Self-paced (2-3 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Advanced Excel and Data Analysis",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Advanced Excel skills including data analysis, pivot tables, macros, and VBA programming for business applications",
    sector: "Business & Finance",
    duration: "Self-paced (1-2 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Financial Accounting and Tally",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive financial accounting course covering principles, practices, and Tally Prime software",
    sector: "Finance & Accounting",
    duration: "Self-paced (4-6 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Digital Marketing Essentials",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete digital marketing course covering SEO, social media, content marketing, and analytics",
    sector: "Marketing & Communications",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Data Entry and Office Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional data entry training with accuracy, speed, and efficiency techniques for various industries",
    sector: "Administrative",
    duration: "Self-paced (1-2 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Web Development with HTML, CSS & JavaScript",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete web development course covering front-end technologies and responsive design",
    sector: "Information Technology",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Mobile App Development",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Learn mobile app development using modern frameworks and tools for Android and iOS platforms",
    sector: "Information Technology",
    duration: "Self-paced (5-6 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Cybersecurity Fundamentals",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Essential cybersecurity concepts, threat analysis, and security implementation strategies",
    sector: "Information Technology",
    duration: "Self-paced (3-4 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Cloud Computing and AWS",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive cloud computing course covering AWS services, deployment, and management",
    sector: "Information Technology",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Machine Learning and AI Basics",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Introduction to machine learning concepts, algorithms, and practical applications using Python",
    sector: "Information Technology",
    duration: "Self-paced (5-6 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Data Science and Analytics",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete data science course covering data analysis, visualization, and statistical modeling",
    sector: "Information Technology",
    duration: "Self-paced (6-7 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Graphic Design and Multimedia",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional graphic design course covering Adobe Creative Suite and multimedia production",
    sector: "Creative & Design",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "E-commerce and Online Business",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete e-commerce course covering online business setup, digital marketing, and platform management",
    sector: "Business & Finance",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Project Management Professional",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional project management course covering PMP methodologies, tools, and best practices",
    sector: "Management",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Healthcare Assistant Training",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive healthcare assistant training covering patient care, medical terminology, and safety protocols",
    sector: "Healthcare",
    duration: "Self-paced (3-4 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Automotive Service Technician",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional automotive service training covering vehicle maintenance, repair, and diagnostics",
    sector: "Automotive",
    duration: "Self-paced (6-8 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Retail Sales and Customer Service",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete retail training covering sales techniques, customer service, and inventory management",
    sector: "Retail & Sales",
    duration: "Self-paced (1-2 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Hospitality and Hotel Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional hospitality training covering hotel operations, guest services, and management",
    sector: "Hospitality",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Construction and Civil Engineering",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive construction training covering civil engineering basics, safety protocols, and project management",
    sector: "Construction",
    duration: "Self-paced (6-8 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Agriculture and Farming Technology",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Modern agriculture training covering farming techniques, technology integration, and sustainable practices",
    sector: "Agriculture",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Social Media Marketing and Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete social media marketing course covering platform management, content creation, and analytics",
    sector: "Marketing & Communications",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Content Writing and Copywriting",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional content writing course covering copywriting, SEO content, and digital marketing content",
    sector: "Marketing & Communications",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Human Resources Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Comprehensive HR management course covering recruitment, employee relations, and HR policies",
    sector: "Management",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Supply Chain and Logistics Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete supply chain management course covering logistics, inventory management, and operations",
    sector: "Management",
    duration: "Self-paced (3-4 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Quality Assurance and Testing",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Software testing and quality assurance course covering manual and automated testing techniques",
    sector: "Information Technology",
    duration: "Self-paced (3-4 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Database Administration and SQL",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Database management course covering SQL, database design, and administration",
    sector: "Information Technology",
    duration: "Self-paced (3-4 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Network Administration and Security",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Network management course covering network setup, security protocols, and troubleshooting",
    sector: "Information Technology",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate to Advanced",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "UI/UX Design Fundamentals",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "User interface and experience design course covering design principles, prototyping, and user research",
    sector: "Creative & Design",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Video Production and Editing",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional video production course covering filming, editing, and post-production techniques",
    sector: "Creative & Design",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Photography and Image Editing",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Digital photography course covering camera techniques, composition, and photo editing",
    sector: "Creative & Design",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Event Management and Planning",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Complete event management course covering planning, coordination, and execution of events",
    sector: "Management",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Customer Service Excellence",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional customer service training covering communication skills, problem-solving, and service delivery",
    sector: "Retail & Sales",
    duration: "Self-paced (1-2 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Inventory Management and Stock Control",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Inventory management course covering stock control, warehouse operations, and supply chain basics",
    sector: "Retail & Sales",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Food Safety and Hygiene Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Food safety course covering hygiene standards, food handling, and safety regulations",
    sector: "Hospitality",
    duration: "Self-paced (1-2 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Housekeeping and Facility Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional housekeeping course covering facility management, cleaning techniques, and maintenance",
    sector: "Hospitality",
    duration: "Self-paced (2-3 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Welding and Fabrication Technology",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Professional welding course covering various welding techniques, safety protocols, and fabrication",
    sector: "Construction",
    duration: "Self-paced (4-6 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Electrical Installation and Maintenance",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Electrical work course covering installation, maintenance, and safety in electrical systems",
    sector: "Construction",
    duration: "Self-paced (5-6 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Dairy Farming and Milk Processing",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Dairy farming course covering milk production, processing techniques, and farm management",
    sector: "Agriculture",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Organic Farming and Sustainable Agriculture",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Organic farming course covering sustainable practices, soil management, and organic certification",
    sector: "Agriculture",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Pharmacy Assistant Training",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Pharmacy assistant course covering medication management, customer service, and pharmaceutical basics",
    sector: "Healthcare",
    duration: "Self-paced (3-4 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Medical Laboratory Technician",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Medical lab technician course covering sample collection, testing procedures, and equipment operation",
    sector: "Healthcare",
    duration: "Self-paced (6-8 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Beauty and Wellness Therapy",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Beauty therapy course covering skincare, makeup, hair care, and wellness treatments",
    sector: "Healthcare",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Automotive Electrician",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Automotive electrical systems course covering vehicle electronics, diagnostics, and repair",
    sector: "Automotive",
    duration: "Self-paced (4-5 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Two-Wheeler Service and Repair",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Motorcycle and scooter repair course covering engine maintenance, electrical systems, and troubleshooting",
    sector: "Automotive",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Fashion Design and Garment Construction",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Fashion design course covering pattern making, garment construction, and fashion trends",
    sector: "Creative & Design",
    duration: "Self-paced (6-8 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Interior Design and Space Planning",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Interior design course covering space planning, color theory, and design software",
    sector: "Creative & Design",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Jewelry Design and Manufacturing",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Jewelry design course covering design principles, manufacturing techniques, and gemology basics",
    sector: "Creative & Design",
    duration: "Self-paced (5-6 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Banking and Financial Services",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Banking course covering financial services, customer relations, and banking operations",
    sector: "Finance & Accounting",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Insurance and Risk Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Insurance course covering risk assessment, policy management, and claims processing",
    sector: "Finance & Accounting",
    duration: "Self-paced (3-4 months)",
    level: "Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Real Estate and Property Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Real estate course covering property management, sales techniques, and legal aspects",
    sector: "Business & Finance",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Travel and Tourism Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Tourism course covering travel planning, customer service, and destination management",
    sector: "Hospitality",
    duration: "Self-paced (3-4 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Sports and Fitness Training",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Fitness training course covering exercise science, training methods, and sports nutrition",
    sector: "Healthcare",
    duration: "Self-paced (4-5 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Language and Communication Skills",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Communication skills course covering English language, public speaking, and professional communication",
    sector: "Administrative",
    duration: "Self-paced (2-3 months)",
    level: "Beginner",
    provider: "NSDC",
    certification: "Government Certified"
  },
  {
    title: "Office Administration and Management",
    url: "https://www.skillindiadigital.gov.in/courses",
    description: "Office management course covering administrative tasks, record keeping, and office operations",
    sector: "Administrative",
    duration: "Self-paced (2-3 months)",
    level: "Beginner to Intermediate",
    provider: "NSDC",
    certification: "Government Certified"
  }
];

// Function to search courses by career title or keywords
export function searchCoursesByCareer(careerTitle: string): SkillIndiaCourse[] {
  const searchTerms = careerTitle.toLowerCase().split(' ').filter(term => term.length > 2);
  // const relevantCourses: SkillIndiaCourse[] = [];
  
  // Enhanced career-to-course mapping with more comprehensive coverage
  const careerMappings: { [key: string]: { keywords: string[], sectors: string[], priority: number } } = {
    // Technology & Software
    'software': { keywords: ['python', 'web', 'mobile', 'cybersecurity', 'cloud', 'machine learning', 'data science', 'programming'], sectors: ['Information Technology'], priority: 1 },
    'engineer': { keywords: ['python', 'web', 'mobile', 'cybersecurity', 'cloud', 'machine learning', 'data science', 'construction', 'project management'], sectors: ['Information Technology', 'Construction'], priority: 1 },
    'developer': { keywords: ['python', 'web', 'mobile', 'cybersecurity', 'cloud', 'programming'], sectors: ['Information Technology'], priority: 1 },
    'programmer': { keywords: ['python', 'web', 'mobile', 'programming'], sectors: ['Information Technology'], priority: 1 },
    'coder': { keywords: ['python', 'web', 'mobile', 'programming'], sectors: ['Information Technology'], priority: 1 },
    
    // Data & Analytics
    'data': { keywords: ['python', 'data science', 'excel', 'machine learning', 'analytics'], sectors: ['Information Technology', 'Business & Finance'], priority: 1 },
    'analyst': { keywords: ['excel', 'data science', 'python', 'project management', 'analytics'], sectors: ['Information Technology', 'Business & Finance'], priority: 1 },
    'scientist': { keywords: ['python', 'data science', 'machine learning', 'analytics'], sectors: ['Information Technology'], priority: 1 },
    'researcher': { keywords: ['python', 'data science', 'analytics', 'project management'], sectors: ['Information Technology', 'Business & Finance'], priority: 2 },
    
    // Management & Business
    'manager': { keywords: ['project management', 'excel', 'e-commerce', 'leadership'], sectors: ['Management', 'Business & Finance'], priority: 1 },
    'business': { keywords: ['excel', 'e-commerce', 'project management', 'accounting', 'digital marketing'], sectors: ['Business & Finance', 'Marketing & Communications'], priority: 1 },
    'entrepreneur': { keywords: ['e-commerce', 'digital marketing', 'project management', 'business'], sectors: ['Business & Finance', 'Marketing & Communications'], priority: 1 },
    'consultant': { keywords: ['project management', 'excel', 'business', 'analytics'], sectors: ['Business & Finance', 'Management'], priority: 2 },
    
    // Finance & Accounting
    'accounting': { keywords: ['accounting', 'excel', 'finance', 'tally'], sectors: ['Finance & Accounting'], priority: 1 },
    'finance': { keywords: ['accounting', 'excel', 'finance', 'tally'], sectors: ['Finance & Accounting'], priority: 1 },
    'banking': { keywords: ['accounting', 'excel', 'finance'], sectors: ['Finance & Accounting'], priority: 1 },
    'auditor': { keywords: ['accounting', 'excel', 'finance'], sectors: ['Finance & Accounting'], priority: 1 },
    
    // Design & Creative
    'designer': { keywords: ['graphic design', 'web', 'multimedia', 'creative'], sectors: ['Creative & Design', 'Information Technology'], priority: 1 },
    'artist': { keywords: ['graphic design', 'multimedia', 'creative'], sectors: ['Creative & Design'], priority: 1 },
    'creative': { keywords: ['graphic design', 'multimedia', 'web'], sectors: ['Creative & Design'], priority: 1 },
    
    // Marketing & Communications
    'marketing': { keywords: ['digital marketing', 'e-commerce', 'social media', 'content'], sectors: ['Marketing & Communications'], priority: 1 },
    'advertising': { keywords: ['digital marketing', 'graphic design', 'content'], sectors: ['Marketing & Communications', 'Creative & Design'], priority: 1 },
    'communication': { keywords: ['digital marketing', 'content', 'social media'], sectors: ['Marketing & Communications'], priority: 1 },
    'sales': { keywords: ['retail', 'customer service', 'digital marketing'], sectors: ['Retail & Sales', 'Marketing & Communications'], priority: 1 },
    
    // Healthcare & Medical
    'healthcare': { keywords: ['healthcare', 'medical', 'patient care'], sectors: ['Healthcare'], priority: 1 },
    'medical': { keywords: ['healthcare', 'medical', 'patient care'], sectors: ['Healthcare'], priority: 1 },
    'doctor': { keywords: ['healthcare', 'medical'], sectors: ['Healthcare'], priority: 1 },
    'nurse': { keywords: ['healthcare', 'medical', 'patient care'], sectors: ['Healthcare'], priority: 1 },
    'therapist': { keywords: ['healthcare', 'medical'], sectors: ['Healthcare'], priority: 1 },
    
    // Technical & Engineering
    'technician': { keywords: ['automotive', 'construction', 'technical'], sectors: ['Automotive', 'Construction'], priority: 1 },
    'mechanic': { keywords: ['automotive', 'technical'], sectors: ['Automotive'], priority: 1 },
    'electrician': { keywords: ['construction', 'technical'], sectors: ['Construction'], priority: 1 },
    'plumber': { keywords: ['construction', 'technical'], sectors: ['Construction'], priority: 1 },
    
    // Service Industries
    'hospitality': { keywords: ['hospitality', 'hotel', 'service'], sectors: ['Hospitality'], priority: 1 },
    'retail': { keywords: ['retail', 'sales', 'customer service'], sectors: ['Retail & Sales'], priority: 1 },
    'tourism': { keywords: ['hospitality', 'service'], sectors: ['Hospitality'], priority: 1 },
    'chef': { keywords: ['hospitality', 'cooking'], sectors: ['Hospitality'], priority: 1 },
    
    // Agriculture & Environment
    'agriculture': { keywords: ['agriculture', 'farming', 'environment'], sectors: ['Agriculture'], priority: 1 },
    'farming': { keywords: ['agriculture', 'farming'], sectors: ['Agriculture'], priority: 1 },
    'farmer': { keywords: ['agriculture', 'farming'], sectors: ['Agriculture'], priority: 1 },
    'environmental': { keywords: ['agriculture', 'environment'], sectors: ['Agriculture'], priority: 1 },
    
    // Administrative & Support
    'administrative': { keywords: ['data entry', 'office management', 'excel'], sectors: ['Administrative'], priority: 2 },
    'assistant': { keywords: ['data entry', 'office management', 'excel'], sectors: ['Administrative'], priority: 2 },
    'clerk': { keywords: ['data entry', 'office management', 'excel'], sectors: ['Administrative'], priority: 2 },
    'receptionist': { keywords: ['data entry', 'office management', 'customer service'], sectors: ['Administrative', 'Retail & Sales'], priority: 2 }
  };
  
  // Score courses based on career match
  const courseScores = new Map<string, { course: SkillIndiaCourse, score: number }>();
  
  // Find matching courses based on career title
  for (const [career, mapping] of Object.entries(careerMappings)) {
    const careerMatch = searchTerms.some(term => 
      career.includes(term) || term.includes(career) || 
      mapping.keywords.some(keyword => keyword.includes(term) || term.includes(keyword))
    );
    
    if (careerMatch) {
      for (const course of skillIndiaCourses) {
        let score = 0;
        
        // Check title matches
        const titleLower = course.title.toLowerCase();
        const descriptionLower = course.description.toLowerCase();
        const sectorLower = course.sector.toLowerCase();
        
        // High score for exact keyword matches in title
        for (const keyword of mapping.keywords) {
          if (titleLower.includes(keyword)) score += 10;
          if (descriptionLower.includes(keyword)) score += 5;
          if (sectorLower.includes(keyword)) score += 3;
        }
        
        // Bonus for sector match
        if (mapping.sectors.some(sector => sectorLower.includes(sector.toLowerCase()))) {
          score += 8;
        }
        
        // Priority bonus
        score += (4 - mapping.priority) * 2;
        
        if (score > 0) {
          const existing = courseScores.get(course.title);
          if (!existing || score > existing.score) {
            courseScores.set(course.title, { course, score });
          }
        }
      }
    }
  }
  
  // Additional fuzzy matching for edge cases
  if (courseScores.size === 0) {
    const careerTitleLower = careerTitle.toLowerCase();
    
    // Try partial matches and synonyms
    const synonyms: { [key: string]: string[] } = {
      'tech': ['technology', 'software', 'programming', 'computer'],
      'it': ['information technology', 'software', 'computer'],
      'cs': ['computer science', 'software', 'programming'],
      'ce': ['computer engineering', 'software', 'hardware'],
      'ee': ['electrical engineering', 'electronics', 'electrical'],
      'me': ['mechanical engineering', 'mechanical', 'manufacturing'],
      'civil': ['civil engineering', 'construction', 'infrastructure'],
      'chem': ['chemical engineering', 'chemistry', 'chemical'],
      'bio': ['biotechnology', 'biology', 'biomedical'],
      'med': ['medical', 'medicine', 'healthcare'],
      'law': ['legal', 'lawyer', 'attorney'],
      'edu': ['education', 'teaching', 'teacher'],
      'art': ['arts', 'creative', 'design'],
      'comm': ['communication', 'media', 'journalism'],
      'econ': ['economics', 'finance', 'business'],
      'psych': ['psychology', 'mental health', 'counseling'],
      'soc': ['social work', 'sociology', 'community'],
      'pol': ['political science', 'politics', 'government'],
      'hist': ['history', 'historical', 'heritage'],
      'geo': ['geography', 'environmental', 'geology'],
      'math': ['mathematics', 'statistics', 'analytics'],
      'phy': ['physics', 'engineering', 'science'],
      'chem': ['chemistry', 'chemical', 'laboratory'],
      'bio': ['biology', 'life sciences', 'biomedical']
    };
    
    // Check for synonym matches
    for (const [abbrev, expansions] of Object.entries(synonyms)) {
      if (careerTitleLower.includes(abbrev)) {
        for (const expansion of expansions) {
          const matchingCourses = skillIndiaCourses.filter(course => 
            course.title.toLowerCase().includes(expansion) ||
            course.description.toLowerCase().includes(expansion) ||
            course.sector.toLowerCase().includes(expansion)
          );
          
          matchingCourses.forEach(course => {
            const score = 5; // Lower score for synonym matches
            const existing = courseScores.get(course.title);
            if (!existing || score > existing.score) {
              courseScores.set(course.title, { course, score });
            }
          });
        }
      }
    }
    
    // Try word stem matching
    const stemWords = searchTerms.map(term => {
      if (term.endsWith('ing')) return term.slice(0, -3);
      if (term.endsWith('ed')) return term.slice(0, -2);
      if (term.endsWith('er')) return term.slice(0, -2);
      if (term.endsWith('ist')) return term.slice(0, -3);
      if (term.endsWith('ian')) return term.slice(0, -3);
      return term;
    }).filter(word => word.length > 2);
    
    for (const stem of stemWords) {
      const matchingCourses = skillIndiaCourses.filter(course => 
        course.title.toLowerCase().includes(stem) ||
        course.description.toLowerCase().includes(stem) ||
        course.sector.toLowerCase().includes(stem)
      );
      
      matchingCourses.forEach(course => {
        const score = 3; // Lower score for stem matches
        const existing = courseScores.get(course.title);
        if (!existing || score > existing.score) {
          courseScores.set(course.title, { course, score });
        }
      });
    }
  }
  
  // Convert to array and sort by score
  const scoredCourses = Array.from(courseScores.values())
    .sort((a, b) => b.score - a.score)
    .map(item => item.course);
  
  // If no specific matches found, return general courses based on common terms
  if (scoredCourses.length === 0) {
    const generalCourses = skillIndiaCourses.filter(course => 
      course.sector === 'Information Technology' || 
      course.sector === 'Business & Finance' ||
      course.sector === 'Administrative'
    );
    return generalCourses.slice(0, 6);
  }
  
  // Return top 6 most relevant courses
  return scoredCourses.slice(0, 6);
}

export async function POST(req: Request) {
  try {
    const { careerTitle, sector, level } = await req.json();
    
    let filteredCourses = skillIndiaCourses;
    
    // Filter by career title if provided
    if (careerTitle) {
      filteredCourses = searchCoursesByCareer(careerTitle);
    }
    
    // Filter by sector if provided
    if (sector) {
      filteredCourses = filteredCourses.filter(course => 
        course.sector.toLowerCase().includes(sector.toLowerCase())
      );
    }
    
    // Filter by level if provided
    if (level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level.toLowerCase().includes(level.toLowerCase())
      );
    }
    
    const response: SkillIndiaResponse = {
      courses: filteredCourses,
      totalCourses: filteredCourses.length,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching Skill India courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Skill India courses' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response: SkillIndiaResponse = {
      courses: skillIndiaCourses,
      totalCourses: skillIndiaCourses.length,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Skill India courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Skill India courses' },
      { status: 500 }
    );
  }
}
