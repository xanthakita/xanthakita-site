import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

const BLOGS = [
  { host: 'myheartcwwg', title: 'My Heart' },
  { host: 'my-internet-is-down', title: 'My Internet Is Down' },
  { host: 'greercww', title: 'Greer Church Without Walls' },
  { host: 'guardianofinnocence', title: 'Guardian of Innocence' },
  { host: 'crescentmoonshibas', title: 'Crescent Moon Shibas Blog' },
  { host: 'tiredofthehype', title: 'Tired Of The Hype' },
  { host: 'thefiveminuteblogger', title: '5 minute Blogger' },
];

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const PUBLIC_POSTS = path.join(ROOT, 'public', 'posts');
const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });

const UA = { 'User-Agent': 'Mozilla/5.0 (import-blogger)' };
const seenSlugs = new Set();

function slugFromUrl(url, fallback) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() || fallback;
    let s = seg.replace(/\.html$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!s) s = fallback;
    let base = s, n = 2;
    while (seenSlugs.has(s)) { s = `${base}-${n++}`; }
    seenSlugs.add(s);
    return s;
  } catch { return fallback; }
}

function stripToText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim();
}

async function scrapePageBody(url) {
  const res = await fetch(url, { headers: UA });
  const html = await res.text();
  // Blogger classic template: <div class='post-body entry-content' ...> ... </div><div class='post-footer'
  const m = html.match(/class='post-body[^']*'[^>]*>([\s\S]*?)<div class='post-footer/);
  return m ? m[1] : '';
}

async function extFor(url) {
  const clean = url.split('?')[0];
  const ext = path.extname(clean).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return ext;
  try {
    const head = await fetch(url, { method: 'HEAD', headers: UA });
    const ct = head.headers.get('content-type') || '';
    if (ct.includes('png')) return '.png';
    if (ct.includes('gif')) return '.gif';
    if (ct.includes('webp')) return '.webp';
  } catch { /* fall through */ }
  return '.jpg';
}

async function downloadImages(html, slug) {
  const dir = path.join(PUBLIC_POSTS, slug);
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  let out = html, i = 1, count = 0;
  for (const src of srcs) {
    try {
      const ext = await extFor(src);
      const res = await fetch(src, { headers: UA });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(dir, { recursive: true });
      const name = `${i}${ext}`;
      fs.writeFileSync(path.join(dir, name), buf);
      out = out.split(src).join(`/posts/${slug}/${name}`);
      i++; count++;
    } catch (e) { console.warn(`  ! image failed ${src}: ${e.message}`); }
  }
  return { html: out, count };
}

function fm(v) { return `"${String(v).replace(/"/g, '\\"')}"`; }

async function run() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  let written = 0, skipped = 0, images = 0;
  for (const blog of BLOGS) {
    const feedUrl = `https://${blog.host}.blogspot.com/feeds/posts/default?alt=json&max-results=150`;
    const feed = await (await fetch(feedUrl, { headers: UA })).json();
    const entries = feed.feed?.entry || [];
    console.log(`\n${blog.title}: ${entries.length} entries`);
    for (const e of entries) {
      const title = (e.title?.$t || '').trim();
      const published = (e.published?.$t || '').slice(0, 10);
      const alt = (e.link || []).find(l => l.rel === 'alternate')?.href || '';
      let html = e.content?.$t || '';
      if (title === 'This is a cross post to two blogs at once') { skipped++; console.log(`  skip stub: ${title}`); continue; }
      if (!html && alt) html = await scrapePageBody(alt);
      if (stripToText(html).split(' ').filter(Boolean).length < 20 && !title) { skipped++; console.log('  skip near-empty untitled'); continue; }
      const slug = slugFromUrl(alt, `post-${published || 'undated'}`);
      const dl = await downloadImages(html, slug);
      images += dl.count;
      const body = td.turndown(dl.html).trim();
      const excerpt = stripToText(html).slice(0, 160);
      const displayTitle = title || `Untitled (${published})`;
      const front = [
        '---',
        `title: ${fm(displayTitle)}`,
        `date: ${fm(published)}`,
        `sourceBlog: ${fm(blog.title)}`,
        `sourceUrl: ${fm(alt)}`,
        `excerpt: ${fm(excerpt)}`,
        '---', '', body, '',
      ].join('\n');
      fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), front);
      written++;
      console.log(`  wrote ${slug}.md (${dl.count} imgs)`);
    }
  }
  console.log(`\nDONE: ${written} written, ${skipped} skipped, ${images} images.`);
}
run();
