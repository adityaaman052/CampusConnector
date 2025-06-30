import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Customize your AI behavior here
const SYSTEM_PROMPT = `
You are CampusAI, a helpful assistant for the Campus Connect app.
You help students with:
- Campus navigation and facilities
- Academic guidance and study tips
- Event information and scheduling
- General student life advice

IMPORTANT RULES:
- Keep responses concise and student-friendly
- Always be positive and encouraging
- Don't provide personal information about individuals
- Don't help with academic dishonesty (cheating, plagiarism)
- Don't provide inappropriate content
- Focus on campus-related topics
- If asked about something outside your scope, politely redirect to campus resources

Respond in a friendly, helpful tone as if you're a knowledgeable upperclassman.
`;

// Topics the AI should avoid or handle carefully
const RESTRICTED_TOPICS = [
  'personal information',
  'financial advice',
  'medical diagnosis',
  'legal advice',
  'inappropriate content',
  'academic dishonesty'
];

function shouldRestrict(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for restricted topics
  const hasRestrictedContent = RESTRICTED_TOPICS.some(topic => 
    lowerMessage.includes(topic.toLowerCase())
  );
  
  // Check for academic dishonesty keywords
  const cheatingKeywords = ['cheat', 'plagiarize', 'copy homework', 'exam answers', 'test answers'];
  const hasCheatingContent = cheatingKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  return hasRestrictedContent || hasCheatingContent;
}

function getRestrictedResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('cheat') || lowerMessage.includes('plagiar')) {
    return "I can't help with academic dishonesty. Instead, I can help you with study strategies, time management, or connecting you with tutoring resources on campus!";
  }
  
  if (lowerMessage.includes('medical') || lowerMessage.includes('health')) {
    return "For health-related concerns, please contact the Campus Health Center. I can help you find their location and contact information if needed!";
  }
  
  return "I'm designed to help with campus-related topics. For this type of question, I'd recommend reaching out to the appropriate campus resources or staff members who can provide proper guidance.";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;
    
    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the message should be restricted
    if (shouldRestrict(message)) {
      const restrictedResponse = getRestrictedResponse(message);
      return new Response(
        JSON.stringify({ reply: restrictedResponse }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();
    
    return new Response(
      JSON.stringify({ reply }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return new Response(
        JSON.stringify({ error: 'API configuration error. Please check your setup.' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}