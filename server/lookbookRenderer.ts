import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from './catalogueSeed.js';

const imageCache = new Map<string, string>();

function getBase64Photo(relPath: string): string {
  if (imageCache.has(relPath)) {
    return imageCache.get(relPath)!;
  }
  try {
    const absPath = path.resolve(process.cwd(), relPath.replace(/^\//, ''));
    const buf = fs.readFileSync(absPath);
    const dataUri = `data:image/jpeg;base64,${buf.toString('base64')}`;
    imageCache.set(relPath, dataUri);
    return dataUri;
  } catch {
    return '';
  }
}

interface PhotoRecipe {
  basePhoto: string;
  viewBoxCrop: string;
  tintHex: string;
  tintOpacity: number;
  blendMode: string;
  brightness: number;
  contrast: number;
  saturate: number;
  plateCode: string;
}

const PHOTO_RECIPES: Record<string, PhotoRecipe> = {
  'eko-poplin-shirt': {
    basePhoto: '/src/assets/images/product_nia_draped_top_1790917140380.jpg',
    viewBoxCrop: '45 30 810 1080',
    tintHex: '#F5F2EB',
    tintOpacity: 0.16,
    blendMode: 'soft-light',
    brightness: 1.06,
    contrast: 1.04,
    saturate: 0.82,
    plateCode: 'LOOK 05 · SHIRTING',
  },
  'imani-bias-skirt': {
    basePhoto: '/src/assets/images/product_sade_column_dress_1790917152807.jpg',
    viewBoxCrop: '60 210 780 990',
    tintHex: '#423127',
    tintOpacity: 0.22,
    blendMode: 'multiply',
    brightness: 0.98,
    contrast: 1.08,
    saturate: 0.9,
    plateCode: 'LOOK 06 · BIAS SATIN',
  },
  'kemi-wrap-dress': {
    basePhoto: '/src/assets/images/product_sade_column_dress_1790917152807.jpg',
    viewBoxCrop: '30 40 840 1120',
    tintHex: '#9C5B34',
    tintOpacity: 0.34,
    blendMode: 'color',
    brightness: 1.05,
    contrast: 1.04,
    saturate: 1.1,
    plateCode: 'LOOK 07 · OCHRE LINEN',
  },
  'zainab-sculpted-blazer': {
    basePhoto: '/src/assets/images/hero_campaign_aw26_1790917116291.jpg',
    viewBoxCrop: '280 20 680 900',
    tintHex: '#2B2927',
    tintOpacity: 0.28,
    blendMode: 'multiply',
    brightness: 0.95,
    contrast: 1.12,
    saturate: 0.75,
    plateCode: 'LOOK 08 · TAILORING',
  },
  'amina-loomed-overshirt': {
    basePhoto: '/src/assets/images/editorial_atelier_lagos_1790917127723.jpg',
    viewBoxCrop: '120 0 760 1013',
    tintHex: '#DFD7C8',
    tintOpacity: 0.14,
    blendMode: 'soft-light',
    brightness: 1.03,
    contrast: 1.05,
    saturate: 0.92,
    plateCode: 'LOOK 09 · ISEYIN ASO-OKE',
  },
  'yemi-pleated-tunic': {
    basePhoto: '/src/assets/images/product_nia_draped_top_1790917140380.jpg',
    viewBoxCrop: '0 80 900 1120',
    tintHex: '#C5B8A5',
    tintOpacity: 0.28,
    blendMode: 'multiply',
    brightness: 0.97,
    contrast: 1.06,
    saturate: 0.88,
    plateCode: 'LOOK 10 · KNIFE PLEAT',
  },
  'bisi-architectural-trench': {
    basePhoto: '/src/assets/images/hero_campaign_aw26_1790917116291.jpg',
    viewBoxCrop: '180 0 720 960',
    tintHex: '#C6BCA9',
    tintOpacity: 0.22,
    blendMode: 'soft-light',
    brightness: 1.02,
    contrast: 1.07,
    saturate: 0.85,
    plateCode: 'LOOK 11 · GABARDINE COAT',
  },
  'amara-asymmetric-slip': {
    basePhoto: '/src/assets/images/product_sade_column_dress_1790917152807.jpg',
    viewBoxCrop: '75 90 750 1000',
    tintHex: '#8A482B',
    tintOpacity: 0.38,
    blendMode: 'color',
    brightness: 1.04,
    contrast: 1.06,
    saturate: 1.15,
    plateCode: 'LOOK 12 · SIENNA GEORGETTE',
  },
  'oluwa-tailored-culotte': {
    basePhoto: '/src/assets/images/product_tolu_wide_trouser_1790917162690.jpg',
    viewBoxCrop: '50 140 800 1060',
    tintHex: '#1C1B1A',
    tintOpacity: 0.42,
    blendMode: 'multiply',
    brightness: 0.88,
    contrast: 1.16,
    saturate: 0.65,
    plateCode: 'LOOK 13 · VIRGIN WOOL',
  },
  'femi-knot-crossbody': {
    basePhoto: '/src/assets/images/product_dara_structured_bag_1790917173757.jpg',
    viewBoxCrop: '90 110 720 960',
    tintHex: '#1B1512',
    tintOpacity: 0.34,
    blendMode: 'multiply',
    brightness: 0.92,
    contrast: 1.14,
    saturate: 0.8,
    plateCode: 'LOOK 14 · GRAINED CALFSKIN',
  },
};

export function renderEditorialPhotoSvg(slug: string): string {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);
  const recipe = PHOTO_RECIPES[slug] || {
    basePhoto: '/src/assets/images/product_nia_draped_top_1790917140380.jpg',
    viewBoxCrop: '0 0 900 1200',
    tintHex: product?.colour_hex || '#EAE4D8',
    tintOpacity: 0.15,
    blendMode: 'soft-light',
    brightness: 1,
    contrast: 1.05,
    saturate: 0.95,
    plateCode: 'AYÉ STUDIO · AW26',
  };

  const dataUri = getBase64Photo(recipe.basePhoto);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${recipe.viewBoxCrop}" width="900" height="1200" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="grade-${slug}">
      <feColorMatrix type="saturate" values="${recipe.saturate}" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="${recipe.contrast}" intercept="${(recipe.brightness - 1) * 0.5}" />
        <feFuncG type="linear" slope="${recipe.contrast}" intercept="${(recipe.brightness - 1) * 0.5}" />
        <feFuncB type="linear" slope="${recipe.contrast}" intercept="${(recipe.brightness - 1) * 0.5}" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect x="0" y="0" width="1200" height="1400" fill="#EAE5DC" />
  ${
    dataUri
      ? `<image href="${dataUri}" x="0" y="0" width="900" height="1200" preserveAspectRatio="xMidYMid slice" filter="url(#grade-${slug})" />`
      : ''
  }
  <rect x="0" y="0" width="1200" height="1400" fill="${recipe.tintHex}" fill-opacity="${recipe.tintOpacity}" style="mix-blend-mode: ${recipe.blendMode};" />
</svg>`;
}

export function renderLookbookPlateSvg(slug: string, view: string): string {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug) || INITIAL_PRODUCTS[0];
  const skuPrefix = product.variants[0]?.sku?.split('-').slice(0, 3).join('-') || 'AYE-AW26';

  if (view === 'textile') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
  <defs>
    <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 0 4 L 8 4 M 4 0 L 4 8" stroke="#161514" stroke-width="0.45" stroke-opacity="0.14"/>
    </pattern>
    <pattern id="finegrain" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="2" height="2" fill="#161514" fill-opacity="0.04"/>
      <rect x="2" y="2" width="2" height="2" fill="#161514" fill-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="900" height="1200" fill="#F3EFE8"/>
  <rect x="64" y="64" width="772" height="1072" fill="none" stroke="#161514" stroke-opacity="0.15" stroke-width="1"/>
  
  <text x="104" y="118" font-family="IBM Plex Mono, monospace" font-size="12" fill="#5A4638" letter-spacing="2.5">${skuPrefix} · MATERIAL ARCHIVE</text>
  <text x="796" y="118" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="12" fill="#5A4638" letter-spacing="2">VICTORIA ISLAND ATELIER</text>
  <line x1="104" y1="138" x2="796" y2="138" stroke="#161514" stroke-opacity="0.12" stroke-width="1"/>

  <g transform="translate(150, 210)">
    <rect x="16" y="16" width="600" height="620" fill="#D8D1C5" fill-opacity="0.5"/>
    <rect x="0" y="0" width="600" height="620" fill="${product.colour_hex}" stroke="#161514" stroke-opacity="0.18" stroke-width="1"/>
    <rect x="0" y="0" width="600" height="620" fill="url(#weave)"/>
    <rect x="0" y="0" width="600" height="620" fill="url(#finegrain)"/>
    <line x1="0" y1="490" x2="600" y2="170" stroke="#F7F5F0" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="6 6"/>
    <line x1="90" y1="0" x2="90" y2="620" stroke="#F7F5F0" stroke-opacity="0.12" stroke-width="1"/>
    <rect x="36" y="510" width="250" height="74" fill="#F7F5F0" stroke="#161514" stroke-opacity="0.15"/>
    <text x="54" y="540" font-family="IBM Plex Mono, monospace" font-size="11" fill="#5A4638" letter-spacing="1.5">DYE LOT / SHADE</text>
    <text x="54" y="564" font-family="Cormorant Garamond, Georgia, serif" font-size="22" fill="#161514">${product.colour.toUpperCase()}</text>
  </g>

  <text x="104" y="925" font-family="Cormorant Garamond, Georgia, serif" font-size="34" fill="#161514">${product.name}</text>
  <text x="104" y="958" font-family="Plus Jakarta Sans, sans-serif" font-size="14" fill="#5A4638">${product.composition.slice(0, 78)}</text>
  <line x1="104" y1="988" x2="796" y2="988" stroke="#161514" stroke-opacity="0.12"/>
  <text x="104" y="1024" font-family="IBM Plex Mono, monospace" font-size="11" fill="#5A4638" letter-spacing="1.5">CARE: ${product.care.slice(0, 68).toUpperCase()}</text>
  <text x="104" y="1052" font-family="IBM Plex Mono, monospace" font-size="11" fill="#5A4638" letter-spacing="1.5">ORIGIN: LAGOS, NIGERIA · AUTUMN / WINTER COLLECTION</text>
</svg>`;
  }

  let silhouettePaths = '';
  if (product.category === 'Dresses') {
    silhouettePaths = `
      <path d="M 360 230 L 415 215 L 450 245 L 485 215 L 540 230 L 575 885 L 325 885 Z" fill="${product.colour_hex}" fill-opacity="0.88" stroke="#161514" stroke-width="1.5"/>
      <path d="M 352 410 L 555 680" stroke="#F7F5F0" stroke-opacity="0.45" stroke-width="1.2" stroke-dasharray="5 5"/>
      <path d="M 450 245 L 450 885" stroke="#161514" stroke-opacity="0.25" stroke-width="1"/>
    `;
  } else if (product.category === 'Trousers & Skirts') {
    silhouettePaths = `
      <path d="M 345 260 L 555 260 L 595 875 L 468 875 L 450 470 L 432 875 L 305 875 Z" fill="${product.colour_hex}" fill-opacity="0.88" stroke="#161514" stroke-width="1.5"/>
      <line x1="345" y1="295" x2="555" y2="295" stroke="#161514" stroke-width="1.2"/>
      <line x1="395" y1="295" x2="380" y2="850" stroke="#161514" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="4 4"/>
      <line x1="505" y1="295" x2="520" y2="850" stroke="#161514" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="4 4"/>
    `;
  } else if (product.category === 'Leather Goods') {
    silhouettePaths = `
      <path d="M 370 430 C 370 260, 530 260, 530 430" fill="none" stroke="#161514" stroke-width="8"/>
      <polygon points="285,430 615,430 575,755 325,755" fill="${product.colour_hex}" stroke="#161514" stroke-width="1.8"/>
      <line x1="305" y1="490" x2="595" y2="490" stroke="#D8D2C7" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="4 4"/>
      <circle cx="370" cy="455" r="5" fill="#B89758"/>
      <circle cx="530" cy="455" r="5" fill="#B89758"/>
    `;
  } else if (product.category === 'Outerwear') {
    silhouettePaths = `
      <path d="M 320 250 L 410 220 L 450 295 L 490 220 L 580 250 L 635 640 L 575 655 L 545 390 L 555 820 L 345 820 L 355 390 L 325 655 L 265 640 Z" fill="${product.colour_hex}" fill-opacity="0.9" stroke="#161514" stroke-width="1.5"/>
      <line x1="450" y1="295" x2="450" y2="820" stroke="#161514" stroke-width="1.2"/>
      <line x1="375" y1="560" x2="425" y2="560" stroke="#161514" stroke-width="1.5"/>
      <line x1="475" y1="560" x2="525" y2="560" stroke="#161514" stroke-width="1.5"/>
    `;
  } else {
    silhouettePaths = `
      <path d="M 335 265 L 405 235 C 435 275, 475 260, 505 235 L 565 265 L 605 565 L 545 580 L 525 385 L 535 745 L 365 745 L 375 385 L 355 580 L 295 565 Z" fill="${product.colour_hex}" fill-opacity="0.9" stroke="#161514" stroke-width="1.5"/>
      <path d="M 390 250 Q 455 345 525 265" fill="none" stroke="#161514" stroke-opacity="0.4" stroke-width="1.2"/>
      <line x1="365" y1="510" x2="535" y2="450" stroke="#161514" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="5 5"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
  <rect width="900" height="1200" fill="#EFECE5"/>
  <g stroke="#161514" stroke-opacity="0.06" stroke-width="1">
    <line x1="150" y1="160" x2="750" y2="160"/>
    <line x1="150" y1="360" x2="750" y2="360"/>
    <line x1="150" y1="560" x2="750" y2="560"/>
    <line x1="150" y1="760" x2="750" y2="760"/>
    <line x1="150" y1="920" x2="750" y2="920"/>
    <line x1="250" y1="160" x2="250" y2="920"/>
    <line x1="450" y1="160" x2="450" y2="920"/>
    <line x1="650" y1="160" x2="650" y2="920"/>
  </g>
  <rect x="64" y="64" width="772" height="1072" fill="none" stroke="#161514" stroke-opacity="0.16" stroke-width="1"/>
  <text x="104" y="116" font-family="IBM Plex Mono, monospace" font-size="12" fill="#5A4638" letter-spacing="2">${skuPrefix} · PATTERN &amp; PROPORTION STUDY</text>
  <text x="796" y="116" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="12" fill="#5A4638" letter-spacing="2">SCALE 1:8</text>
  
  ${silhouettePaths}

  <line x1="245" y1="230" x2="245" y2="875" stroke="#5A4638" stroke-opacity="0.45" stroke-width="1"/>
  <line x1="238" y1="230" x2="252" y2="230" stroke="#5A4638" stroke-opacity="0.45" stroke-width="1"/>
  <line x1="238" y1="875" x2="252" y2="875" stroke="#5A4638" stroke-opacity="0.45" stroke-width="1"/>
  
  <text x="104" y="995" font-family="Cormorant Garamond, Georgia, serif" font-size="32" fill="#161514">${product.name} — Atelier Spec</text>
  <text x="104" y="1028" font-family="Plus Jakarta Sans, sans-serif" font-size="14" fill="#5A4638">${product.subtitle}</text>
  <text x="104" y="1068" font-family="IBM Plex Mono, monospace" font-size="11" fill="#5A4638" letter-spacing="1.5">CATEGORY: ${product.category.toUpperCase()} · SHADE: ${product.colour.toUpperCase()}</text>
</svg>`;
}
