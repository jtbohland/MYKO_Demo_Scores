import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type Badge = { emoji: string; label: string };

type Props = {
  badges: Badge[];
  gotAll3: boolean;
};

/**
 * Fires emoji confetti on mount. The emojis in the confetti match
 * the exact badges the person earned — additive across categories.
 */
export default function ConfettiLauncher({ badges, gotAll3 }: Props) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Pull emojis directly from the earned badges
    const emojis = badges.map((b) => b.emoji);
    if (emojis.length === 0) emojis.push("👏");

    // Create confetti shapes from the earned emojis
    const shapes = emojis.map((e) => confetti.shapeFromText({ text: e, scalar: 2 }));

    // Intensity scales with how many badges earned
    const badgeCount = badges.length;
    const intensity = gotAll3 ? 1.0 : badgeCount >= 3 ? 0.8 : badgeCount >= 2 ? 0.6 : 0.4;

    // More bursts for more achievements — satisfying ~3s celebration
    const burstCount = gotAll3 ? 5 : badgeCount >= 3 ? 4 : badgeCount >= 2 ? 3 : 2;
    const burstInterval = 600;

    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        // Left side burst
        confetti({
          particleCount: Math.round(25 * intensity),
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.6 },
          shapes,
          scalar: 1.8,
          gravity: 0.8,
          ticks: 250,
          drift: 0.5,
        });

        // Right side burst
        confetti({
          particleCount: Math.round(25 * intensity),
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.6 },
          shapes,
          scalar: 1.8,
          gravity: 0.8,
          ticks: 250,
          drift: -0.5,
        });

        // Center burst
        if (badgeCount >= 2) {
          confetti({
            particleCount: Math.round(15 * intensity),
            angle: 90,
            spread: 100,
            origin: { x: 0.5, y: 0.4 },
            shapes,
            scalar: 2.0,
            gravity: 0.7,
            ticks: 300,
          });
        }
      }, i * burstInterval);
    }

    // Grand finale for ALL THREE
    if (gotAll3) {
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 90,
          spread: 120,
          origin: { x: 0.5, y: 0.5 },
          shapes,
          scalar: 2.2,
          gravity: 0.6,
          ticks: 350,
        });
      }, burstCount * burstInterval + 200);
    }
  }, [badges, gotAll3]);

  return null;
}
