import { GeneratedSiteData } from '../types.js';

export interface AiEditResult {
  success: boolean;
  data?: GeneratedSiteData;
  error?: string;
}

export const applyAiEdit = async (
  instruction: string,
  currentSiteData: GeneratedSiteData
): Promise<AiEditResult> => {
  const strippedData = stripImageData(currentSiteData);

  const response = await fetch('/api/ai-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instruction,
      currentSiteData: strippedData,
      contactInfo: currentSiteData.contact,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    return { success: false, error: err.error || `Server error (${response.status})` };
  }

  const result = await response.json();

  if (result.success && result.data) {
    const restoredData = restoreImageData(result.data, currentSiteData);
    return { success: true, data: restoredData };
  }

  return { success: false, error: result.error || 'No data returned' };
};

function stripImageData(data: GeneratedSiteData): any {
  const stripped = JSON.parse(JSON.stringify(data));
  if (stripped.hero) stripped.hero.heroImage = '[PRESERVED]';
  if (stripped.valueProposition) stripped.valueProposition.image = '[PRESERVED]';
  if (stripped.whoWeHelp) stripped.whoWeHelp.image = '[PRESERVED]';
  if (stripped.gallery?.images) {
    stripped.gallery.images = stripped.gallery.images.map(
      (img: string | null) => img ? '[PRESERVED]' : null
    );
  }
  return stripped;
}

function restoreImageData(newData: any, originalData: GeneratedSiteData): GeneratedSiteData {
  if (originalData.hero?.heroImage) {
    newData.hero.heroImage = originalData.hero.heroImage;
  }
  if (originalData.valueProposition?.image) {
    newData.valueProposition.image = originalData.valueProposition.image;
  }
  if (originalData.whoWeHelp?.image) {
    newData.whoWeHelp.image = originalData.whoWeHelp.image;
  }
  if (originalData.gallery) {
    newData.gallery = originalData.gallery;
  }
  newData.contact = originalData.contact;
  return newData as GeneratedSiteData;
}
