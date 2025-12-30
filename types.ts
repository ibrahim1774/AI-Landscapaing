
export interface ServiceCard {
  title: string;
  description: string;
  icon: string;
}

export interface BenefitCard {
  title: string;
  description: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GeneratedSiteData {
  bannerText: string;
  hero: {
    badge: string;
    headline: {
      line1: string;
      line2: string;
      line3: string;
    };
    subtext: string;
    heroImage: string;
  };
  services: {
    cards: ServiceCard[];
  };
  repairBenefits: {
    title: string;
    image: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  aboutUs: {
    title: string;
    content: string;
    image: string;
  };
  whyItMatters: {
    title: string;
    content: string;
  };
  additionalBenefits: {
    cards: BenefitCard[];
  };
  industryValue: {
    title: string;
    content: string;
    valueImage: string;
  };
  benefits: {
    items: string[];
  };
  faqs: FAQItem[];
  contact: {
    phone: string;
    location: string;
    companyName: string;
  }
}

export interface SiteInstance {
  id: string;
  data: GeneratedSiteData;
  lastSaved: number;
}

export interface GeneratorInputs {
  industry: string;
  companyName: string;
  location: string;
  phone: string;
  brandColor: string;
}
