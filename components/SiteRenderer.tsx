
import React, { useRef } from 'react';
import { GeneratedSiteData } from '../types';
import IconRenderer from './IconRenderer';
import { CheckCircle, MapPin, Camera, Sparkles, UserCheck, ShieldQuestion, HelpCircle, Wrench } from 'lucide-react';

interface SiteRendererProps {
  data: GeneratedSiteData;
  isEditMode: boolean;
  onUpdate: (updatedData: GeneratedSiteData) => void;
}

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const EditableText: React.FC<{
  text: string;
  className?: string;
  isEditMode: boolean;
  onBlur: (val: string) => void;
  as?: React.ElementType;
  style?: React.CSSProperties;
}> = ({ text, className, isEditMode, onBlur, as: Tag = 'div', style }) => {
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    onBlur(e.currentTarget.innerText);
  };

  return (
    <Tag
      contentEditable={isEditMode}
      suppressContentEditableWarning
      className={`${className} ${isEditMode ? 'hover:ring-2 hover:ring-blue-400/30 transition-all outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm' : ''} font-light`}
      onBlur={handleBlur}
      style={style}
    >
      {text}
    </Tag>
  );
};

const EditableImage: React.FC<{
  src: string;
  alt: string;
  className: string;
  isEditMode: boolean;
  onUpload: (base64: string) => void;
}> = ({ src, alt, className, isEditMode, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group cursor-pointer ${className}`} onClick={() => isEditMode && fileInputRef.current?.click()}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isEditMode && (
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
          <div className="bg-white/95 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform group-hover:scale-105 transition-transform">
            <Camera className="text-blue-600 w-5 h-5" />
            <span className="text-blue-900 font-bold text-xs uppercase tracking-tight">📷 Replace image</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
      )}
    </div>
  );
};

const SiteRenderer: React.FC<SiteRendererProps> = ({ data, isEditMode, onUpdate }) => {
  const primaryColor = '#2563eb';

  const updateField = (path: string, val: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    const keys = path.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = val;
    onUpdate(newData);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 font-light" style={{ fontFamily: '"Avenir Light", Avenir, sans-serif' }}>
      {/* Dynamic Nav */}
      <nav className="fixed top-[48px] md:top-[64px] left-0 right-0 z-[90] bg-white/95 backdrop-blur-md border-b border-gray-100 py-2.5 px-6 md:px-12 flex justify-between items-center transition-all">
        <EditableText
          text={data.contact.companyName.toUpperCase()}
          isEditMode={isEditMode}
          onBlur={(val) => updateField('contact.companyName', val)}
          className="font-bold text-lg md:text-xl tracking-tighter"
        />
        <a 
          href={`tel:${data.contact.phone}`}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/10 uppercase tracking-tighter"
          style={{ backgroundColor: primaryColor }}
        >
          <EditableText
            text="Get an estimate"
            isEditMode={isEditMode}
            onBlur={() => {}} 
            className="inline"
          />
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-28">
        <div className="absolute inset-0 z-0">
          <EditableImage
            src={data.hero.heroImage}
            alt="Hero Background"
            className="w-full h-full"
            isEditMode={isEditMode}
            onUpload={(base64) => updateField('hero.heroImage', base64)}
          />
          <div className="absolute inset-0 bg-black/70 md:bg-black/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center py-8">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-400/30 text-blue-100 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">
            <Sparkles size={12} className="text-blue-400" />
            <EditableText
              text={data.hero.badge || `Trusted in ${data.contact.location}`}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('hero.badge', val)}
            />
          </div>
          <h1 className="text-white text-3xl md:text-[64px] font-bold tracking-tighter leading-[0.95] mb-6 max-w-5xl mx-auto">
            <EditableText 
              text={data.hero.headline.line1} 
              isEditMode={isEditMode} 
              onBlur={(val) => updateField('hero.headline.line1', val)} 
              className="block opacity-90"
            />
            <EditableText 
              text={data.hero.headline.line2} 
              isEditMode={isEditMode} 
              onBlur={(val) => updateField('hero.headline.line2', val)} 
              className="block"
              style={{ color: primaryColor }}
            />
            <EditableText 
              text={data.hero.headline.line3} 
              isEditMode={isEditMode} 
              onBlur={(val) => updateField('hero.headline.line3', val)} 
              className="block opacity-80"
            />
          </h1>
          <EditableText
            text={data.hero.subtext}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('hero.subtext', val)}
            className="max-w-2xl mx-auto text-gray-300 text-sm md:text-base font-light leading-relaxed mb-8"
          />
          
          <div className="flex flex-col items-center gap-6">
            {/* Formatted CTA - Single line with colon and hyphenated phone */}
            <a 
              href={`tel:${data.contact.phone}`}
              className="w-full sm:w-auto px-8 md:px-12 py-5 bg-white text-blue-900 font-bold rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter text-sm md:text-2xl whitespace-nowrap overflow-hidden inline-flex items-center justify-center gap-1"
            >
              Get An Estimate: {formatPhoneNumber(data.contact.phone)}
            </a>
            
            {/* Professional Service Range area with 7 bullets total */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/70 font-bold text-[9px] md:text-[11px] uppercase tracking-widest max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Professional Service Range
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Quality Workmanship
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Dedicated Support
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Locally Owned & Operated
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Honest Pricing
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Reliable Solutions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" /> Prompt Arrival
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Offered Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-xl">
              <div className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Our Expertise</div>
              <EditableText
                text="Comprehensive Services Offered"
                isEditMode={isEditMode}
                onBlur={() => {}}
                className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900"
                as="h2"
              />
            </div>
            <p className="text-gray-500 font-medium max-w-xs md:text-right text-xs md:text-sm border-l md:border-l-0 md:border-r border-blue-200 pl-4 md:pl-0 md:pr-4">
              Providing reliable {data.contact.companyName} solutions across {data.contact.location}.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.services.cards.map((service, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex flex-col items-start h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <IconRenderer name={service.icon} className="w-6 h-6" />
                </div>
                <EditableText
                  text={service.title}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.services.cards];
                    cards[idx].title = val;
                    updateField('services.cards', cards);
                  }}
                  className="text-lg font-bold mb-3 tracking-tight text-gray-900"
                  as="h3"
                />
                <EditableText
                  text={service.description}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.services.cards];
                    cards[idx].description = val;
                    updateField('services.cards', cards);
                  }}
                  className="text-gray-500 text-xs md:text-sm font-light leading-relaxed flex-grow"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits of Repair Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <EditableImage
              src={data.repairBenefits.image}
              alt="Professional Repair Work"
              className="rounded-[2rem] shadow-2xl w-full aspect-[4/3]"
              isEditMode={isEditMode}
              onUpload={(base64) => updateField('repairBenefits.image', base64)}
            />
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 space-y-8">
            <div>
              <div className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Service Advantages</div>
              <EditableText
                text={data.repairBenefits.title || "The Benefits of Professional Repair"}
                isEditMode={isEditMode}
                onBlur={(val) => updateField('repairBenefits.title', val)}
                className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 leading-tight"
                as="h2"
              />
            </div>
            <div className="space-y-6">
              {data.repairBenefits.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <IconRenderer name={item.icon || 'shield-check'} className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      text={item.title}
                      isEditMode={isEditMode}
                      onBlur={(val) => {
                        const items = [...data.repairBenefits.items];
                        items[idx].title = val;
                        updateField('repairBenefits.items', items);
                      }}
                      className="text-sm font-bold text-gray-900 mb-1"
                      as="h4"
                    />
                    <EditableText
                      text={item.description}
                      isEditMode={isEditMode}
                      onBlur={(val) => {
                        const items = [...data.repairBenefits.items];
                        items[idx].description = val;
                        updateField('repairBenefits.items', items);
                      }}
                      className="text-xs text-gray-500 font-light leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-10 md:py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-2">
              <UserCheck size={12} /> Local Commitment
            </div>
            <EditableText
              text={data.aboutUs.title}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('aboutUs.title', val)}
              className="text-2xl md:text-3xl font-bold tracking-tighter mb-4 leading-tight"
              as="h2"
            />
            <EditableText
              text={data.aboutUs.content}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('aboutUs.content', val)}
              className="text-gray-600 text-xs md:text-sm font-light leading-relaxed mb-6"
            />
            <a 
              href={`tel:${data.contact.phone}`}
              className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-xl uppercase text-[10px] tracking-tighter"
            >
              Get an estimate
            </a>
          </div>
          <div className="relative">
            <EditableImage
              src={data.aboutUs.image}
              alt="About Us"
              className="rounded-[1.5rem] shadow-lg aspect-video md:aspect-[4/3]"
              isEditMode={isEditMode}
              onUpload={(base64) => updateField('aboutUs.image', base64)}
            />
          </div>
        </div>
      </section>

      {/* Practical Value Section */}
      <section className="py-10 md:py-16 px-6 md:px-12 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <EditableText
              text="Practical Value & Protection"
              isEditMode={isEditMode}
              onBlur={() => {}}
              className="text-2xl md:text-3xl font-bold tracking-tighter mb-2 uppercase"
              as="h2"
            />
            <div className="h-0.5 w-12 bg-blue-500 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.additionalBenefits.cards.map((benefit, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-[1.5rem] flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white mb-6">
                  <CheckCircle size={20} />
                </div>
                <EditableText
                  text={benefit.title}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.additionalBenefits.cards];
                    cards[idx].title = val;
                    updateField('additionalBenefits.cards', cards);
                  }}
                  className="text-lg font-bold mb-3 tracking-tight"
                  as="h3"
                />
                <EditableText
                  text={benefit.description}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.additionalBenefits.cards];
                    cards[idx].description = val;
                    updateField('additionalBenefits.cards', cards);
                  }}
                  className="text-gray-400 text-xs font-light leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 md:py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-3">
            <HelpCircle size={14} /> Common Questions
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8">Service FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2">
                <EditableText
                  text={faq.question}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const faqs = [...data.faqs];
                    faqs[idx].question = val;
                    updateField('faqs', faqs);
                  }}
                  className="text-sm font-bold tracking-tight text-gray-900"
                  as="h4"
                />
                <EditableText
                  text={faq.answer}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const faqs = [...data.faqs];
                    faqs[idx].answer = val;
                    updateField('faqs', faqs);
                  }}
                  className="text-xs font-light text-gray-500 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Removed */}
    </div>
  );
};

export default SiteRenderer;
