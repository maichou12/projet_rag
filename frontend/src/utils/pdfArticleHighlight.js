import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDF_URL = '/CODE-DE-LA-FAMILLE.pdf';

function toPageNumber(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function itemRect(item, viewport) {
  const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
  const fontHeight = Math.hypot(transform[2], transform[3]);
  const width = Math.max(item.width * viewport.scale, fontHeight * 0.5);
  return {
    left: transform[4],
    top: transform[5] - fontHeight,
    width,
    height: fontHeight * 1.15,
  };
}

function mergeRects(rects) {
  if (!rects.length) return null;
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.left + r.width));
  const bottom = Math.max(...rects.map((r) => r.top + r.height));
  return { left, top, width: right - left, height: bottom - top };
}

function findArticleRects(textContent, viewport, articleId) {
  const items = textContent.items.filter((item) => 'str' in item && item.str.trim());
  const highlights = [];
  const id = String(articleId);
  const patterns = [
    new RegExp(`^Article\\s+${id}\\b`, 'i'),
    new RegExp(`^Art\\.?\\s*${id}\\b`, 'i'),
  ];

  for (let i = 0; i < items.length; i += 1) {
    for (let len = 1; len <= 5 && i + len <= items.length; len += 1) {
      const slice = items.slice(i, i + len);
      const combined = slice.map((s) => s.str).join('').trim();
      if (!patterns.some((p) => p.test(combined))) continue;

      const rect = mergeRects(slice.map((item) => itemRect(item, viewport)));
      if (rect) highlights.push(rect);
      break;
    }
  }

  return highlights;
}

async function renderPageWithHighlight(page, articleId, scale) {
  const viewport = page.getViewport({ scale });
  const textContent = await page.getTextContent();
  const highlights = findArticleRects(textContent, viewport, articleId);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return { canvas, viewport, highlights };
}

export async function loadArticlePage(articleId, startPage, scale = 1.5) {
  const start = toPageNumber(startPage);
  if (!start) {
    throw new Error('Numéro de page invalide');
  }

  const pdf = await pdfjsLib.getDocument({ url: PDF_URL }).promise;
  const totalPages = pdf.numPages;
  const pagesToTry = [start, start - 1, start + 1].filter(
    (p) => p >= 1 && p <= totalPages,
  );

  let fallback = null;

  for (const pageNum of pagesToTry) {
    const page = await pdf.getPage(pageNum);
    const result = await renderPageWithHighlight(page, articleId, scale);
    if (result.highlights.length > 0) {
      return { ...result, pageNum, found: true };
    }
    if (pageNum === start) {
      fallback = { ...result, pageNum, found: false };
    }
  }

  if (fallback) return fallback;

  const page = await pdf.getPage(start);
  return { ...(await renderPageWithHighlight(page, articleId, scale)), pageNum: start, found: false };
}
