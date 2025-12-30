
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from "../constants";
import { GeneratedSiteData, GeneratorInputs } from "../types";

export const generateSiteContent = async (inputs: GeneratorInputs): Promise<GeneratedSiteData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPrompt = SYSTEM_PROMPT
    .replace("{industry}", inputs.industry)
    .replace("{companyName}", inputs.companyName)
    .replace("{location}", inputs.location)
    .replace("{phone}", inputs.phone);

  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: textPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA as any,
    },
  });

  const siteData: Partial<GeneratedSiteData> = JSON.parse(textResponse.text || "{}");

  const imagePromptHero = `Candid high-end professional photography of ${inputs.industry} technicians at a project site in ${inputs.location}. Cinematic lighting, natural environment. No text.`;
  const imagePromptValue = `Authentic job site photo showing the results of professional ${inputs.industry} work in ${inputs.location}. Natural lighting. No text.`;
  const imagePromptAbout = `A professional ${inputs.industry} contractor or a tidy service van in a ${inputs.location} neighborhood setting. Friendly and local vibe. No text.`;
  const imagePromptRepair = `A realistic photo of a professional technician performing ${inputs.industry} repairs in a home setting. Authentic work environment, high quality. No text.`;

  const [heroImgRes, valueImgRes, aboutImgRes, repairImgRes] = await Promise.all([
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePromptHero }] },
    }),
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePromptValue }] },
    }),
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePromptAbout }] },
    }),
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePromptRepair }] },
    })
  ]);

  const extractImage = (response: any) => {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return `https://picsum.photos/1200/800?${Math.random()}`;
  };

  if (!siteData.hero) siteData.hero = {} as any;
  if (!siteData.contact) siteData.contact = {} as any;
  if (!siteData.aboutUs) siteData.aboutUs = {} as any;
  if (!siteData.repairBenefits) siteData.repairBenefits = {} as any;

  siteData.hero.heroImage = extractImage(heroImgRes);
  siteData.aboutUs.image = extractImage(aboutImgRes);
  siteData.repairBenefits.image = extractImage(repairImgRes);
  
  if (siteData.industryValue) {
    siteData.industryValue.valueImage = extractImage(valueImgRes);
  }

  if (!siteData.contact.phone) siteData.contact.phone = inputs.phone;
  if (!siteData.contact.location) siteData.contact.location = inputs.location;
  if (!siteData.contact.companyName) siteData.contact.companyName = inputs.companyName;

  return siteData as GeneratedSiteData;
};
