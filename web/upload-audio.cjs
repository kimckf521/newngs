#!/usr/bin/env node
/**
 * upload-audio.cjs
 * Upload IELTS listening audio to CloudBase storage, store fileIDs in question_bank JSONB.
 *
 * Usage (from web/):
 *   node upload-audio.cjs              # upload all books
 *   node upload-audio.cjs 17 18 19     # specific books only
 *   node upload-audio.cjs --dry-run    # print plan, no uploads
 *   node upload-audio.cjs --resume     # skip books already in DB
 *
 * DB audio structure stored per book:
 *   books.N.audio = { "1": { "1": fileID, "2": fileID, ... }, ... }
 *   for books 1-3 (whole-test):
 *   books.N.audio = { "1": { "whole": fileID }, ... }
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ── Load .env.local first (so TENCENTCLOUD_* / DATABASE_URL below resolve) ──────
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq < 1 || line.startsWith('#')) return;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  });
}

// ── Config ────────────────────────────────────────────────────────────────────
const AUDIO_ROOT  = '/Volumes/Extreme/IELTS/【听力音频】剑桥雅思听力音频';
const BANK_ID     = 'ielts';
const ENV_ID      = 'ngs-d7gnop4sfa66322e9';
// Credentials come ONLY from the environment / .env.local — never hardcode them
// (committed secrets are blocked by push protection and a hassle to rotate).
const SECRET_ID   = process.env.TENCENTCLOUD_SECRETID;
const SECRET_KEY  = process.env.TENCENTCLOUD_SECRETKEY;
if (!SECRET_ID || !SECRET_KEY) {
  console.error('Missing TENCENTCLOUD_SECRETID / TENCENTCLOUD_SECRETKEY — set them in web/.env.local');
  process.exit(1);
}
// COS bucket derived from the cloud:// fileID returned by CloudBase for IELTS 1.
// Format: cloud://{envId}.{bucket}/{key}
const COS_BUCKET  = '6e67-ngs-d7gnop4sfa66322e9-1356366479';
const COS_REGION  = 'ap-shanghai';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Directory lookup ──────────────────────────────────────────────────────────
const _allDirs = fs.readdirSync(AUDIO_ROOT);
function bookDir(n) {
  const d = _allDirs.find(d => {
    // e.g. "剑桥雅思4听力音频"  "剑桥雅思14听力音频"
    return d.includes(`剑桥雅思${n}听`);
  });
  return d ? path.join(AUDIO_ROOT, d) : null;
}

// ── Per-book file scanning ────────────────────────────────────────────────────
// Returns [{ localPath, cloudPath, test (1-4), part ('whole'|'1'-'4'), ext }]
function scanBook(n) {
  const dir = bookDir(n);
  if (!dir) return [];
  const files = [];

  if (n <= 3) {
    // flat: test1.mp3 … test4.mp3  (one whole-test file per test)
    for (let t = 1; t <= 4; t++) {
      const lp = path.join(dir, `test${t}.mp3`);
      if (fs.existsSync(lp))
        files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-whole.mp3`, test: t, part: 'whole', ext: 'mp3' });
    }

  } else if (n === 4) {
    // subdirs Test1…Test4; Test1/Test3/Test4 use "NN.TestN.SectionP.mp3" but Test2 has no prefix
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const pfx = String((t - 1) * 4 + p).padStart(2, '0');
        const candidates = [
          path.join(dir, `Test${t}`, `${pfx}.Test${t}.Section${p}.mp3`),
          path.join(dir, `Test${t}`, `Test${t}.Section${p}.mp3`),  // Test2: no numeric prefix
        ];
        const lp = candidates.find(fs.existsSync);
        if (lp)
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }

  } else if (n >= 5 && n <= 13) {
    // subdirs Test1…Test4 (or Test5…Test8 for book 12)
    // IELTS 12's real test numbers are 5-8; remap to DB positions 1-4
    const srcTests = n === 12 ? [5, 6, 7, 8] : [1, 2, 3, 4];
    srcTests.forEach((srcT, idx) => {
      const dbT = idx + 1;
      for (let p = 1; p <= 4; p++) {
        // Primary filename; fall back to known typo variants (IELTS 5: Tes3/Tst4, IELTS 9: Secton3)
        const candidates = [
          path.join(dir, `Test${srcT}`, `Test${srcT}.Section${p}.mp3`),
          path.join(dir, `Test${srcT}`, `Tes${srcT}.Section${p}.mp3`),  // IELTS 5 test3 typo
          path.join(dir, `Test${srcT}`, `Tst${srcT}.Section${p}.mp3`),  // IELTS 5 test4 typo
          path.join(dir, `Test${srcT}`, `Test${srcT}.Secton${p}.mp3`),  // IELTS 9 section3 typo
        ];
        const lp = candidates.find(fs.existsSync);
        if (lp)
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${dbT}-part${p}.mp3`, test: dbT, part: String(p), ext: 'mp3' });
      }
    });

  } else if (n === 14) {
    // subdirs "Test 1"…"Test 4", files: "Test 1-1.mp3"
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `Test ${t}`, `Test ${t}-${p}.mp3`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }

  } else if (n === 15) {
    // subdirs "Test  1" (two spaces), files: IELTS15_test1_audio1.mp3
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `Test  ${t}`, `IELTS15_test${t}_audio${p}.mp3`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }

  } else if (n === 16) {
    // flat, M4A, Chinese comma: IELTS16，test1，Part1.m4a
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `IELTS16，test${t}，Part${p}.m4a`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.m4a`, test: t, part: String(p), ext: 'm4a' });
      }
    }

  } else if (n === 17) {
    // flat: ELT_IELTS17_t1_audio1.mp3
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `ELT_IELTS17_t${t}_audio${p}.mp3`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }

  } else if (n === 18) {
    // flat: 18-1-1.mp3  (book-test-part)
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `18-${t}-${p}.mp3`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }

  } else if (n === 19) {
    // flat: "Test1 Part1.mp3"
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const lp = path.join(dir, `Test${t} Part${p}.mp3`);
        if (fs.existsSync(lp))
          files.push({ localPath: lp, cloudPath: `ielts-audio/${n}/test${t}-part${p}.mp3`, test: t, part: String(p), ext: 'mp3' });
      }
    }
  }

  return files;
}

// ── Pre-upload integrity check ────────────────────────────────────────────────
const { spawnSync } = require('child_process');

function isAudioReadable(localPath) {
  // spawnSync always populates .stderr even when status=0; safe with 'ignore' stdout
  const r = spawnSync('ffprobe', ['-v', 'error', '-i', localPath], {
    stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 10000,
  });
  if (r.error) return false;                       // spawn failed entirely
  const stderr = (r.stderr ?? Buffer.alloc(0)).toString().trim();
  return r.status === 0 && stderr === '';           // exit 0 + no errors = readable
}

// ── Concurrency helper ────────────────────────────────────────────────────────
async function pMap(items, fn, limit) {
  const results = [];
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const argv    = process.argv.slice(2);
  const dryRun  = argv.includes('--dry-run');
  const resume  = argv.includes('--resume');
  const bookArgs = argv.filter(a => !a.startsWith('--') && /^\d+$/.test(a)).map(Number);
  // 16 excluded: only has M4A (not wanted); 8 and 20 skipped (no source)
  const allBooks = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19];
  const books   = bookArgs.length ? bookArgs : allBooks;

  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'UPLOAD'}, books: [${books.join(',')}]`);

  // Use Tencent COS SDK directly — bypasses CloudBase node SDK which hangs on
  // larger files due to stale WebSocket connections.
  // Files are stored at the same COS path as CloudBase would use, so the
  // existing cloud:// fileID format and getTempFileURL API still work.
  let cos = null;
  if (!dryRun) {
    const COS = require('cos-nodejs-sdk-v5');
    cos = new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY });
    console.log('COS SDK initialised');
  }

  function cosUpload(localPath, cosKey) {
    return new Promise((resolve, reject) => {
      const basename = path.basename(localPath);
      // putObject = single HTTP PUT; no multipart machinery, no slow-speed guard.
      // Works up to 5 GB; all our files are ≤60 MB so this is fine.
      // uploadFile with small slices = shorter per-part connections = less likely to hit
      // the COS server-side "too slow" per-connection timeout than a single 10+ MB PUT.
      cos.uploadFile(
        {
          Bucket: COS_BUCKET,
          Region: COS_REGION,
          Key: cosKey,
          FilePath: localPath,
          SliceSize: 512 * 1024,  // 512 KB per part — ~90s each at 5 KB/s
          SlowRequestSpeed: 1,    // 1 byte/sec → truthy (SDK arms check) but never triggers
          SlowRequestTime: 3600,  // measure window = 1 hour → never fires in practice
          onProgress: (p) => {
            process.stdout.write(`\r  ↑ ${basename} — ${(p.percent * 100).toFixed(0)}%  `);
          },
        },
        (err, data) => {
          if (err) return reject(err);
          const fileID = `cloud://${ENV_ID}.${COS_BUCKET}/${cosKey}`;
          resolve(fileID);
        },
      );
    });
  }

  let totalUploaded = 0, totalErrors = 0, totalFiles = 0;

  for (const n of books) {
    console.log(`\n=== IELTS ${n} ===`);
    const dir = bookDir(n);
    if (!dir) { console.log('  [SKIP] no audio directory'); continue; }

    // --resume: skip books that already have audio in DB
    if (resume && !dryRun) {
      const r = await pool.query(
        "SELECT data->'books'->$2->'audio' IS NOT NULL as has_audio FROM question_bank WHERE id=$1",
        [BANK_ID, String(n)],
      );
      if (r.rows[0]?.has_audio) { console.log('  [SKIP] already in DB'); continue; }
    }

    const files = scanBook(n);
    if (!files.length) { console.log('  [SKIP] no files found'); continue; }

    const sizes = files.map(f => {
      try { return fs.statSync(f.localPath).size; } catch { return 0; }
    });
    const totalMB = (sizes.reduce((a, b) => a + b, 0) / 1024 / 1024).toFixed(1);
    console.log(`  ${files.length} files, ${totalMB} MB total`);
    totalFiles += files.length;

    if (dryRun) {
      files.forEach(f => console.log(`  ${path.basename(f.localPath)} → ${f.cloudPath}`));
      continue;
    }

    // Upload all files for this book sequentially
    const audioMap = {};
    let bookErrors = 0;

    for (const f of files) {
      const label = path.basename(f.localPath);
      // Skip corrupt files before uploading
      if (!isAudioReadable(f.localPath)) {
        console.log(`  ✗ CORRUPT (skipped): ${label}`);
        bookErrors++;
        totalErrors++;
        continue;
      }
      try {
        const sizeMB = (fs.statSync(f.localPath).size / 1024 / 1024).toFixed(1);
        process.stdout.write(`  ↑ ${label} (${sizeMB} MB)...`);
        const MAX_RETRIES = 50;
        let fileID, lastErr;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            fileID = await cosUpload(f.localPath, f.cloudPath);
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            const retryable = /too slow|ECONNRESET|ECONNABORTED|ENOTFOUND|ETIMEDOUT|socket hang/i.test(e.message);
            if (!retryable || attempt === MAX_RETRIES) throw e;
            process.stdout.write(` ↻${attempt}`);
            await new Promise(r => setTimeout(r, 3000));
          }
        }
        const tKey = String(f.test);
        if (!audioMap[tKey]) audioMap[tKey] = {};
        audioMap[tKey][f.part] = fileID;
        totalUploaded++;
        console.log(` ✓`);
      } catch (e) {
        bookErrors++;
        totalErrors++;
        console.error(`  ✗ ${label}: ${e.message}`);
      }
    }

    // Update DB for this book
    if (Object.keys(audioMap).length > 0) {
      await pool.query(
        `UPDATE question_bank
         SET data = jsonb_set(data, ARRAY['books', $2, 'audio'], $3::jsonb, true),
             updated_at = NOW()
         WHERE id = $1`,
        [BANK_ID, String(n), JSON.stringify(audioMap)],
      );
      console.log(`  DB updated: ${Object.keys(audioMap).length} tests, ${bookErrors} errors`);
    }
  }

  console.log(`\n─── Summary ───────────────────────────────`);
  console.log(`Files: ${totalFiles} total, ${totalUploaded} uploaded, ${totalErrors} errors`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
