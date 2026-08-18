import { LEVEL_COLORS } from "../lib/stats";

type FaceProps = {
  level: number; // 1..5
  className?: string;
  selected?: boolean;
};

/**
 * Inline SVG faces (consistent cross-platform, no emoji rendering differences).
 * Mouth curvature and eye openness encode the emotion.
 */
export default function Face({ level, className = "", selected = false }: FaceProps) {
  const color = LEVEL_COLORS[level - 1];
  // mouth path: frown (1) → big smile (5)
  const mouths = [
    "M 14 32 Q 20 24 26 32", // frown
    "M 14 30 Q 20 25 26 30", // slight frown
    "M 14 29 L 26 29", // flat
    "M 14 28 Q 20 33 26 28", // slight smile
    "M 13 26 Q 20 35 27 26", // big smile
  ];
  const eyes = [
    "M 15 21 L 19 21 M 21 21 L 25 21", // closed (sad)
    "M 15 20 L 19 20 M 21 20 L 25 20", // closed
    "M 15 21 q 2 -2.5 4 0 M 21 21 q 2 -2.5 4 0", // neutral open
    "M 15 21 q 2 -2.5 4 0 M 21 21 q 2 -2.5 4 0", // open
    "M 14.5 20 q 2.5 -3 5 0 M 20.5 20 q 2.5 -3 5 0", // wide happy
  ];
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-hidden={!selected}
      aria-label={selected ? undefined : undefined}
    >
      <circle cx="20" cy="20" r="18" fill={color} opacity={selected ? 0.25 : 0.12} />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke={color} strokeWidth="2" />
      <path d={eyes[level - 1]} stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d={mouths[level - 1]} stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
