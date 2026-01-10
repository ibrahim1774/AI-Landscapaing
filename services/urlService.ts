
/**
 * Generates a clean, deterministic slug from a company name.
 * Format: {company-name}-business
 */
export const generateSlug = (companyName: string): string => {
    if (!companyName) return 'site-' + Math.random().toString(36).substring(7);

    return companyName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
        .concat('-business');
};
