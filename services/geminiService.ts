
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from "../constants";
import { GeneratedSiteData, GeneratorInputs } from "../types";

/**
 * Utility to strip markdown code blocks from AI response text
 */
const cleanJsonResponse = (text: string): string => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

export const generateSiteContent = async (inputs: GeneratorInputs): Promise<GeneratedSiteData> => {
  // Always create a new instance right before usage to get the latest environment state
  const apiKey = process.env.API_KEY || import.meta.env.VITE_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const textPrompt = SYSTEM_PROMPT
    .replace("{industry}", inputs.industry)
    .replace("{companyName}", inputs.companyName)
    .replace("{location}", inputs.location)
    .replace("{phone}", inputs.phone);

  try {
    // 1. Generate Text Content
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: textPrompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    const rawText = textResponse.text || "{}";
    const cleanedText = cleanJsonResponse(rawText);
    const siteData: Partial<GeneratedSiteData> = JSON.parse(cleanedText);

    // 2. Prepare Image Prompts
    const imagePromptHero = `Candid high-end professional photography of ${inputs.industry} technicians working at a job site in ${inputs.location}. Cinematic lighting, natural environment, 8k resolution. No text.`;
    const imagePromptValue = `Authentic photo showing the high quality results of professional ${inputs.industry} work in a residential setting in ${inputs.location}. Natural lighting. No text.`;
    const imagePromptAbout = `A professional ${inputs.industry} contractor or a clean service vehicle in a ${inputs.location} residential area. Friendly and local vibe. No text.`;
    const imagePromptRepair = `A realistic photo of a professional technician performing detailed ${inputs.industry} repairs. Authentic work environment, high quality focus. No text.`;

    // Helper to extract image from response
    const extractImage = (response: any) => {
      try {
        // Iterate through all parts to find the image (model might be chatty)
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    // Helper to handle individual promise rejections so one failure doesn't kill all
    const safeGenerate = async (prompt: string, isRetry = false): Promise<string> => {
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
        });

        const image = extractImage(res);
        if (image) return image;

        // If no image and not already retrying, try with a safer prompt
        if (!isRetry) {
          console.warn("Image generation failed (text response?), retrying with safe prompt...");
          // Remove "people", "technician", "candid" from prompt to avoid safety triggers
          const safePrompt = prompt
            .replace(/technicians?|people|person|man|woman|contractor/gi, "equipment")
            .replace(/candid|authentic|realistic/gi, "high quality") + " No people.";

          return await safeGenerate(safePrompt, true);
        }

        // If still no image, return error placeholder
        const parts = res.candidates?.[0]?.content?.parts || [];
        const textPart = parts.find((p: any) => p.text);
        const text = textPart ? textPart.text : "Unknown Error";

        // Log to server
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: "Text Response (Final)", text, response: res })
        }).catch(() => { });

        return `https://placehold.co/1200x800?text=${encodeURIComponent(text.substring(0, 60))}`;

      } catch (e: any) {
        console.error(`Generation failed for prompt "${prompt.substring(0, 20)}...":`, e);
        const msg = e.message ? e.message.substring(0, 50).replace(/[^a-zA-Z0-9 ]/g, '') : "Unknown Error";
        return `https://placehold.co/1200x800?text=Error:+${encodeURIComponent(msg)}`;
      }
    };

    // 3. Generate Images in Parallel
    const [heroImg, valueImg, aboutImg, repairImg] = await Promise.all([
      safeGenerate(imagePromptHero),
      safeGenerate(imagePromptValue),
      safeGenerate(imagePromptAbout),
      safeGenerate(imagePromptRepair)
    ]);

    // 4. Combine and Sanitize
    if (!siteData.hero) siteData.hero = {} as any;
    if (!siteData.contact) siteData.contact = {} as any;
    if (!siteData.aboutUs) siteData.aboutUs = {} as any;
    if (!siteData.repairBenefits) siteData.repairBenefits = {} as any;

    siteData.hero.heroImage = heroImg;
    siteData.aboutUs.image = aboutImg;
    siteData.repairBenefits.image = repairImg;

    if (siteData.industryValue) {
      siteData.industryValue.valueImage = valueImg;
    }

    siteData.contact.phone = inputs.phone;
    siteData.contact.location = inputs.location;
    siteData.contact.companyName = inputs.companyName;

    return siteData as GeneratedSiteData;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Propagate a clean error message if it's a model issue
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("Model not found or API key restricted. Please ensure your API key is correctly configured.");
    }
    throw error;
  }
};
