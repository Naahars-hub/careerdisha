import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import mockResources from './mock-resources.json';

// Set to 'false' to use the real Gemini API.
const useMockData = false;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  if (useMockData) {
    console.log("Serving mock career resources.");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return NextResponse.json(mockResources);
  }

  try {
    const { careerTitle } = await req.json();
    if (!careerTitle) {
      return NextResponse.json(
        { error: "Career title is required." },
        { status: 400 }
      );
    }

    // Import and use the course search function directly instead of making HTTP call
    let skillIndiaCourses = [];
    try {
      // Import the course search function directly
      const { searchCoursesByCareer } = await import('../skillIndiaCourses/route');
      
      // Use the function directly instead of making an HTTP call
      skillIndiaCourses = searchCoursesByCareer(careerTitle);
    } catch (error) {
      console.error('Error fetching Skill India courses:', error);
      // Continue without Skill India courses if there's an error
    }

    // Validate GEMINI_API_KEY
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const prompt = `
      For the career path of "${careerTitle}" in India, provide structured and accurate resources for a student. 
      
      IMPORTANT:
      - Respond ONLY with a valid JSON object (no markdown, no explanation).
      - Stick EXACTLY to the schema below.
      - Use realistic recent data where possible. If exact figures are not available, provide reasonable estimates and clearly label them.
      - PRIORITIZE Skill India Digital (https://www.skillindiadigital.gov.in/home) as the primary resource platform for all career paths.
      - Always include relevant Skill India Digital courses, tools, and resources that match the career path.
      
      AVAILABLE SKILL INDIA COURSES FOR THIS CAREER:
      ${JSON.stringify(skillIndiaCourses, null, 2)}
      
      Use these specific courses in your response, adapting them to match the career path exactly.

      SCHEMA:
      {
        "youtube": [ "https://youtube.com/watch?v=...", "https://youtube.com/watch?v=..." ],
        "links": [ "https://www.geeksforgeeks.org/...", "https://www.coursera.org/...", "https://www.edx.org/...", "https://www.udemy.com/..." ],
        "skillIndiaDigital": {
          "platform": "https://www.skillindiadigital.gov.in/",
          "courses": [
            {
              "title": "Course Name",
              "url": "https://www.skillindiadigital.gov.in/course/[specific-course-id]",
              "description": "Brief description of the course",
              "sector": "Relevant sector",
              "duration": "Self-paced or specific duration",
              "level": "Beginner | Intermediate | Advanced"
            }
          ],
          "tools": [
            {
              "name": "Tool Name",
              "url": "https://studio.skillindiadigital.gov.in/",
              "description": "Brief description of the tool",
              "features": ["Feature 1", "Feature 2"]
            }
          ],
          "benefits": [
            "Free access to industry-relevant courses",
            "Self-paced learning with flexible schedules",
            "Certification upon course completion",
            "Industry-recognized credentials"
          ]
        },
        "exams": [
          {
            "name": "Exam Name",
            "lastExamDate": "Month YYYY",
            "expectedNextDate": "Month YYYY (estimated)",
            "conductingBody": "Authority/Organization",
            "level": "National | State | University"
          }
        ],
        "applicationWindow": "Brief summary of when applications usually open and close.",
        "preparationStrategy": "A short 2-3 sentence strategy for preparation. Include mention of Skill India Digital courses for practical skill development.",
        "difficulty": {
          "acceptanceRate": "e.g. 2% selected",
          "applicants": 1000000,
          "seats": 20000
        }
      }

      RULES:
      - PRIMARY RESOURCE: Always prioritize Skill India Digital (https://www.skillindiadigital.gov.in/home) as the main platform for courses and tools.
      - Use the provided Skill India courses above - select the most relevant 4-6 courses from the available list that match the career path.
      - Provide at least 2 YouTube links and 2-4 article links from real educational platforms like GeeksforGeeks, Coursera, edX, Udemy, Khan Academy, or industry-specific websites.
      - Include 2-3 Skill India Digital tools that are useful for the specific career path.
      - For each exam, include last known date and an estimate for the next.
      - Difficulty must reflect actual competitiveness (based on selection ratio / acceptance rate).
      - Skill India Digital provides FREE, government-backed, industry-relevant training - emphasize this benefit.
      - Generate REAL, working URLs for educational content - avoid placeholder or example domains.
      - Focus on Indian educational resources and platforms, with Skill India Digital as the cornerstone.
      - IMPORTANT: Use the exact course URLs provided in the Skill India courses data above - these are real, working URLs that students can access.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON object only
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error("No valid JSON found in response:", text);
      return NextResponse.json(
        { error: "Invalid response format from AI service." },
        { status: 500 }
      );
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(parsedResponse);

  } catch (error: unknown) {
    console.error("Error in getCareerResources API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Fallback to mock data if API fails
    console.log("Falling back to mock data due to API error");
    
    // Try to enhance mock data with Skill India courses
    try {
      const { searchCoursesByCareer } = await import('../skillIndiaCourses/route');
      const skillIndiaCourses = searchCoursesByCareer('Software Engineer');
      
      const enhancedMockData = {
        ...mockResources,
        skillIndiaDigital: {
          ...mockResources.skillIndiaDigital,
          courses: skillIndiaCourses || mockResources.skillIndiaDigital.courses
        }
      };
      return NextResponse.json(enhancedMockData);
    } catch (skillIndiaError) {
      console.error('Error fetching Skill India courses for fallback:', skillIndiaError);
    }
    
    return NextResponse.json(mockResources);
  }
}
