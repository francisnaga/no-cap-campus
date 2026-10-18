import { GoogleGenAI } from '@google/genai';
import { SeedPackEntry } from '../lib/contentSeed.ts';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * Generates an alternative candidate Daily Showdown pack using Gemini,
 * validated against strict schema, with safety rules for Nigerian campus context.
 */
export async function generateDailyCandidatePack(dateId: string): Promise<SeedPackEntry | null> {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const prompt = `You are the content editor for "NO CAP", a Nigerian university campus social trivia game.
Create a 3-stage daily challenge pack for date ${dateId}.
Stage 1: Campus Quickfire - 1 objective general knowledge question about Nigerian campus life, university grading (NUC), or general student affairs. 4 options, strictly 1 correct.
Stage 2: Real or Fake Course? - 1 course name that is either a real accredited university programme or an amusing fake one. Options: ["REAL COURSE", "FAKE COURSE"].
Stage 3: Campus Read - 1 common, harmless, relatable campus dilemma or funny student situation with 3 distinct reaction choices.

Guidelines:
- No real student or lecturer names, no offensive or sexual slurs, no politics or tribalism.
- Must return strict valid JSON matching the exact schema.

JSON format:
{
  "pack": {
    "dateId": "${dateId}",
    "version": 1,
    "timeLimitSeconds": 120,
    "maxScore": 30,
    "stages": [
      {
        "id": "s1",
        "type": "quickfire",
        "title": "Stage 1: Campus Quickfire",
        "prompt": "...",
        "options": ["A", "B", "C", "D"]
      },
      {
        "id": "s2",
        "type": "real_or_fake",
        "title": "Stage 2: Real Course or Fake Course?",
        "prompt": "Is '...' a real or fake course?",
        "options": ["REAL COURSE", "FAKE COURSE"]
      },
      {
        "id": "s3",
        "type": "campus_read",
        "title": "Stage 3: Campus Read (Majority Dilemma)",
        "prompt": "...",
        "options": ["Option 1", "Option 2", "Option 3"]
      }
    ]
  },
  "answerKey": {
    "dateId": "${dateId}",
    "stageAnswers": [
      { "stageIndex": 0, "correctAnswerIndex": 0, "explanation": "..." },
      { "stageIndex": 1, "correctAnswerIndex": 0, "explanation": "..." },
      { "stageIndex": 2, "correctAnswerIndex": 0, "explanation": "..." }
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (!response.text) return null;
    const data = JSON.parse(response.text);
    if (!data.pack || !data.answerKey || data.pack.stages.length !== 3) {
      return null;
    }
    return data as SeedPackEntry;
  } catch (err) {
    console.error('Gemini daily candidate pack generation error (falling back to seed bank):', err);
    return null;
  }
}

/**
 * Generates post-game playful commentary based on score and performance.
 */
export async function generateGameVerdict(score: number, maxScore: number, streak: number): Promise<string> {
  const percentage = Math.round((score / maxScore) * 100);
  const ai = getAIClient();
  
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a 1-sentence witty, playful verdict for a Nigerian university student who just scored ${score}/${maxScore} (${percentage}%) on NO CAP Daily Showdown with a streak of ${streak} days. Keep it light, collegiate, encouraging, and stylish without targeting named individuals.`,
      });
      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch {
      // Fall through to deterministic fallback
    }
  }

  if (score === maxScore) {
    return "No cap detected! 30/30 pure campus intellectual dominance.";
  }
  if (score >= 20) {
    return "Solid performance! You definitely attend lectures and listen to announcements.";
  }
  if (score >= 10) {
    return "You survived, but the hostel gossip is distracting your academic focus.";
  }
  return "Omo! The answer sheet gave you heavy side-eye today. Tomorrow is redemption day.";
}
