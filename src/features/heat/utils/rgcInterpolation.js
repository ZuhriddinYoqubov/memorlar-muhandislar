export const RGC_TABLE_4_POINTS = [
  { x: 3, RGC: 1.57 },
  { x: 4, RGC: 1.85 },
  { x: 5, RGC: 2.2 },
  { x: 6, RGC: 2.4 },
  { x: 8, RGC: 3.0 },
  { x: 10, RGC: 3.3 },
  { x: 12, RGC: 3.8 },
  { x: 15, RGC: 4.4 },
  { x: 20, RGC: 5.2 },
  { x: 25, RGC: 6.0 },
];

export const calculateGeometricX = (a, b) => {
  const aNum = Number(a);
  const bNum = Number(b);
  if (!Number.isFinite(aNum) || !Number.isFinite(bNum) || aNum <= 0 || bNum <= 0) return null;
  const denom = aNum + bNum;
  if (denom === 0) return null;
  return (aNum * bNum) / denom;
};

export const linearInterpolate = (x, x1, y1, x2, y2) => {
  if (!Number.isFinite(x) || !Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
    return null;
  }
  if (x2 === x1) return y1;
  return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
};

export const calculateRgcFromTable4 = (a, b, points = RGC_TABLE_4_POINTS) => {
  const x = calculateGeometricX(a, b);
  if (x == null) return { x: null, RGC: null };

  const sorted = [...points]
    .filter((p) => Number.isFinite(Number(p?.x)) && Number.isFinite(Number(p?.RGC)))
    .map((p) => ({ x: Number(p.x), RGC: Number(p.RGC) }))
    .sort((p1, p2) => p1.x - p2.x);

  if (sorted.length === 0) return { x, RGC: null };

  if (x <= sorted[0].x) return { x, RGC: sorted[0].RGC };
  if (x >= sorted[sorted.length - 1].x) return { x, RGC: sorted[sorted.length - 1].RGC };

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (x >= p1.x && x <= p2.x) {
      const RGC = linearInterpolate(x, p1.x, p1.RGC, p2.x, p2.RGC);
      return { x, RGC };
    }
  }

  return { x, RGC: null };
};
