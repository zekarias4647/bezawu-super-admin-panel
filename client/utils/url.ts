export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&h=128&fit=crop'; // Default fallback

    if (path.startsWith('http')) return path;

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // If the path already includes 'uploads/', don't double it
    const finalPath = cleanPath.includes('uploads/') ? cleanPath : `uploads/${cleanPath}`;

    return `https://onboardingapi.ristestate.com/${finalPath}`;
};
