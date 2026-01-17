export const getColorHex = (colorName: string): string | null => {
    if (!colorName) return null;

    const lower = colorName.toLowerCase().trim();

    const colorMap: Record<string, string> = {
        // Metals & Wheel Colors
        'gold': '#D4AF37',
        'silver': '#C0C0C0',
        'bronze': '#CD7F32',
        'gunmetal': '#2a2a2a',
        'titanium': '#878681',
        'chrome': '#E8E8E8',
        'hyper black': '#1A1A1A',
        'matte black': '#181818',
        'gloss black': '#000000',
        'black': '#000000',
        'white': '#FFFFFF',

        // Standard Colors
        'red': '#EF4444',
        'blue': '#3B82F6',
        'green': '#22C55E',
        'yellow': '#EAB308',
        'orange': '#F97316',
        'purple': '#A855F7',
        'pink': '#EC4899',

        // Variations
        'merah': '#EF4444',
        'biru': '#3B82F6',
        'kuning': '#EAB308',
        'hijau': '#22C55E',
        'hitam': '#000000',
        'putih': '#FFFFFF',
        'emas': '#D4AF37',
        'perak': '#C0C0C0',
    };

    // Direct match
    if (colorMap[lower]) return colorMap[lower];

    // Partial match for specific complex names (heuristic)
    if (lower.includes('gold')) return colorMap['gold'];
    if (lower.includes('silver')) return colorMap['silver'];
    if (lower.includes('bronze')) return colorMap['bronze'];
    if (lower.includes('black') || lower.includes('hitam')) return colorMap['black'];
    if (lower.includes('white') || lower.includes('putih')) return colorMap['white'];
    if (lower.includes('red') || lower.includes('merah')) return colorMap['red'];
    if (lower.includes('blue') || lower.includes('biru')) return colorMap['blue'];

    return null; // Return null if no confident match
};
