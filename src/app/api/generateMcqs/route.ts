import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- DEVELOPMENT SWITCH ---
// Set this to 'true' to use mock data and save your API quota.
// Set this to 'false' to use the real Gemini API.
const useMockData = false;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  // Mock data disabled - using real API

  // Real API logic
  try {
    const formData = await req.json();
    console.log("Received form data:", formData);
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json({ error: "API key not configured", details: "GEMINI_API_KEY environment variable is missing" }, { status: 500 });
    }
    
    // Retry mechanism to ensure we get exactly 20 questions
    let attempts = 0;
    const maxAttempts = 3;
    let parsedResponse;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} to generate exactly 20 questions`);
      
      // Generate initial broad questions only
      const prompt = `
        You are an expert career counselor for students in the Indian education system.
        Based on the following student profile, generate EXACTLY 20 multiple-choice questions (MCQs) to gauge their interests, aptitude, and personality for career guidance.
        
        Student Profile:
        - Current Education Level: ${formData.educationLevel}
        ${formData.stream ? `- Stream: ${formData.stream}` : ''}
        - Enjoys Subject: ${formData.q1}
        - Challenging Subject: ${formData.q2}
        - Hobbies: ${formData.q3}
        - Work Preference: ${formData.q4}
        - Work Environment: ${formData.q5}
        - Interest Type: ${formData.q6}
        - Long-term Goal: ${formData.q7}
        
        Generate EXACTLY 20 questions that cover:
        1. Problem-solving approaches and thinking styles
        2. Work environment preferences
        3. Communication and leadership styles
        4. Learning preferences and study habits
        5. Career values and motivations
        6. Interest in different industries and fields
        7. Risk tolerance and decision-making style
        
        CRITICAL: You must generate EXACTLY 20 questions. Each question must have exactly 4 options.
        
        IMPORTANT: Respond with ONLY a valid JSON object in the following format:
        { "questions": [ { "question": "...", "options": ["...", "...", "...", "..."] } ] }
      `;

      console.log("Sending request to Gemini API...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Received response from Gemini API");
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Invalid response format from Gemini API");
      }
      
      const jsonString = text.substring(startIndex, endIndex + 1);
      parsedResponse = JSON.parse(jsonString);
      
      // Validate that we have exactly 20 questions
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error("Invalid response format: questions array not found");
      }
      
      if (parsedResponse.questions.length === 20) {
        // Success! We have exactly 20 questions
        break;
      } else if (parsedResponse.questions.length > 20) {
        // If we have more than 20 questions, take only the first 20
        parsedResponse.questions = parsedResponse.questions.slice(0, 20);
        console.log("Truncated questions to exactly 20");
        break;
      } else {
        // If we have fewer than 20 questions, retry
        console.warn(`Attempt ${attempts}: Got ${parsedResponse.questions.length} questions, retrying...`);
        if (attempts === maxAttempts) {
          throw new Error(`Failed to generate exactly 20 questions after ${maxAttempts} attempts. Last attempt generated ${parsedResponse.questions.length} questions.`);
        }
        continue;
      }
    }
    
    // Validate each question has exactly 4 options
    for (let i = 0; i < parsedResponse.questions.length; i++) {
      const question = parsedResponse.questions[i];
      if (!question.question || !Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error(`Invalid question format at index ${i}: must have question and exactly 4 options`);
      }
    }
    
    console.log("Successfully parsed and validated MCQ response with exactly 20 questions");
    return NextResponse.json(parsedResponse);

  } catch (error: unknown) {
    console.error("Error generating MCQs:", error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error details:", errorDetails);
    return NextResponse.json({ error: "Failed to generate questions", details: errorDetails }, { status: 500 });
  }
}