import fs from "node:fs";
import sharp from "sharp";

async function run() {
  // 1. Backup original logo if not already backed up
  if (!fs.existsSync("public/navbarlogovouchiqo-orig.webp")) {
    fs.copyFileSync(
      "public/navbarlogovouchiqo.webp",
      "public/navbarlogovouchiqo-orig.webp",
    );
    console.log("Backed up original logo to navbarlogovouchiqo-orig.webp");
  }

  // 2. Resize and optimize navbar logo
  await sharp("public/navbarlogovouchiqo-orig.webp")
    .resize(480, 160, { fit: "inside" })
    .webp({ quality: 85, effort: 6 })
    .toFile("public/navbarlogovouchiqo.webp");

  const newSize = fs.statSync("public/navbarlogovouchiqo.webp").size;
  console.log(
    "Optimized navbarlogovouchiqo.webp size:",
    (newSize / 1024).toFixed(1),
    "KB",
  );

  // 3. Generate placeholder-brand.webp
  const svgPlaceholder = Buffer.from(
    `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="24" fill="#f8fafc" />
      <rect x="1" y="1" width="198" height="198" rx="23" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <g transform="translate(70, 60)" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </g>
      <text x="100" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748b" text-anchor="middle">VOUCHIQO</text>
    </svg>`,
  );

  await sharp(svgPlaceholder)
    .webp({ quality: 90 })
    .toFile("public/placeholder-brand.webp");

  // Also copy to placeholder-brand.png for any legacy references
  await sharp(svgPlaceholder)
    .png({ quality: 90 })
    .toFile("public/placeholder-brand.png");

  const placeholderSize = fs.statSync("public/placeholder-brand.webp").size;
  console.log(
    "Generated placeholder-brand.webp size:",
    (placeholderSize / 1024).toFixed(1),
    "KB",
  );
  console.log("Generated placeholder-brand.png for legacy compatibility.");
}

run().catch(console.error);
