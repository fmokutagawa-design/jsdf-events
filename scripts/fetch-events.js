#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/j/press/events/';
const ALLOWED = new Set(['神奈川', '東京', '埼玉', '千葉', '茨城', '静岡', '山梨', '栃木']);
const AIR_SOURCE = 'https://www.mod.go.jp/asdf/event/list.html';
// 空自一覧は画面上の日付が取得用テキストから省かれるため、開催年の日付だけ補助登録。
// 毎日の統合表取得と併用し、同じ催しは下の重複排除で一件にまとめる。
const AIR_SUPPLEMENTS = [
  ['2026-10-01','東京','府中基地秋祭り','府中基地'],
  ['2026-10-10','埼玉','燃えよ！商工会青年部！！第23回こうのす花火大会','埼玉県鴻巣市'],
  ['2026-10-25','静岡','エアフェスタ浜松2026','浜松基地'],
  ['2026-11-03','埼玉','入間航空祭','入間基地'],
  ['2026-12-06','茨城','百里基地開庁60周年記念航空祭','百里基地'],
  ['2027-03-07','東京','東京マラソン2027（ブルーインパルス展示飛行）','東京都'],
  ['2027-03-19','神奈川','2027年国際園芸博覧会 GREEN×EXPO 2027（ブルーインパルス展示飛行）','神奈川県横浜市']
];

const clean = (s = '') => s
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/New|別ウィンドウで開く|PDF/gi, '')
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function links(s = '') {
  return [...s.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
}

function toYear(text) {
  const m = text.match(/令和\s*(\d+)年/);
  return m ? 2018 + Number(m[1]) : new Date().getFullYear();
}

function dates(text) {
  const year = toYear(text);
  const out = [];
  for (const m of text.matchAll(/(\d{1,2})月\s*(\d{1,2})日/g)) {
    const iso = `${year}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (!out.includes(iso)) out.push(iso);
  }
  return out;
}

function category(title) {
  if (/航空祭|エアフェスタ/.test(title)) return '航空祭';
  if (/ブルーインパルス/.test(title)) return '展示飛行';
  if (/艦艇|一般公開|体験航海/.test(title)) return '艦艇・一般公開';
  if (/音楽|演奏|コンサート/.test(title)) return '音楽';
  if (/祭|記念行事/.test(title)) return '基地祭・記念行事';
  if (/見学|体験|ツアー/.test(title)) return '見学・体験';
  return 'その他';
}

function access(region, location) {
  const s = `${region} ${location}`;
  if (/オンライン/.test(s)) return { rank: '◎', note: 'オンライン参加' };
  if (/入間基地|府中基地|広報センター|りっくんランド/.test(s)) return { rank: '◎', note: '駅から徒歩圏または公共交通が便利' };
  if (/百里基地|東富士|演習場|富士学校/.test(s)) return { rank: '△', note: '臨時交通・バス情報を要確認' };
  if (/茨城|静岡|栃木|山梨/.test(s)) return { rank: '○', note: '鉄道＋路線バス等を要確認' };
  return { rank: '○', note: '公共交通で日帰り圏' };
}

function parse(markdown) {
  const events = [];
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|') || /^\|\s*:?-/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(s => s.trim());
    if (cells.length < 6 || cells[0] === '地域' || !ALLOWED.has(clean(cells[0]))) continue;
    const [regionRaw, branchRaw, dateRaw, eventRaw, placeRaw, contactRaw] = cells;
    const region = clean(regionRaw);
    const title = clean(eventRaw);
    const location = clean(placeRaw);
    const officialUrl = links(eventRaw)[0] || links(contactRaw)[0] || SOURCE;
    const eventDates = dates(dateRaw);
    const appText = clean(eventRaw);
    const profile = access(region, location);
    for (const date of eventDates) {
      events.push({
        id: `${date}-${region}-${title}`.replace(/\s/g, '-'),
        date,
        region,
        branch: clean(branchRaw),
        title,
        location,
        category: category(title),
        application: /要申込|要入場券|抽選/.test(appText),
        applicationNote: (appText.match(/[（(][^）)]*(?:要申込|申込|締切|〆切|抽選)[^）)]*[）)]/) || [])[0] || '',
        ageRestriction: /年齢制限/.test(appText),
        price: '原則無料（公式情報を確認）',
        accessRank: profile.rank,
        accessNote: profile.note,
        officialUrl,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
        source: '防衛省 イベント・交流活動'
      });
    }
  }
  return events;
}

async function main() {
  const response = await fetch(SOURCE, { headers: { 'User-Agent': 'jsdf-events/1.0' } });
  if (!response.ok) throw new Error(`取得失敗: ${response.status}`);
  const markdown = await response.text();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const supplemental = AIR_SUPPLEMENTS.map(([date, region, title, location]) => {
    const profile = access(region, location);
    return { id:`${date}-${region}-${title}`, date, region, branch:'空自', title, location,
      category:category(title), application:false, applicationNote:'', ageRestriction:false,
      price:'原則無料（公式情報を確認）', accessRank:profile.rank, accessNote:profile.note,
      officialUrl:AIR_SOURCE, mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
      source:'航空自衛隊 イベント一覧' };
  });
  const combined = [...parse(markdown), ...supplemental];
  const unique = [...new Map(combined.map(e => [`${e.date}|${e.title.replace(/[（(].*$/,'')}`, e])).values()];
  const events = unique
    .filter(e => new Date(`${e.date}T00:00:00+09:00`) >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const data = { updatedAt: new Date().toISOString(), sourceUrl: 'https://www.mod.go.jp/j/press/events/', count: events.length, events };
  await fs.writeFile(path.join(ROOT, 'data.json'), JSON.stringify(data, null, 2) + '\n');
  console.log(`${events.length}件を書き出しました`);
}

main().catch(error => { console.error(error); process.exit(1); });
