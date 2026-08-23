#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/j/press/events/';
const SEA_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/msdf/event/index.html';
const SEA_OFFICIAL = 'https://www.mod.go.jp/msdf/event/index.html';
const ALLOWED = new Set(['神奈川', '東京', '埼玉', '千葉', '茨城', '静岡', '山梨', '栃木']);
const AIR_SOURCE = 'https://www.mod.go.jp/asdf/event/list.html';
const LAND_BAND_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/gsdf/eae/1d/event/1band.html';
const LAND_BAND_OFFICIAL = 'https://www.mod.go.jp/gsdf/eae/1d/event/1band.html';
const MUSIC_FESTIVAL_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/gsdf/event/marching_festival/festival2026/';
const MUSIC_FESTIVAL_OFFICIAL = 'https://www.mod.go.jp/gsdf/event/marching_festival/festival2026/';
const CHIBA_POLICE_SOURCE = 'https://r.jina.ai/https://www.police.pref.chiba.jp/kohoka/orders_bandAct_04.html';
const CHIBA_POLICE_OFFICIAL = 'https://www.police.pref.chiba.jp/kohoka/orders_bandAct_04.html';
const TOKYO_POLICE_BASE = 'https://www.keishicho.metro.tokyo.lg.jp/about_mpd/welcome/event_koshu/event/event/calendar/';
const LAND_BAND_SUPPLEMENTS = [
  ['2026-10-03','千葉','巡回演奏会in成田','成田国際文化会館 大ホール（千葉県成田市）'],
  ['2026-12-20','東京','第42回ふれあいコンサート','板橋区文化会館 大ホール（東京都板橋区）'],
  ['2027-03-07','東京','第51回定期演奏会','練馬文化センター 大ホール（東京都練馬区）']
];
const PORT_SUPPLEMENTS = [
  { date:'2026-08-31', region:'神奈川', branch:'海自', title:'YOKOSUKA軍港めぐり 夏休みキャンペーン', location:'汐入桟橋（神奈川県横須賀市）', category:'港・艦船',
    officialUrl:'https://yokosuka-kanko.com/events/events-21079/', imageUrl:'./assets/event-sea.jpg', source:'横須賀市観光協会' }
];
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

function japaneseDate(text, fallbackYear = new Date().getFullYear()) {
  const era = text.match(/令和\s*(\d+)年/);
  const western = text.match(/(20\d{2})年/);
  const md = text.match(/(\d{1,2})月\s*(\d{1,2})日/);
  if (!md) return '';
  const year = era ? 2018 + Number(era[1]) : western ? Number(western[1]) : fallbackYear;
  return `${year}-${String(md[1]).padStart(2, '0')}-${String(md[2]).padStart(2, '0')}`;
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
  if (/入間基地|府中基地|広報センター|りっくんランド|横須賀|田浦|市ヶ谷/.test(s)) return { rank: '◎', note: '駅から徒歩圏または公共交通が便利' };
  if (/百里基地|東富士|演習場|富士学校/.test(s)) return { rank: '△', note: '臨時交通・バス情報を要確認' };
  if (/茨城|静岡|栃木|山梨/.test(s)) return { rank: '○', note: '鉄道＋路線バス等を要確認' };
  return { rank: '○', note: '公共交通で日帰り圏' };
}

function fallbackImage(branch, title = '') {
  if (branch === '警察') return './assets/event-police.svg';
  if (branch === '空自' || /航空|飛行|エアフェスタ|ブルーインパルス/.test(title)) return './assets/event-air.jpg';
  if (branch === '海自' || /艦|港|船/.test(title)) return './assets/event-sea.jpg';
  return './assets/event-land.jpg';
}

