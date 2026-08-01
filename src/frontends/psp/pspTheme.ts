import { buildPalette } from "@menu/settings/palette";

// The curated set of wave colours for the PSP frontend (the only colours). The
// engine sorts them into the VIBGYOR ramp; the concrete list lives here.
const RAW_WAVE_COLORS: string[] = [
  "7C3030", "722F37", "9A2A2A", "D2042D", "C04000", "FF7518", "F08000",
  "F28C28", "FFA500", "FFAA33", "FA5F55", "E3735E", "FA8072", "F89880", "E37383",
  "FFC0CB", "808000", "C9CC3F", "DFFF00", "FFBF00", "F0E68C", "FFFF8F", "C19A6B",
  "C4A484", "C2B280", "FFE5B4", "FAD5A5", "F5DEB3", "F3E5AB", "FFFDD0", "483C32",
  "5C4033", "834333", "6F4E37", "967969", "454B1B", "8A9A5B", "93C572", "C1E1C1",
  "ECFFDC", "1434A4", "6495ED", "CCCCFF", "CBC3E3", "343434",
];

export const pspPalette = buildPalette(RAW_WAVE_COLORS);

/** Default wave colour for a fresh visitor (rose). */
export const pspDefaultColor = "E37383";

/** Top-left wordmark. */
export const pspWordmark = "hvrc · place";
