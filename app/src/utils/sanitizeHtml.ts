// ============================================================
// sanitizeHtml — XSS sanitization using DOMPurify
// ============================================================

import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Uses DOMPurify to remove malicious tags and attributes.
 *
 * @param dirtyHtml - The potentially unsafe HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for injection via dangerouslySetInnerHTML
 *
 * @example
 *   const clean = sanitizeHtml(userInput);
 *   return <div dangerouslySetInnerHTML={{ __html: clean }} />;
 */
export function sanitizeHtml(dirtyHtml: string, options?: Config): string {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback - strip all HTML tags
    return dirtyHtml.replace(/<[^>]*>?/gm, '');
  }
  const clean = DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ...options,
  });
  return String(clean);
}

/**
 * Escape special HTML characters to prevent injection.
 * Use this when you need plain text rendering, not rich HTML.
 *
 * @param text - Raw text that may contain HTML
 * @returns Escaped string safe for insertion as textContent
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize markdown-generated HTML with a restricted tag whitelist.
 * Use this when rendering markdown content to HTML.
 *
 * @param dirtyHtml - The potentially unsafe HTML string from markdown rendering
 * @returns Sanitized HTML string safe for injection via dangerouslySetInnerHTML
 */
export function sanitizeMarkdownHtml(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre',
      'blockquote', 'a', 'img', 'del', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
  });
}
