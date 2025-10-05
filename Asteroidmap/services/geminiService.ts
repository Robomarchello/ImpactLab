
import { GoogleGenAI } from "@google/genai";
import type { LatLng } from "leaflet";
import type { ImpactData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will show an alert in the browser.
  // In a real production environment, the API_KEY should be securely handled.
  console.warn("API_KEY is not set. Using a mock response.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateImpactSummary(data: ImpactData, location: LatLng): Promise<string> {
  if (!API_KEY) {
    return `(Mock Response) A catastrophic event unfolds at latitude ${location.lat.toFixed(2)}, longitude ${location.lng.toFixed(2)}. An impact of ${data.energy.toFixed(2)} megatons creates a crater ${data.craterDiameter.toFixed(2)} km wide. The resulting fireball and shockwave cause widespread devastation.`;
  }
  
  const prompt = `
    You are a dramatic science journalist reporting on a catastrophic asteroid impact.
    Write a vivid, engaging, and descriptive summary of the event based on the following data.
    Do not just list the data; weave it into a compelling narrative.
    Focus on the visual and sensory experience of the event. Keep it to one or two paragraphs.

    Impact Data:
    - Location: Latitude ${location.lat.toFixed(4)}, Longitude ${location.lng.toFixed(4)}
    - Impact Energy: ${data.energy.toFixed(2)} megatons of TNT
    - Resulting Crater Diameter: ${data.craterDiameter.toFixed(2)} kilometers
    - Fireball Radius: ${data.fireballRadius.toFixed(2)} kilometers
    - Maximum Shockwave Effect: ${data.shockwave[0].description} up to ${data.shockwave[0].radius.toFixed(2)} km away.
    - Tsunami Information: ${data.tsunamiWarning || "No significant tsunami."}

    Begin the report now.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "The AI narrator is currently unavailable. The impact's raw power speaks for itself, leaving a scar on the planet's surface and a deafening silence in its wake.";
  }
}
