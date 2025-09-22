import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- DEVELOPMENT SWITCH ---
// Set this to 'true' to use mock responses and save your API quota.
// Set this to 'false' to use the real Gemini API.
const useMockData = false;

const API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

// Mock responses for different types of questions
const getMockResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('career') || message.includes('job') || message.includes('profession')) {
    return "I can help you explore career options! Consider your interests, skills, and values. What subjects do you enjoy most?";
  }
  
  if (message.includes('engineering') || message.includes('tech')) {
    return "Engineering offers great opportunities! Focus on math and science. Consider computer science, mechanical, or civil engineering based on your interests.";
  }
  
  if (message.includes('medical') || message.includes('doctor') || message.includes('health')) {
    return "Medical field is rewarding but requires dedication. You'll need strong biology and chemistry knowledge. Consider MBBS, nursing, or allied health courses.";
  }
  
  if (message.includes('college') || message.includes('university') || message.includes('admission')) {
    return "For college selection, research rankings, faculty, placement records, and campus culture. Consider your budget and location preferences too.";
  }
  
  if (message.includes('exam') || message.includes('preparation') || message.includes('study')) {
    return "Create a study schedule and stick to it. Practice previous year papers and take mock tests regularly. Focus on weak areas.";
  }
  
  if (message.includes('stream') || message.includes('subject') || message.includes('course')) {
    return "Choose your stream based on interests and career goals. Science offers engineering and medical paths. Commerce leads to business careers. Arts provides diverse options.";
  }
  
  if (message.includes('salary') || message.includes('money') || message.includes('income')) {
    return "Salaries vary by field and experience. Engineering and medicine typically offer good packages. Research current market trends for your chosen field.";
  }
  
  if (message.includes('future') || message.includes('trend') || message.includes('growth')) {
    return "Future job markets favor technology, healthcare, and sustainability. Develop digital skills and stay updated with industry trends.";
  }
  
  if (message.includes('help') || message.includes('guidance') || message.includes('advice')) {
    return "I'm here to help! Ask me about specific careers, colleges, exams, or any career-related questions. What would you like to know?";
  }
  
  // Default response
  return "That's an interesting question! Could you tell me more about your specific situation or what you'd like to explore?";
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    // --- MOCK DATA LOGIC ---
    if (useMockData || !API_KEY || API_KEY === 'your_gemini_api_key_here') {
      console.log("Serving mock chat response.", useMockData ? "Mock mode enabled." : "API key missing or not configured.");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      const lastMessage = messages[messages.length - 1].content;
      const mockResponse = getMockResponse(lastMessage);
      
      return NextResponse.json({ content: mockResponse });
    }

    // --- REAL API LOGIC ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Define the initial system prompt to set the chatbot's persona and style
    const systemPrompt = "You are 'Career Disha,' a friendly, expert AI career counselor for students in India. Answer plainly and briefly. Use simple words. Keep replies to 2–3 short sentences. Do not use lists, headings, bold text, or introductions like 'Here are' or 'Sure'. Go straight to the answer. If needed, give a single, clear next step.";

    // Use the last 6 messages for context to keep the payload small
    const recentMessages = messages.slice(-6);

    const chatHistory = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Start the chat session with the persona and history
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Hello, who are you?" }] },
        { role: "model", parts: [{ text: systemPrompt }] },
        ...chatHistory,
      ],
      generationConfig: {
        maxOutputTokens: 120,
      },
       safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });

  } catch (error: unknown) {
    console.error("Error in chat API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: "Failed to get a response from the AI.", details: errorMessage }, { status: 500 });
  }
}