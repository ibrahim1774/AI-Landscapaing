import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { RESPONSE_SCHEMA } from './_lib/schema.js';

const AI_EDIT_SYSTEM_PROMPT = `
You are an AI editor for a landscaping business website. You will receive:
1. The current website data as a JSON object
2. A user instruction describing what they want to change

Your job is to return a COMPLETE modified JSON object that applies the user's requested changes while preserving everything else exactly as-is.

CRITICAL RULES:
- Return the COMPLETE JSON object, not just the changed parts.
- Apply ONLY the changes the user requested. Do NOT "improve" or alter other sections.
- DO NOT change any image-related fields (heroImage, image, images, imagePrompt). They are managed separately.
- DO NOT change contact.phone, contact.location, or contact.companyName unless the user specifically asks.
- Preserve the exact same JSON structure and all required fields.
- Maintain array lengths (4 service cards, 6 benefit items, 4 FAQs, 3 process steps, 3-4 stats) unless the user specifically asks to change them.

COMPLIANCE RULES (same as original generation):
- NO GUARANTEES: Do NOT use "guaranteed", "will", "always", "best", "promise", "certainty", or "perfect".
- NO NUMBERS: Do NOT include digits or spelled-out numbers (except the phone number in CTAs).
- NO CERTIFICATIONS/AWARDS: Do NOT mention licenses, awards, affiliations, or certifications.
- NO SOCIAL PROOF: Do NOT invent testimonials, reviews, or ratings.
- NEUTRAL TONE: Use "We offer", "We help with", "Designed to", "Learn more", "Contact us".
- EVERY CTA must include the literal phone number in its text.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { instruction, currentSiteData, contactInfo } = req.body || {};

    if (!instruction || !currentSiteData) {
        return res.status(400).json({ error: 'Missing instruction or currentSiteData' });
    }

    console.log(`[AI Edit] Instruction: "${instruction}"`);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const phone = contactInfo?.phone || currentSiteData.contact?.phone || '';
        const location = contactInfo?.location || currentSiteData.contact?.location || '';
        const companyName = contactInfo?.companyName || currentSiteData.contact?.companyName || '';

        const userPrompt = `
Current website data:
${JSON.stringify(currentSiteData, null, 2)}

User instruction: "${instruction}"

Contact info that MUST be preserved exactly:
- Phone: ${phone}
- Location: ${location}
- Company: ${companyName}

Return the complete modified JSON object with ONLY the requested changes applied.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA as any,
                systemInstruction: AI_EDIT_SYSTEM_PROMPT,
            },
        });

        const rawText = response.text || "{}";
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const modifiedData = JSON.parse(cleanedText);

        // Validate required top-level fields
        const requiredFields = ['bannerText', 'hero', 'services', 'valueProposition', 'process', 'benefits', 'faqs', 'footer', 'contact'];
        for (const key of requiredFields) {
            if (!modifiedData[key]) {
                return res.status(500).json({ error: `AI response missing required field: ${key}` });
            }
        }

        // Force-preserve image fields (safety net — images are stripped client-side anyway)
        if (currentSiteData.hero?.heroImage && currentSiteData.hero.heroImage !== '[PRESERVED]') {
            modifiedData.hero.heroImage = currentSiteData.hero.heroImage;
        }
        if (currentSiteData.valueProposition?.image && currentSiteData.valueProposition.image !== '[PRESERVED]') {
            modifiedData.valueProposition.image = currentSiteData.valueProposition.image;
        }
        if (currentSiteData.whoWeHelp?.image && currentSiteData.whoWeHelp.image !== '[PRESERVED]') {
            modifiedData.whoWeHelp.image = currentSiteData.whoWeHelp.image;
        }
        if (currentSiteData.gallery) {
            modifiedData.gallery = currentSiteData.gallery;
        }

        // Force-preserve contact info
        modifiedData.contact = {
            phone,
            location,
            companyName,
        };

        console.log('[AI Edit] Success');
        return res.status(200).json({ success: true, data: modifiedData });
    } catch (error: any) {
        console.error('[AI Edit] Error:', error);
        return res.status(500).json({
            error: error.message || 'AI edit failed. Please try again.',
        });
    }
}
