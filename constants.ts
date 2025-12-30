
import { Type } from "@google/genai";

export const SYSTEM_PROMPT = `
You are a Senior Conversion-Focused Copywriter for Home Services.
Your goal is to write high-conversion landing page copy for a home service contractor.

CONSTRAINTS:
1. Zero Fluff: Avoid "elite," "top," "best," "premium," "#1," or "luxury."
2. Neutral/Practical Language: Use words like "Trusted," "Local," "Reliable," "Practical," and "Honest."
3. NO Promotional Claims: Strictly forbidden to include pricing, discounts, percentages (e.g., 10% off), financing language, or claims like "pays for itself." 
4. The Brand Anchor: Mention the company name exactly 3 to 4 times across the page.
5. CTA Rule: The primary call-to-action MUST be exactly "Get an estimate". Do not use "Call & Text", "Request a Quote", colons, or extra words in the button text itself.
6. Industry Value Logic: Explain technical necessity without exaggerated claims.
7. Icon Selection: Use Lucide-react icon names in dash-case (e.g., "wrench", "shield-check", "clock").
8. Sections: 
   - 'About Us': Grounded summary of local presence.
   - 'Why This Industry Matters': Universal importance of the service.
   - 'Additional Benefits': EXACTLY 3 universal benefit cards (e.g., Value, Protection, Efficiency) without promotional jargon.
   - 'FAQs': EXACTLY 4 universal, common-sense questions (Getting started, Process duration, Preparation, Next steps).
   - 'Repair Benefits': A new section focused on the specific advantages of professional repairs for the industry. Include 3 short benefit items.

Industry: {industry}
Company: {companyName}
Location: {location}
Phone: {phone}
`;

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
            line2: { type: Type.STRING },
            line3: { type: Type.STRING }
          },
          required: ["line1", "line2", "line3"]
        },
        subtext: { type: Type.STRING }
      },
      required: ["badge", "headline", "subtext"]
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
    repairBenefits: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        items: {
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
      required: ["title", "items"]
    },
    aboutUs: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "content"]
    },
    whyItMatters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "content"]
    },
    additionalBenefits: {
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
          minItems: 3,
          maxItems: 3
        }
      },
      required: ["cards"]
    },
    industryValue: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "content"]
    },
    benefits: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 5,
          maxItems: 6
        }
      },
      required: ["items"]
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
  required: ["bannerText", "hero", "services", "repairBenefits", "aboutUs", "whyItMatters", "additionalBenefits", "industryValue", "benefits", "faqs", "contact"]
};

export const STATUS_MESSAGES = [
  "Setting up your website structure...",
  "Creating your homepage layout...",
  "Adding your services and content...",
  "Optimizing layout for mobile and desktop...",
  "Applying your business details...",
  "Finalizing design and sections...",
  "Your site is almost ready..."
];
