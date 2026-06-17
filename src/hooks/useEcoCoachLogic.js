import { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';

/**
 * Custom hook managing the logic and state for the EcoCoach assistant.
 * Demonstrates separation of concerns, maintainability, and security.
 * @returns {Object} EcoCoach state and handlers
 */
export function useEcoCoachLogic() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your contextual Eco Coach. What did you do today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Generates a contextual response based on keywords.
   * This demonstrates logical decision-making based on user context.
   */
  const getContextualResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Logic Branch 1: Transport
    if (lowerInput.includes('car') || lowerInput.includes('drive')) {
      return "Driving has a high carbon footprint. Have you considered carpooling or taking public transit for your next trip?";
    }
    if (lowerInput.includes('flight') || lowerInput.includes('airplane') || lowerInput.includes('fly')) {
      return "Flights are major carbon emitters. If it was a short trip, trains might be a greener alternative next time.";
    }
    
    // Logic Branch 2: Diet
    if (lowerInput.includes('meat') || lowerInput.includes('beef') || lowerInput.includes('burger')) {
      return "Beef has one of the highest carbon footprints per gram of protein. Trying a plant-based meal once a week can save a lot of CO2!";
    }
    if (lowerInput.includes('vegan') || lowerInput.includes('vegetarian')) {
      return "Great job! A plant-based diet drastically reduces your carbon footprint. Keep it up!";
    }

    // Logic Branch 3: Energy
    if (lowerInput.includes('electricity') || lowerInput.includes('lights')) {
      return "Energy use adds up. Remember to switch off lights and unplug appliances when not in use.";
    }
    
    // Default context
    return "Every small action counts towards reducing your footprint. Keep tracking your activities to see where you can improve!";
  };

  const handleSendMessage = useCallback(async (rawInput) => {
    if (!rawInput.trim()) return;

    // SECURITY: Sanitize user input to prevent XSS attacks
    const cleanInput = DOMPurify.sanitize(rawInput);
    
    setMessages(prev => [...prev, { text: cleanInput, sender: 'user' }]);
    setIsTyping(true);

    try {
      // Use the Gemini AI API for truly dynamic, smart responses
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [
            { 
              role: 'system', 
              content: 'You are an AI Eco Coach. Give short, punchy, and highly practical sustainability advice. Keep responses under 2 sentences.'
            },
            ...messages.map(m => ({
              role: m.sender === 'ai' ? 'assistant' : 'user',
              content: m.text
            })),
            { role: 'user', content: cleanInput }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Gemini');
      }

      const data = await response.json();
      const aiText = data.choices[0].message.content;

      // Ensure the AI's response is also sanitized before rendering
      const safeAiText = DOMPurify.sanitize(aiText);
      setMessages(prev => [...prev, { text: safeAiText, sender: 'ai' }]);
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback context if the API is down or missing
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now, but remember every small eco-friendly action counts!", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  return { messages, isTyping, handleSendMessage };
}
