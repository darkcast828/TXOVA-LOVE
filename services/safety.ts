// This service handles Content Moderation (Trust & Safety)
// In a real production app, this would integrate with:
// 1. Google Cloud Vision API (SafeSearch Detection) or AWS Rekognition for images.
// 2. OpenAI Moderation Endpoint or custom NLP for text.

export const SAFETY_ERROR_MSG = "⚠️ Conteúdo proibido detectado. O Txova Love não permite nudez ou pornografia.";

// Blacklist of terms for immediate blocking (Text)
const BANNED_KEYWORDS = [
  'nude', 'sexo', 'xxx', 'porn', 'prostituta', 'programa', 
  'intimo', 'dotado', 'safada', 'safado', 'quente', 
  'massagem erotica', 'acompanhante', 'sugar', 'pix'
];

export const safetyService = {
  /**
   * Analyzes text for prohibited content.
   */
  analyzeText: (text: string): boolean => {
    if (!text) return true;
    const lowerText = text.toLowerCase();
    
    // Check for banned keywords
    const hasBannedWord = BANNED_KEYWORDS.some(word => lowerText.includes(word));
    
    if (hasBannedWord) {
      console.warn(`Safety System: Blocked text containing banned content.`);
      return false;
    }
    
    return true;
  },

  /**
   * Simulates AI Image Analysis for Nudity/Gore/Violence.
   * In a real app, this sends the image to a backend API.
   */
  analyzeImage: async (file: File): Promise<boolean> => {
    // Simulate AI Processing Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK LOGIC FOR DEMONSTRATION:
    // If the file name contains "xxx", "nude", or "sexy", we simulate a flag.
    // In production, this analyzes the actual PIXELS of the image.
    const fileName = file.name.toLowerCase();
    if (fileName.includes('xxx') || fileName.includes('nude') || fileName.includes('porn') || fileName.includes('sex')) {
      console.warn(`Safety System: AI detected explicit content in image.`);
      return false; // REJECT
    }

    // Default: Approve (Clean)
    return true;
  },

  /**
   * Checks if the user is currently suspended.
   */
  checkUserStanding: (userId: string): 'ACTIVE' | 'SUSPENDED' | 'BANNED' => {
    // Mock check
    return 'ACTIVE';
  }
};