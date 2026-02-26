import { Type } from "@google/genai";

export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    bannerText: { type: Type.STRING },
    hero: {
      type: Type.OBJECT,
      properties: {
        badge: { type: Type.STRING },
        headline: {
          type: Type.OBJECT,
          properties: {
            line1: { type: Type.STRING },
            line2: { type: Type.STRING }
          },
          required: ["line1", "line2"]
        },
        subtext: { type: Type.STRING },
        ctaText: { type: Type.STRING },
        navCta: { type: Type.STRING },
        stats: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING }
            },
            required: ["label", "value"]
          },
          minItems: 3,
          maxItems: 4
        }
      },
      required: ["badge", "headline", "subtext", "stats"]
    },
    services: {
      type: Type.OBJECT,
      properties: {
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["title", "description", "icon"]
          },
          minItems: 4,
          maxItems: 4
        }
      },
      required: ["cards"]
    },
    valueProposition: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        content: { type: Type.STRING },
        ctaText: { type: Type.STRING },
        highlights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 3,
          maxItems: 4
        }
      },
      required: ["title", "subtitle", "content", "ctaText", "highlights"]
    },
    process: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ["title", "description", "icon"]
          },
          minItems: 3,
          maxItems: 3
        }
      },
      required: ["title", "steps"]
    },
    benefits: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 6,
          maxItems: 6
        }
      },
      required: ["title", "items"]
    },
    whoWeHelp: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
        bullets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 3,
          maxItems: 5
        }
      },
      required: ["title", "imagePrompt", "bullets"]
    },
    faqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
      },
      minItems: 4,
      maxItems: 4
    },
    footer: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        ctaText: { type: Type.STRING }
      },
      required: ["headline", "ctaText"]
    },
    contact: {
      type: Type.OBJECT,
      properties: {
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        companyName: { type: Type.STRING }
      },
      required: ["phone", "location", "companyName"]
    }
  },
  required: ["bannerText", "hero", "services", "valueProposition", "process", "benefits", "faqs", "footer", "contact"]
};