function makeEvent({ date, region, branch, title, location, officialUrl, imageUrl, source, details = '', forceCategory }) {
  const profile = access(region, location);
  const finalImage = imageUrl || fallbackImage(branch, title);
  return {
    id: `${date}-${region}-${title}`.replace(/\s/g, '-'), date, region, branch, title, location,
    category: forceCategory || category(title), application: /要応募|要申込|事前申込|抽選|入場券/.test(details),
    applicationNote: (details.match(/(?:応募期間|応募締切|申込締切|事前申込)[^。\n]*/) || [])[0] || '',
    ageRestriction: /年齢制限|未就学児/.test(details), price: /有料/.test(details) ? '有料（公式情報を確認）' : '原則無料（公式情報を確認）',
    accessRank: profile.rank, accessNote: profile.note, officialUrl, imageUrl: finalImage,
    imageIsIllustration: finalImage.startsWith('./assets/'), mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    source
  };
}

function parseLandBand(markdown) {
  const out = [];
  const rows = [];
  let current = {};
  for (const line of markdown.split('\n')) {
    const cells = line.startsWith('|') ? line.split('|').slice(1, -1).map(clean) : [];
    if (cells[0] === '公演名') current = { title:cells[1] };
    else if (/^公演日/.test(cells[0] || '')) current.date = cells[1];
    else if (/^会\s*場$/.test(cells[0] || '') && current.title && current.date) { current.place = cells[1]; rows.push(current); current = {}; }
  }
  for (const { title:titleRaw, date:dateRaw, place:placeRaw } of rows) {
    const date = japaneseDate(dateRaw);
    if (!date) continue;
    const location = clean(placeRaw);
    const region = /千葉/.test(location) ? '千葉' : /神奈川/.test(location) ? '神奈川' : /埼玉/.test(location) ? '埼玉' : '東京';
    out.push(makeEvent({ date, region, branch:'陸自', title:clean(titleRaw), location, officialUrl:LAND_BAND_OFFICIAL,
      imageUrl:'http://www.mod.go.jp/gsdf/eae/1d/event/img/large.jpg', source:'陸上自衛隊 第1音楽隊', details:markdown, forceCategory:'音楽隊' }));
  }
  return out;
}

function parseMusicFestival(markdown) {
  if (!/自衛隊音楽まつり2026/.test(markdown)) return [];
  const out = [];
  for (const date of ['2026-11-19','2026-11-20','2026-11-21']) out.push(makeEvent({ date, region:'東京', branch:'その他',
    title:'自衛隊音楽まつり2026', location:'日本武道館（東京都千代田区北の丸公園）', officialUrl:MUSIC_FESTIVAL_OFFICIAL,
    imageUrl:'./assets/event-land.jpg', source:'陸上自衛隊 自衛隊音楽まつり', details:markdown, forceCategory:'音楽隊' }));
  return out;
}

function parseChibaPolice(markdown) {
  const out = [];
  const blocks = markdown.split(/\*\*■/).slice(1);
  for (const block of blocks) {
    const title = clean((block.match(/^([^*]+)\*\*/) || [])[1] || '');
    const dateText = (block.match(/日時\s*([^\n]+)/) || [])[1] || '';
    const location = clean((block.match(/場所\s*([^\n]+)/) || [])[1] || '千葉県内');
    const date = japaneseDate(dateText, 2026);
    if (!title || !date) continue;
    const eventImage = (block.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:jpg|jpeg|png))\)/i) || [])[1];
    out.push(makeEvent({ date, region:'千葉', branch:'警察', title, location, officialUrl:CHIBA_POLICE_OFFICIAL,
      imageUrl:eventImage || 'https://www.police.pref.chiba.jp/content/common/000071050.jpg', source:'千葉県警察 音楽隊', details:block,
      forceCategory:/コンサート|音楽隊|まつり/.test(title) ? '警察音楽隊' : '警察イベント' }));
  }
  return out;
}

