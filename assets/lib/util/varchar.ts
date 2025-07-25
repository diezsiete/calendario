export const toSlug = (str: string): string => str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')    // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-')    // Replace multiple - with single -
    .replace(/^-+/, '')      // Trim - from start of text
    .replace(/-+$/, '');     // Trim - from end of text

export const ucfirst = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);