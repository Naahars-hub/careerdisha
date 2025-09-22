import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- DEVELOPMENT SWITCH ---
const useMockData = false;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

/**
 * Builds a detailed, dynamic prompt for the Gemini API based on student data.
 */
function buildPrompt(data: { baseData: Record<string, string>; mcqAnswers: Record<string, string> }, userLocation?: any) {
  const { baseData, mcqAnswers } = data;
  
  const mcqAnswersString = Object.entries(mcqAnswers)
    .map(([key, value]) => `  - Question ${parseInt(key) + 1}: ${value}`)
    .join('\n');

  let dynamicInstructions = '';

  // Build location context for college recommendations
  let locationContext = '';
  if (userLocation) {
    const locationParts = [];
    if (userLocation.location_city) locationParts.push(userLocation.location_city);
    if (userLocation.location_state) locationParts.push(userLocation.location_state);
    if (userLocation.location_country) locationParts.push(userLocation.location_country);
    
    if (locationParts.length > 0) {
      locationContext = `\n\n**LOCATION CONTEXT:**\nThe student is located in: ${locationParts.join(', ')}. When recommending colleges, prioritize institutions that are:\n1. **Nearby/accessible** from their location (within 200-300 km radius)\n2. **In the same state/region** for easier access and lower costs\n3. **Well-connected** by transport from their location\n4. **Reputable institutions** in their region\n\nIf no good colleges exist nearby, then suggest the best national options.`;
    }
  }

  // Instructions based on MCQ answers only
  
  if (baseData.educationLevel === '10th') {
    dynamicInstructions = `
      1.  **Suggest the best stream** (Science, Commerce, or Arts/Humanities) and provide a concise reason.
      2.  Based on the suggested stream and MCQ answers, provide **3 highly targeted career options** that match the student's specific interests and preferences.
      3.  For each career option, list **10 suitable colleges in India**${userLocation ? ' prioritizing those near the student\'s location' : ''}.
      4.  For each career option, list **10 potential job opportunities**, each with an "avgSalary" (in INR) and a "marketTrend" ('up', 'down', or 'stable').
    `;
  } else if (baseData.educationLevel === '12th') {
    dynamicInstructions = `
      1.  The student is in 12th grade in the ${baseData.stream} stream. Do not suggest a stream.
      2.  Based on MCQ answers, provide **3 highly targeted career options** that align with their specific interests, skills, and preferences.
      3.  For each career option, list **10 suitable colleges in India**${userLocation ? ' prioritizing those near the student\'s location' : ''}.
      4.  For each career option, list **10 potential job opportunities**, each with an "avgSalary" (in INR) and a "marketTrend" ('up', 'down', or 'stable').
    `;
  } else { 
    dynamicInstructions = `
      1.  The student is in college studying ${baseData.fieldOfStudy}. Do not suggest streams or undergraduate colleges.
      2.  Based on MCQ answers, provide **3 highly targeted career paths or advanced job roles** that match their specific interests and career goals.
      3.  For each path, list **10 specific job opportunities**, each with an "avgSalary" (in INR) and a "marketTrend" ('up', 'down', or 'stable').
      4.  If answers suggest interest in further studies, include a "higherStudies" section with **5 postgraduate (PG) colleges or courses**${userLocation ? ' prioritizing those near the student\'s location' : ''}.
      5.  If answers suggest an interest in entrepreneurship, include a "businessOpportunities" section with **3 relevant business ideas**.
`;
  }

  return `
    You are a premier career counselor for the Indian education system. Your task is to generate a personalized career map.

    **STUDENT PROFILE:**
    - Education Level: ${baseData.educationLevel || 'Not provided'}
    - Stream/Field of Study: ${baseData.stream || baseData.fieldOfStudy || 'Not provided'}
    - Interests & Goals: ${JSON.stringify({ q1: baseData.q1, q2: baseData.q2, q3: baseData.q3, q4: baseData.q4, q5: baseData.q5, q6: baseData.q6, q7: baseData.q7 })}
    ${locationContext}
    
    **MCQ QUIZ ANSWERS:**
    ${mcqAnswersString}

    **INSTRUCTIONS:**
    Based on the complete profile, generate the career map following these rules:
    ${dynamicInstructions}

    **CRITICAL OUTPUT FORMAT:**
    You MUST respond with ONLY a valid JSON object. Do not include any introductory text, explanations, or markdown formatting.

    JSON schema:
    {
      "streamSuggestion": { "stream": "Science", "reason": "..." },
      "careerOptions": [
        {
          "title": "Career Title",
          "description": "A brief 2-3 sentence description of this career.",
          "colleges": ["College 1", "College 2", "..."],
          "jobOpportunities": [
            { "title": "Job Title", "avgSalary": "₹X LPA", "marketTrend": "up" }
          ]
        }
      ],
      "higherStudies": { "description": "...", "colleges": ["PG College 1", "..."] },
      "businessOpportunities": { "description": "...", "ideas": ["Idea 1", "..."] }
    }

    **IMPORTANT:** 
    - For students in college (educationLevel !== '10th' and !== '12th'), do NOT include "colleges" field in careerOptions. Only include "colleges" for 10th and 12th grade students.
    - For 12th grade and in-college students, do NOT include "streamSuggestion" field. Only include "streamSuggestion" for 10th grade students.

    Only include optional keys if relevant. "careerOptions" must always be present.
  `;
}

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Get user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  // 2. Get user location data from request body (stored in localStorage)
  let userLocation = null;
  if (body.locationData) {
    userLocation = {
      location_country: body.locationData.country,
      location_state: body.locationData.state,
      location_city: body.locationData.city,
      latitude: body.locationData.latitude,
      longitude: body.locationData.longitude
    };
    console.log('Using location data from localStorage:', userLocation);
  } else {
    console.log('No location data provided in request');
  }

  // Mock data disabled - using real API

  // Real API logic
  try {
    const prompt = buildPrompt(body, userLocation);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("--- RAW AI RESPONSE ---\n", text, "\n-----------------------");

    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI response did not contain a valid JSON object.");
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    const parsedResponse = JSON.parse(jsonString);

    // Save result to Supabase
    const { error: insertError } = await supabase
      .from('results')
      .insert({
        user_id: session.user.id,
        map_data: parsedResponse
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
    } else {
      console.log("Career map saved for user:", session.user.id);
    }

    // Return response
    return NextResponse.json(parsedResponse);

  } catch (error: unknown) {
    console.error("Error in generateCareerMap API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: "Failed to generate career map.", details: errorMessage }, { status: 500 });
  }
}