function parseTokyoPoliceCalendar(markdown, year, month) {
  const out = [];
  for (const row of markdown.split('\n').filter(line => line.startsWith('|'))) {
    for (const cell of row.split('|')) {
      const day = (cell.match(/^\s*(\d{1,2})日/) || [])[1];
      if (!day) continue;
      for (const link of cell.matchAll(/\[([^\]]+)\]\((https:\/\/www\.keishicho\.metro\.tokyo\.lg\.jp\/[^)]+)\)/g)) {
        const title = clean(link[1]);
        if (!/フェス|つどい|コンサート|音楽|展示|パト|白バイ|ふれあい|祭/.test(title)) continue;
        const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        out.push(makeEvent({ date, region:'東京', branch:'警察', title, location:'東京都（詳細は公式サイトで確認）', officialUrl:link[2],
          imageUrl:'./assets/event-police.svg', source:'警視庁 イベントカレンダー', details:title,
          forceCategory:/音楽|コンサート/.test(title) ? '警察音楽隊' : /白バイ|パト/.test(title) ? '警察車両' : '警察イベント' }));
      }
    }
  }
  return out;
}

async function fetchOptional(url, label) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'jsdf-events/1.0' } });
    if (!response.ok) throw new Error(`${label}取得失敗: ${response.status}`);
    return await response.text();
  } catch (error) { console.warn(error.message); return ''; }
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
    const rawBranch = clean(branchRaw);
    const imageUrl = /\.(?:png|jpe?g|webp)(?:\?.*)?$/i.test(officialUrl) ? officialUrl : fallbackImage(rawBranch, title);
    const eventDates = dates(dateRaw);
    const appText = clean(eventRaw);
    const profile = access(region, location);
    for (const date of eventDates) {
      events.push({
        id: `${date}-${region}-${title}`.replace(/\s/g, '-'),
        date,
        region,
        branch: rawBranch === '地本' ? '地方協力本部' : rawBranch,
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
        imageUrl,
        imageIsIllustration: imageUrl.startsWith('./assets/'),
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
        source: '防衛省 イベント・交流活動'
      });
    }
  }
  return events;
}

