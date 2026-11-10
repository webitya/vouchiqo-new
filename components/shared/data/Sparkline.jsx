/**
 * Smooth bezier-curve sparkline with a gradient area fill.
 *
 * Extracted verbatim from the byte-identical copies that were defined inline
 * in BOTH the merchant and admin dashboards. Token-neutral — the stroke /
 * fill colour is passed via `color` so it works in both the shadcn-token and
 * brand-token contexts.
 *
 * @param {number[]} points - the data series
 * @param {string}   color  - hex/rgb stroke + fill colour
 * @param {string}   id     - unique id for the SVG gradient (must be unique per chart)
 */
export default function Sparkline({
  points = [],
  color = "#2563eb",
  id = "revenue",
}) {
  if (points.length === 0) return null;

  const W = 292;
  const H = 48;
  const yMin = 4;
  const yMax = 44;

  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;

  const pts = points.map((val, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = yMax - ((val - minVal) / range) * (yMax - yMin);
    return { x, y };
  });

  let lineD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + ((p1.x - p0.x) * 2) / 3;
    const cpY2 = p1.y;
    lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${lineD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full display-block overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        strokeWidth="1.5"
        fill={`url(#gradient-${id})`}
        fillOpacity="0.6"
        stroke="none"
        d={areaD}
      />
      <path
        strokeWidth="1.5"
        fill="none"
        fillOpacity="0.6"
        stroke={color}
        d={lineD}
      />
    </svg>
  );
}
