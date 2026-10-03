import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDataDir } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = getDataDir();
export const MEDIA_DIR = path.join(DATA_DIR, 'media');

try {
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Media] Could not create MEDIA_DIR:', e.message);
}

export function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.mov': return 'video/quicktime';
    case '.mkv': return 'video/x-matroska';
    case '.mp3': return 'audio/mpeg';
    case '.wav': return 'audio/wav';
    case '.ogg': return 'audio/ogg';
    case '.gif': return 'image/gif';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

export function detectMediaType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  if (['.gif'].includes(ext)) return 'gif';
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'image';
  return 'other';
}

export function handleRangeStream(req, res, filePath) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const mimeType = getMimeType(filePath);
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache'
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}

export default {
  getMimeType,
  detectMediaType,
  handleRangeStream,
  MEDIA_DIR
};