function parseSea(markdown) {
  const events = [];
  const pattern = /[^\n]*### \[([^\]]+)\]\(([^)]+)\)\s*\n\n!\[[^\]]*\]\(([^)]+)\)\s*\n\n\| 開催日 \| ([^|]+) \|\n\| --- \|\n\| 開催場所 \| ([^|]+) \|/g;
  for (const match of markdown.matchAll(pattern)) {
    const [, titleRaw, officialUrl, imageRaw, dateRaw, placeRaw] = match;
    const title = clean(titleRaw);
    const location = clean(placeRaw).replace(/※.*$/, '').trim();
    const region = [...ALLOWED].find(name => new RegExp(`${name}(?:県|都)?`).test(placeRaw));
    if (!region) continue;
    const profile = access(region, location);
    const details = clean(`${dateRaw} ${placeRaw}`);
    const imageUrl = imageRaw.replace(/^http:\/\//, 'https://');
    for (const date of dates(dateRaw)) {
      events.push({
        id: `${date}-${region}-${title}`.replace(/\s/g, '-'), date, region, branch:'海自', title, location,
        category:category(title), application:/事前申込|応募|抽選/.test(details),
        applicationNote:(details.match(/(?:応募締切|申込締切)[^。※]*/) || [])[0] || '',
        ageRestriction:/年齢制限|\d+歳[～〜-]\d+歳/.test(details), price:'原則無料（公式情報を確認）',
        accessRank:profile.rank, accessNote:profile.note, officialUrl, imageUrl, imageIsIllustration:false,
        mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
        source:'海上自衛隊 イベント情報'
      });
    }
  }
  return events;
}

async function main() {
  const response = await fetch(SOURCE, { headers: { 'User-Agent': 'jsdf-events/1.0' } });
  if (!response.ok) throw new Error(`取得失敗: ${response.status}`);
  const markdown = await response.text();
  const [landBandText, musicFestivalText, chibaPoliceText] = await Promise.all([
    fetchOptional(LAND_BAND_SOURCE, '第1音楽隊'), fetchOptional(MUSIC_FESTIVAL_SOURCE, '自衛隊音楽まつり'),
    fetchOptional(CHIBA_POLICE_SOURCE, '千葉県警音楽隊')
  ]);
  const calendarMonths = [0,1,2].map(offset => { const d = new Date(); d.setMonth(d.getMonth() + offset); return [d.getFullYear(), d.getMonth() + 1]; });
  const tokyoPolicePages = await Promise.all(calendarMonths.map(([y,m]) => fetchOptional(
    `https://r.jina.ai/${TOKYO_POLICE_BASE}calendar${y}${String(m).padStart(2,'0')}.html`, '警視庁カレンダー')));
  const tokyoPoliceEvents = tokyoPolicePages.flatMap((text, i) => parseTokyoPoliceCalendar(text, ...calendarMonths[i]));
  let seaEvents = [];
  try {
    const seaResponse = await fetch(SEA_SOURCE, { headers: { 'User-Agent': 'jsdf-events/1.0' } });
    if (!seaResponse.ok) throw new Error(`海自取得失敗: ${seaResponse.status}`);
    seaEvents = parseSea(await seaResponse.text());
  } catch (error) {
    console.warn(error.message);
    try {
      const previous = JSON.parse(await fs.readFile(path.join(ROOT, 'data.json'), 'utf8'));
      seaEvents = previous.events.filter(event => event.branch === '海自');
    } catch {}
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const supplemental = AIR_SUPPLEMENTS.map(([date, region, title, location]) => {
    const profile = access(region, location);
    return { id:`${date}-${region}-${title}`, date, region, branch:'空自', title, location,
      category:category(title), application:false, applicationNote:'', ageRestriction:false,
      price:'原則無料（公式情報を確認）', accessRank:profile.rank, accessNote:profile.note,
      officialUrl:AIR_SOURCE, imageUrl:'./assets/event-air.jpg', imageIsIllustration:true,
      mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
      source:'航空自衛隊 イベント一覧' };
  });
  let landBandEvents = parseLandBand(landBandText);
  if (!landBandEvents.length) landBandEvents = LAND_BAND_SUPPLEMENTS.map(([date,region,title,location]) => makeEvent({
    date, region, branch:'陸自', title, location, officialUrl:LAND_BAND_OFFICIAL,
    imageUrl:'http://www.mod.go.jp/gsdf/eae/1d/event/img/large.jpg', source:'陸上自衛隊 第1音楽隊', forceCategory:'音楽隊'
  }));
  const musicFestivalEvents = parseMusicFestival(musicFestivalText);
  const chibaPoliceEvents = parseChibaPolice(chibaPoliceText);
  console.log(`追加取得: 第1音楽隊${landBandEvents.length}件 / 音楽まつり${musicFestivalEvents.length}件 / 千葉県警${chibaPoliceEvents.length}件 / 警視庁${tokyoPoliceEvents.length}件`);
  const portEvents = PORT_SUPPLEMENTS.map(item => makeEvent({ ...item, forceCategory:item.category }));
  const combined = [...parse(markdown), ...seaEvents, ...supplemental, ...landBandEvents, ...portEvents,
    ...musicFestivalEvents, ...chibaPoliceEvents, ...tokyoPoliceEvents];
  const unique = [...new Map(combined.map(e => [`${e.date}|${e.title.replace(/[（(].*$/,'')}`, e])).values()];
  const events = unique
    .filter(e => new Date(`${e.date}T00:00:00+09:00`) >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const data = { updatedAt: new Date().toISOString(), sourceUrl: 'https://www.mod.go.jp/j/press/events/', seaSourceUrl: SEA_OFFICIAL,
    policeSources:[CHIBA_POLICE_OFFICIAL, TOKYO_POLICE_BASE], count: events.length, events };
  await fs.writeFile(path.join(ROOT, 'data.json'), JSON.stringify(data, null, 2) + '\n');
  console.log(`${events.length}件を書き出しました`);
}

main().catch(error => { console.error(error); process.exit(1); });
