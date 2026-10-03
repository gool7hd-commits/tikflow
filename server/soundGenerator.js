import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWavBuffer(sampleRate, samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  return buffer;
}

export function ensureDefaultSounds(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const sampleRate = 44100;

  // 1. Pop sound (short sine burst ~0.1s)
  const popPath = path.join(targetDir, 'pop.wav');
  if (!fs.existsSync(popPath)) {
    const duration = 0.12;
    const count = Math.floor(sampleRate * duration);
    const samples = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const freq = 400 + (1 - t / duration) * 350;
      const env = Math.exp(-t * 25);
      samples[i] = Math.sin(2 * Math.PI * freq * t) * env;
    }
    fs.writeFileSync(popPath, createWavBuffer(sampleRate, samples));
  }

  // 2. Bell / Chime (pleasant chime ~0.7s)
  const bellPath = path.join(targetDir, 'bell.wav');
  if (!fs.existsSync(bellPath)) {
    const duration = 0.8;
    const count = Math.floor(sampleRate * duration);
    const samples = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 5);
      samples[i] = (
        0.6 * Math.sin(2 * Math.PI * 1046.5 * t) +
        0.3 * Math.sin(2 * Math.PI * 1318.5 * t) +
        0.2 * Math.sin(2 * Math.PI * 1567.98 * t)
      ) * env;
    }
    fs.writeFileSync(bellPath, createWavBuffer(sampleRate, samples));
  }

  // 3. Tada / Fanfare (~1.2s)
  const tadaPath = path.join(targetDir, 'tada.wav');
  if (!fs.existsSync(tadaPath)) {
    const duration = 1.2;
    const count = Math.floor(sampleRate * duration);
    const samples = new Float32Array(count);
    const notes = [
      { f: 523.25, start: 0.0, end: 0.2 }, // C5
      { f: 659.25, start: 0.2, end: 0.4 }, // E5
      { f: 783.99, start: 0.4, end: 0.6 }, // G5
      { f: 1046.5, start: 0.6, end: 1.2 }  // C6
    ];
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      let val = 0;
      for (const n of notes) {
        if (t >= n.start && t < n.end) {
          const nt = t - n.start;
          const nDur = n.end - n.start;
          const env = Math.min(1, nt * 50) * Math.max(0, 1 - (nt / nDur) * 0.4);
          val += (Math.sin(2 * Math.PI * n.f * t) + 0.3 * Math.sin(4 * Math.PI * n.f * t)) * env * 0.7;
        }
      }
      samples[i] = val;
    }
    fs.writeFileSync(tadaPath, createWavBuffer(sampleRate, samples));
  }

  // 4. Laser / Sci-Fi (~0.4s)
  const laserPath = path.join(targetDir, 'laser.wav');
  if (!fs.existsSync(laserPath)) {
    const duration = 0.4;
    const count = Math.floor(sampleRate * duration);
    const samples = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const freq = 1400 * Math.exp(-t * 10);
      const env = Math.max(0, 1 - t / duration);
      samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
    }
    fs.writeFileSync(laserPath, createWavBuffer(sampleRate, samples));
  }
}
