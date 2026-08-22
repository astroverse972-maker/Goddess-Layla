/**
 * Security & Sanitization Utility for Media Assets
 * Ensures confidential Google Drive links, URLs, and storage paths are never leaked in public UI titles/descriptions.
 */

export function isUrlOrDriveLink(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('dropbox.com') ||
    trimmed.includes('mega.nz') ||
    trimmed.includes('usp=drive_link') ||
    trimmed.includes('/file/d/')
  );
}

export function cleanDisplayTitle(
  title?: string | null,
  fallback = 'Exclusive Masterclass Archive'
): string {
  if (!title || typeof title !== 'string') return fallback;
  const trimmed = title.trim();
  if (!trimmed || isUrlOrDriveLink(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function cleanDisplayDescription(
  desc?: string | null,
  fallback = 'Exclusive encrypted masterclass video archive for authorized devotees.'
): string {
  if (!desc || typeof desc !== 'string') return fallback;
  const trimmed = desc.trim();
  if (!trimmed || isUrlOrDriveLink(trimmed)) {
    return fallback;
  }
  // Strip any accidental inline private drive links
  const sanitized = trimmed
    .replace(/https?:\/\/(?:drive\.google\.com|docs\.google\.com|[\w.-]+\/file\/d\/)[^\s]+/gi, '')
    .trim();
  return sanitized || fallback;
}

export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                url.match(/id=([a-zA-Z0-9_-]+)/) || 
                url.match(/open\?id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
