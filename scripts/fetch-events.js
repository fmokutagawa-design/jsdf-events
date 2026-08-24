#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/j/press/events/';
const SEA_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/msdf/event/index.html';
const SEA_OFFICIAL = 'https://www.mod.go.jp/msdf/event/index.html';
const SEA_KURE_SOURCE = 'https://r.jina.ai/https://www.mod.go.jp/msdf/kure/announcement/tour/index.html';
const SEA_KURE_OFFICIAL = 'https://www.mod.go.jp/msdf/kure/announcement/tour/index.html';
const SEA_TATEYAMA_SOURCE = 'https://r.jina.ai/https://www.mod.go.jp/msdf/tateyama/faw21/ivent.html';
const SEA_TATEYAMA_OFFICIAL = 'https://www.mod.go.jp/msdf/tateyama/faw21/ivent.html';
const SEA_HACHINOHE_SOURCE = 'https://r.jina.ai/https://www.mod.go.jp/msdf/hatinohe/about/index.html';
const SEA_HACHINOHE_OFFICIAL = 'https://www.mod.go.jp/msdf/hatinohe/about/index.html';
const SEA_FUKUOKA_SOURCE = 'https://r.jina.ai/https://www.mod.go.jp/pco/fukuoka/event/index.html';
const SEA_FUKUOKA_OFFICIAL = 'https://www.mod.go.jp/pco/fukuoka/event/index.html';
const COCOYOKO_BASE_SOURCE = 'https://www.cocoyoko.net/event/genre/base/';
const PORT_OFFICIAL_SOURCES = [
  'https://www.city.yokosuka.kanagawa.jp/2150/nagekomi/',
  'https://www.city.yokohama.lg.jp/kanko-bunka/minato/',
  'https://www.kouwan.metro.tokyo.lg.jp/kanko/',
  'https://www.pref.chiba.lg.jp/kouwan/',
  'https://www.city.kure.lg.jp/soshiki/67/m000051.html',
  'https://www.city.sasebo.lg.jp/kichisei/',
  'https://www.city.maizuru.kyoto.jp/',
  'https://www.city.mutsu.lg.jp/topics/'
];
const FOREIGN_VESSEL_SOURCES = [
  'https://www.mod.go.jp/msdf/release/',
  'https://www.mod.go.jp/msdf/yokosuka/news-list/',
  'https://www.city.yokosuka.kanagawa.jp/2150/nagekomi/',
  'https://cnrj.cnic.navy.mil/Installations/CFA-Yokosuka/',
  'https://www.cocoyoko.net/event/genre/base/',
  'https://www.city.sasebo.lg.jp/kichisei/'
];
const MILITARY_PORT_CITY_SOURCES = [
  { city:'横須賀', url:'https://www.cocoyoko.net/event/genre/base/' },
  { city:'呉', url:'https://www.city.kure.lg.jp/soshiki/67/m000051.html' },
  { city:'佐世保', url:'https://www.city.sasebo.lg.jp/kichisei/' },
  { city:'舞鶴', url:'https://www.city.maizuru.kyoto.jp/' },
  { city:'大湊・むつ', url:'https://www.city.mutsu.lg.jp/topics/' }
];
const SEA_UNIT_SOURCES = [
  { name:'横須賀地方隊', region:'神奈川', location:'海上自衛隊 横須賀地区', url:'https://www.mod.go.jp/msdf/yokosuka/news-list/' },
  { name:'舞鶴地方隊', region:'京都', location:'海上自衛隊 舞鶴地区', url:'https://www.mod.go.jp/msdf/maizuru/news/' },
  { name:'呉地方隊', region:'広島', location:'海上自衛隊 呉地区', url:'https://www.mod.go.jp/msdf/kure/announcement/' },
  { name:'佐世保地方隊', region:'長崎', location:'海上自衛隊 佐世保地区', url:'https://www.mod.go.jp/msdf/sasebo/2_pr_event/2_pr_event.html' },
  { name:'大湊地区隊', region:'青森', location:'海上自衛隊 大湊地区', url:'https://www.mod.go.jp/msdf/oominato/' },
  { name:'阪神基地隊', region:'兵庫', location:'海上自衛隊 阪神基地隊', url:'https://www.mod.go.jp/msdf/hanshin/' },
  { name:'下関基地隊', region:'山口', location:'海上自衛隊 下関基地隊', url:'https://www.mod.go.jp/msdf/shimoki/' },
  { name:'八戸航空基地', region:'青森', location:'海上自衛隊 八戸航空基地', url:'https://www.mod.go.jp/msdf/hatinohe/event/index.html' },
  { name:'館山航空基地', region:'千葉', location:'海上自衛隊 館山航空基地', url:'https://www.mod.go.jp/msdf/tateyama/faw21/ivent.html' },
  { name:'岩国航空基地', region:'山口', location:'海上自衛隊 岩国航空基地', url:'https://www.mod.go.jp/msdf/iwakuni/' },
  { name:'第22航空群・大村航空基地', region:'長崎', location:'海上自衛隊 大村航空基地', url:'https://www.mod.go.jp/msdf/22aw/event/kichisai/kitisai.html' },
  { name:'小月航空基地', region:'山口', location:'海上自衛隊 小月航空基地', url:'https://www.mod.go.jp/msdf/oz-atg/' },
  { name:'徳島航空基地', region:'徳島', location:'海上自衛隊 徳島航空基地', url:'https://www.mod.go.jp/msdf/tokusima/' },
  { name:'鹿屋航空基地', region:'鹿児島', location:'海上自衛隊 鹿屋航空基地', url:'https://www.mod.go.jp/msdf/kanoya/' },
  { name:'第5航空群・那覇航空基地', region:'沖縄', location:'海上自衛隊 那覇航空基地', url:'https://www.mod.go.jp/msdf/naha/release.html' },
  { name:'第1術科学校・幹部候補生学校', region:'広島', location:'海上自衛隊 第1術科学校（江田島）', url:'https://www.mod.go.jp/msdf/onemss/' }
];
const BASE_OPEN_SOURCES = [
  'https://www.mod.go.jp/msdf/yokosuka/news-list/',
  'https://www.mod.go.jp/msdf/kure/announcement/',
  'https://www.mod.go.jp/msdf/sasebo/2_pr_event/2_pr_event.html',
  'https://www.mod.go.jp/msdf/maizuru/news/',
  'https://www.mod.go.jp/msdf/oominato/',
  SEA_HACHINOHE_OFFICIAL,
  SEA_FUKUOKA_OFFICIAL,
  'https://www.city.yokosuka.kanagawa.jp/2150/nagekomi/',
  'https://cnrj.cnic.navy.mil/Installations/CFA-Yokosuka/',
  'https://www.cocoyoko.net/event/genre/base/'
];
const ALLOWED = new Set(['神奈川', '東京', '埼玉', '千葉', '茨城', '静岡', '山梨', '栃木']);
const ALL_REGIONS = ['北海道','青森','岩手','宮城','秋田','山形','福島','茨城','栃木','群馬','埼玉','千葉','東京','神奈川','新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知','三重','滋賀','京都','大阪','兵庫','奈良','和歌山','鳥取','島根','岡山','広島','山口','徳島','香川','愛媛','高知','福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'];
const AIR_SOURCE = 'https://www.mod.go.jp/asdf/event/list.html';
const LAND_BAND_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/gsdf/eae/1d/event/1band.html';
const LAND_BAND_OFFICIAL = 'https://www.mod.go.jp/gsdf/eae/1d/event/1band.html';
const MUSIC_FESTIVAL_SOURCE = 'https://r.jina.ai/http://www.mod.go.jp/gsdf/event/marching_festival/festival2026/';
const MUSIC_FESTIVAL_OFFICIAL = 'https://www.mod.go.jp/gsdf/event/marching_festival/festival2026/';
const CHIBA_POLICE_SOURCE = 'https://r.jina.ai/https://www.police.pref.chiba.jp/kohoka/orders_bandAct_04.html';
const CHIBA_POLICE_OFFICIAL = 'https://www.police.pref.chiba.jp/kohoka/orders_bandAct_04.html';
const KANAGAWA_POLICE_SOURCE = 'https://r.jina.ai/https://www.police.pref.kanagawa.jp/about_kpp/kakubu/mesa8050.html';
const KANAGAWA_POLICE_OFFICIAL = 'https://www.police.pref.kanagawa.jp/about_kpp/kakubu/mesa8050.html';
const TOKYO_POLICE_BASE = 'https://www.keishicho.metro.tokyo.lg.jp/about_mpd/welcome/event_koshu/event/event/calendar/';
const TOKYO_POLICE_MUSIC_BASE = 'https://www.keishicho.metro.tokyo.lg.jp/about_mpd/welcome/event_koshu/event/music_band/calendar/';
const LAND_BAND_SUPPLEMENTS = [
  ['2026-10-03','千葉','巡回演奏会in成田','成田国際文化会館 大ホール（千葉県成田市）'],
  ['2026-12-20','東京','第42回ふれあいコンサート','板橋区文化会館 大ホール（東京都板橋区）'],
  ['2027-03-07','東京','第51回定期演奏会','練馬文化センター 大ホール（東京都練馬区）']
];
const PORT_SUPPLEMENTS = [
  { date:'2026-08-31', region:'神奈川', branch:'海自', title:'YOKOSUKA軍港めぐり 夏休みキャンペーン', location:'汐入桟橋（神奈川県横須賀市）', category:'港・艦船',
    officialUrl:'https://yokosuka-kanko.com/events/events-21079/', imageUrl:'./assets/event-sea.jpg', source:'横須賀市観光協会', sourceType:'自治体・港湾' },
  { date:'2026-09-12', region:'東京', branch:'その他', title:'東京アクアシンフォニー 船上観覧ツアー', location:'お台場海浜公園周辺（東京都港区）', category:'港・艦船',
    officialUrl:'https://www.metro.tokyo.lg.jp/information/press/2026/08/2026081710', imageUrl:'./assets/event-sea.jpg', source:'東京都港湾局', sourceType:'自治体・港湾', details:'事前申込・抽選' },
  { date:'2026-09-13', region:'東京', branch:'その他', title:'東京アクアシンフォニー 船上観覧ツアー', location:'お台場海浜公園周辺（東京都港区）', category:'港・艦船',
    officialUrl:'https://www.metro.tokyo.lg.jp/information/press/2026/08/2026081710', imageUrl:'./assets/event-sea.jpg', source:'東京都港湾局', sourceType:'自治体・港湾', details:'事前申込・抽選' }
];
const REGIONAL_SUPPLEMENTS = [
  { date:'2026-09-01', region:'神奈川', branch:'その他', title:'ビッグレスキューかながわ2026', location:'神奈川県総合防災センター・消防学校（神奈川県厚木市下津古久280）', category:'防災・合同訓練',
    officialUrl:'https://www.pref.kanagawa.jp/docs/j8g/bigrescue/bigrescue.html', imageUrl:'./assets/event-land.jpg', source:'神奈川県・厚木市', sourceType:'自治体公式', details:'救出救助訓練・展示体験／愛甲石田駅から無料シャトルバス' },
  { date:'2026-09-04', region:'神奈川', branch:'その他', title:'横浜防災フェア2026', location:'横浜市役所アトリウム（横浜市中区）', category:'防災・合同訓練',
    officialUrl:'https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bousai-saigai/moshimo/shitaisaku/kunren/bousaifair2026.html', imageUrl:'./assets/event-land.jpg', source:'横浜市', sourceType:'自治体公式', details:'11:00〜18:00／水難救助訓練・横浜市消防音楽隊・展示ブース' },
  { date:'2026-09-05', region:'神奈川', branch:'その他', title:'横浜防災フェア2026', location:'横浜市役所アトリウム（横浜市中区）', category:'防災・合同訓練',
    officialUrl:'https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bousai-saigai/moshimo/shitaisaku/kunren/bousaifair2026.html', imageUrl:'./assets/event-land.jpg', source:'横浜市', sourceType:'自治体公式', details:'11:00〜18:00／水難救助訓練・横浜市消防音楽隊・展示ブース' },
  { date:'2026-10-04', region:'神奈川', branch:'その他', title:'令和8年度 横浜市総合防災訓練', location:'荏田南中学校・牛ケ谷公園（横浜市都筑区）', category:'防災・合同訓練',
    officialUrl:'https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bousai-saigai/moshimo/shitaisaku/kunren/sougoukunren.html', imageUrl:'./assets/event-land.jpg', source:'横浜市', sourceType:'自治体公式', details:'9:00〜12:00／実動訓練・一般向け展示体験' },
  { date:'2026-10-25', region:'神奈川', branch:'その他', title:'令和8年度 相模原市総合防災訓練', location:'相模総合補給廠一部返還地ほか（相模原市）', category:'防災・合同訓練',
    officialUrl:'https://www.city.sagamihara.kanagawa.jp/kurashi/1026529/bousai/1008801/1008805.html', imageUrl:'./assets/event-land.jpg', source:'相模原市', sourceType:'自治体公式', details:'第47回九都県市合同防災訓練・詳細は公式発表待ち' }
];
const KANAGAWA_PRIORITY_SOURCES = [
  { name:'神奈川県 防災・イベント', url:'https://www.pref.kanagawa.jp/docs/j8g/bigrescue/bigrescue.html' },
  { name:'横浜市 総合防災訓練', url:'https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bousai-saigai/moshimo/shitaisaku/kunren/sougoukunren.html' },
  { name:'横浜市 防災フェア', url:'https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/bousai-saigai/moshimo/shitaisaku/kunren/bousaifair2026.html' },
  { name:'横浜市 港湾', url:'https://www.city.yokohama.lg.jp/kanko-bunka/minato/' },
  { name:'横浜市 消防イベント', url:'https://cgi.city.yokohama.lg.jp/common/event2/shobo/event_list.html' },
  { name:'横須賀市観光協会 基地イベント', url:COCOYOKO_BASE_SOURCE },
  { name:'横須賀市 報道発表', url:'https://www.city.yokosuka.kanagawa.jp/2150/nagekomi/' },
  { name:'海上自衛隊 横須賀地方隊', url:'https://www.mod.go.jp/msdf/yokosuka/news-list/' },
  { name:'第三管区海上保安本部', url:'https://www.kaiho.mlit.go.jp/03kanku/information/cat/' },
  { name:'海上保安庁 全国イベント', url:'https://www.kaiho.mlit.go.jp/doc/event/jyouhou.html' },
  { name:'神奈川県警察 音楽隊', url:KANAGAWA_POLICE_OFFICIAL },
  { name:'相模原市 総合防災訓練', url:'https://www.city.sagamihara.kanagawa.jp/kurashi/1026529/bousai/1008801/1008805.html' },
  { name:'川崎市 防災', url:'https://www.city.kawasaki.jp/kurashi/category/15-2-10-0-0-0-0-0-0-0.html' }
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
  const normalized = text.normalize('NFKC');
  const m = normalized.match(/令和\s*(\d+)年/);
  return m ? 2018 + Number(m[1]) : new Date().getFullYear();
}

function dates(text) {
  const normalized = text.normalize('NFKC');
  const year = toYear(normalized);
  const out = [];
  for (const m of normalized.matchAll(/(\d{1,2})月\s*(\d{1,2})日/g)) {
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

function inferSourceType(event) {
  if (event.sourceType) return event.sourceType;
  if (/外国艦|米海軍|US Navy|U\.S\. Navy/i.test(`${event.title} ${event.source}`)) return '外国艦船';
  if (/市|県|都|港湾|観光協会/.test(event.source || '')) return '自治体・港湾';
  if (event.branch === '海自') return '海自公式';
  if (event.branch === '警察') return '警察公式';
  return '自衛隊公式';
}

function inferOpenType(event) {
  const text = `${event.title} ${event.category}`;
  if (/フリート\s*(?:ウィーク|フェスタ)|国際観艦式/i.test(text)) return 'フリートイベント';
  if (/基地(?:一般)?開放|基地祭|一般開放|地方総監部一般公開|スプリングフェスタ|フレンドシップデー/i.test(text)) return '基地一般開放';
  if (/艦艇|護衛艦|掃海|潜水艦|ミサイル艇|船舶一般公開|軍港/.test(text)) return '艦艇・港湾公開';
  return '';
}

function isCancelled(event) {
  return /開催中止|中止(?:となりました|します|決定)|実施されません|開催を見送/.test(
    `${event.title || ''} ${event.details || ''} ${event.applicationNote || ''} ${event.status || ''}`
  );
}

async function parseCocoyokoBase(html) {
  const out = [];
  for (const block of html.match(/<li>[\s\S]*?<\/li>/g) || []) {
    const url = (block.match(/<a href="([^"]+)"/) || [])[1];
    const status = (block.match(/statusLabel">(20\d{2}:\d{2}:\d{2})[^|]*\|(20\d{2}:\d{2}:\d{2})/) || []);
    const title = clean((block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || '').replace(/<[^>]+>/g, '');
    const location = clean((block.match(/entryAreaBox[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '米海軍横須賀基地').replace(/<[^>]+>/g, '');
    const imageUrl = (block.match(/background-image:\s*url\(([^)]+)\)/) || [])[1];
    const tags = clean((block.match(/entryTagBox">([\s\S]*?)<\/div>/) || [])[1] || '').replace(/<[^>]+>/g, ' ');
    if (!url || !status[1] || !title || !/米海軍|自衛隊/.test(tags)) continue;
    if (!/基地|艦|フレンドシップ|スプリングフェスタ|ベース歴史ツアー|フリート|一般公開/.test(title)) continue;
    const eventDates = [...new Set([status[1], status[2]].filter(Boolean).map(value => value.replace(/:/g, '-')))];
    if (eventDates.every(date => new Date(`${date}T23:59:59+09:00`) < new Date())) continue;
    const details = await fetchOptional(url, `横須賀市観光情報 ${title}`);
    if (/開催中止|開催を中止|実施されません|開催を見送/.test(details)) continue;
    for (const date of eventDates) out.push(makeEvent({ date, region:'神奈川', branch:/米海軍/.test(tags) ? 'その他' : '海自', title,
      location:location || '米海軍横須賀基地', officialUrl:url, imageUrl, source:'横須賀市観光情報',
      sourceType:/米海軍/.test(tags) ? '米海軍基地' : '自治体・港湾', details,
      forceCategory:/米海軍/.test(tags) ? '米軍基地一般開放' : '基地祭・記念行事' }));
  }
  return out;
}

function makeEvent({ date, region, branch, title, location, officialUrl, imageUrl, source, sourceType, details = '', forceCategory }) {
  const profile = access(region, location);
  const finalImage = imageUrl || fallbackImage(branch, title);
  return {
    id: `${date}-${region}-${title}`.replace(/\s/g, '-'), date, region, branch, title, location,
    category: forceCategory || category(title), application: /要応募|要申込|事前申込|抽選|入場券/.test(details),
    applicationNote: (details.match(/(?:応募期間|応募締切|申込締切|事前申込)[^。\n]*/) || [])[0] || '',
    ageRestriction: /年齢制限|未就学児/.test(details), price: /有料/.test(details) ? '有料（公式情報を確認）' : '原則無料（公式情報を確認）',
    accessRank: profile.rank, accessNote: profile.note, officialUrl, imageUrl: finalImage,
    imageIsIllustration: finalImage.startsWith('./assets/'), mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    source, sourceType: sourceType || (branch === '海自' ? '海自公式' : branch === '警察' ? '警察公式' : '自衛隊公式'),
    scope: branch === '海自' ? (ALLOWED.has(region) ? '首都圏' : '全国') : undefined
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
    // PDFアイコン等の極小PNGをイベント写真と誤認しない。公式ページ内のJPEGだけを写真候補にする。
    const eventImage = (block.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:jpg|jpeg))\)/i) || [])[1];
    out.push(makeEvent({ date, region:'千葉', branch:'警察', title, location, officialUrl:CHIBA_POLICE_OFFICIAL,
      imageUrl:eventImage || 'https://www.police.pref.chiba.jp/content/common/000071050.jpg', source:'千葉県警察 音楽隊', details:block,
      forceCategory:/コンサート|音楽隊|まつり/.test(title) ? '警察音楽隊' : '警察イベント' }));
  }
  return out;
}

function parseKanagawaPolice(markdown) {
  const out = [];
  const schedule = (markdown.split('## スケジュール')[1] || '').split('## コンサート')[0] || '';
  const yearMatch = schedule.match(/令和\s*(\d+)年/);
  const year = yearMatch ? 2018 + Number(yearMatch[1]) : new Date().getFullYear();
  const blocks = schedule.split(/^#### /m).slice(1);
  for (const block of blocks) {
    const heading = block.split('\n')[0];
    const link = heading.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const title = clean(link ? link[1] : heading);
    const dateText = (block.match(/日時\s*([^\n]+)/) || [])[1] || '';
    const location = clean((block.match(/場所\s*([^\n]+)/) || [])[1] || '神奈川県内');
    const date = japaneseDate(dateText, year);
    if (!title || !date) continue;
    out.push(makeEvent({ date, region:'神奈川', branch:'警察', title, location,
      officialUrl:link ? link[2] : KANAGAWA_POLICE_OFFICIAL,
      imageUrl:/マリーンコンサート/.test(title) ? 'https://www.police.pref.kanagawa.jp/assets/entry/a8050_05.jpg' : './assets/event-police.svg',
      source:'神奈川県警察 音楽隊', details:block, forceCategory:'警察音楽隊' }));
  }
  return out;
}

function parseTokyoPoliceCalendar(markdown, year, month, kind = 'event') {
  const out = [];
  for (const row of markdown.split('\n').filter(line => line.startsWith('|'))) {
    for (const cell of row.split('|')) {
      const day = (cell.match(/^\s*(\d{1,2})日/) || [])[1];
      if (!day) continue;
      for (const link of cell.matchAll(/\[([^\]]+)\]\((https:\/\/www\.keishicho\.metro\.tokyo\.lg\.jp\/[^)]+)\)/g)) {
        const title = clean(link[1]);
        if (/^Image\s*\d*:/i.test(title) || /\/images\//.test(link[2])) continue;
        if (/採用|説明会/.test(title)) continue;
        const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const eventCategory = kind === 'music' || /音楽|コンサート/.test(title) ? '警察音楽隊'
          : /二輪車|ライダー|バイクスクール/.test(title) ? '警察・交通教室'
          : /セミナー|講習/.test(title) ? '警察・講習'
          : /白バイ|パト/.test(title) ? '警察車両' : '警察イベント';
        out.push(makeEvent({ date, region:'東京', branch:'警察', title, location:'東京都（詳細は公式サイトで確認）', officialUrl:link[2],
          imageUrl:'./assets/event-police.svg', source:'警視庁 イベントカレンダー', details:title,
          forceCategory:eventCategory }));
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
    const region = ALL_REGIONS.find(name => new RegExp(`${name}(?:県|都|府)?`).test(placeRaw));
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
        mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, scope:ALLOWED.has(region)?'首都圏':'全国',
        source:'海上自衛隊 イベント情報'
      });
    }
  }
  return events;
}

function parseSeaKure(markdown) {
  const out = [];
  const section = (markdown.split('##### 現在受付中の日程')[1] || '').split('##### 呉地方総監部第1庁舎')[0] || '';
  const year = new Date().getFullYear();
  for (const row of section.split('\n').filter(line => /^\|?\s*\d{1,2}月\d{1,2}日/.test(line))) {
    const md = row.match(/(\d{1,2})月(\d{1,2})日/);
    if (!md) continue;
    const date = `${year}-${String(md[1]).padStart(2,'0')}-${String(md[2]).padStart(2,'0')}`;
    out.push(makeEvent({ date, region:'広島', branch:'海自', title:'呉在泊艦艇・地方総監部 一般公開',
      location:'呉基地係船堀地区・呉地方総監部（広島県呉市）', officialUrl:SEA_KURE_OFFICIAL,
      imageUrl:'./assets/event-sea.jpg', source:'海上自衛隊 呉地方隊', details:`抽選・事前申込 ${clean(row)}`,
      forceCategory:'艦艇・一般公開' }));
  }
  return out;
}

function parseSeaTateyama(markdown) {
  if (!/ヘリコプターフェスティバル\s*in\s*TATEYAMA\s*2026/i.test(markdown)) return [];
  const date = '2026-10-10';
  const image = (markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:jpe?g|png|webp)[^)]*)\)/i) || [])[1];
  return [makeEvent({ date, region:'千葉', branch:'海自', title:'ヘリコプターフェスティバル in TATEYAMA 2026',
    location:'海上自衛隊 館山航空基地（千葉県館山市宮城無番地）', officialUrl:SEA_TATEYAMA_OFFICIAL,
    imageUrl:image || './assets/event-sea.jpg', source:'海上自衛隊 第21航空群・館山航空基地', details:markdown,
    forceCategory:'基地祭・記念行事' })];
}

function parseSeaHachinohe(markdown) {
  if (!/(?:9月19日|９月１９日)[^。]*(?:オータムフェスタ|基地一般開放)/.test(markdown) &&
      !/(?:オータムフェスタ|基地一般開放)[^。]*(?:9月19日|９月１９日)/.test(markdown)) return [];
  return [makeEvent({ date:'2026-09-19', region:'青森', branch:'海自', title:'八戸航空基地 オータムフェスタ2026',
    location:'海上自衛隊 八戸航空基地（青森県八戸市）', officialUrl:SEA_HACHINOHE_OFFICIAL,
    imageUrl:'./assets/event-sea.jpg', source:'海上自衛隊 八戸航空基地', details:markdown,
    forceCategory:'基地祭・記念行事' })];
}

function parseSeaFukuoka(markdown) {
  const section = (markdown.split('## 砕氷艦しらせ一般公開')[1] || '').split('### CONTACT')[0] || '';
  if (!section) return [];
  const out = [];
  for (const date of dates(section)) out.push(makeEvent({ date, region:'福岡', branch:'海自', title:'砕氷艦「しらせ」門司港一般公開',
    location:'門司港西海岸ふ頭1号岸壁（福岡県北九州市門司区）', officialUrl:SEA_FUKUOKA_OFFICIAL,
    imageUrl:'./assets/event-sea.jpg', source:'自衛隊福岡地方協力本部', details:section,
    forceCategory:'艦艇・一般公開' }));
  return out;
}

function parseUnitEventCandidates(markdown, unit) {
  const out = [];
  const lines = markdown.normalize('NFKC').split('\n');
  const eventWords = /一般公開|一般開放|基地(?:一般)?開放|基地祭|フリート(?:ウィーク|フェスタ)|オータムフェスタ|サマーフェスタ|スウェルフェスタ|体験航海|艦艇見学/;
  const rejectWords = /出店|売店|業者|募集要領|過去のイベント|活動の様子|終了しました|開催中止|中止となりました/;
  for (let i = 0; i < lines.length; i++) {
    const heading = clean(lines[i]).replace(/^#+\s*/, '');
    if (!eventWords.test(heading) || rejectWords.test(heading) || heading.length < 5 || heading.length > 90) continue;
    const nearby = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 7)).join(' ');
    if (rejectWords.test(nearby)) continue;
    const eventDates = dates(nearby);
    if (!eventDates.length) continue;
    const title = heading.replace(/^.*?Image:\s*/, '').replace(/^イベント情報\s*/, '').trim();
    if (!title || /^(?:一般公開|一般開放|基地一般開放)$/.test(title)) continue;
    for (const date of eventDates) out.push(makeEvent({ date, region:unit.region, branch:'海自', title,
      location:unit.location, officialUrl:unit.url, imageUrl:'./assets/event-sea.jpg', source:`海上自衛隊 ${unit.name}`,
      details:nearby, forceCategory:/艦|航海/.test(title) ? '艦艇・一般公開' : '基地祭・記念行事' }));
  }
  return out;
}

async function main() {
  let previousData = { events:[], seaUnitSources:[] };
  try { previousData = JSON.parse(await fs.readFile(path.join(ROOT, 'data.json'), 'utf8')); } catch {}
  const response = await fetch(SOURCE, { headers: { 'User-Agent': 'jsdf-events/1.0' } });
  if (!response.ok) throw new Error(`取得失敗: ${response.status}`);
  const markdown = await response.text();
  const [landBandText, musicFestivalText, chibaPoliceText, kanagawaPoliceText, seaKureText, seaTateyamaText, seaHachinoheText, seaFukuokaText, cocoyokoBaseText] = await Promise.all([
    fetchOptional(LAND_BAND_SOURCE, '第1音楽隊'), fetchOptional(MUSIC_FESTIVAL_SOURCE, '自衛隊音楽まつり'),
    fetchOptional(CHIBA_POLICE_SOURCE, '千葉県警音楽隊'), fetchOptional(KANAGAWA_POLICE_SOURCE, '神奈川県警音楽隊'),
    fetchOptional(SEA_KURE_SOURCE, '海自呉地方隊'), fetchOptional(SEA_TATEYAMA_SOURCE, '海自館山航空基地'),
    fetchOptional(SEA_HACHINOHE_SOURCE, '海自八戸航空基地'), fetchOptional(SEA_FUKUOKA_SOURCE, '福岡地本しらせ一般公開'),
    fetchOptional(COCOYOKO_BASE_SOURCE, '横須賀市観光情報 米海軍・自衛隊一覧')
  ]);
  const unitTexts = new Array(SEA_UNIT_SOURCES.length).fill('');
  const rotation = Math.floor(Date.now() / 86400000) % 4;
  // 無料取得先への負荷を抑えるため4組を日替わり巡回し、4日で全基地を確認する。
  for (let index = 0; index < SEA_UNIT_SOURCES.length; index++) {
    if (index % 4 !== rotation) continue;
    const unit = SEA_UNIT_SOURCES[index];
    unitTexts[index] = await fetchOptional(`https://r.jina.ai/${unit.url}`, unit.name);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  const freshUnitEvents = unitTexts.flatMap((text, index) => text ? parseUnitEventCandidates(text, SEA_UNIT_SOURCES[index]) : []);
  const preservedUnitEvents = SEA_UNIT_SOURCES.flatMap((unit, index) => unitTexts[index] ? [] : previousData.events.filter(event => event.source === `海上自衛隊 ${unit.name}`));
  const unitEvents = [...preservedUnitEvents, ...freshUnitEvents];
  const previousUnitStatus = new Map((previousData.seaUnitSources || []).map(item => [item.url, item]));
  const unitSourceStatus = SEA_UNIT_SOURCES.map((unit, index) => ({ name:unit.name, url:unit.url,
    fetched:Boolean(unitTexts[index]) || Boolean(previousUnitStatus.get(unit.url)?.fetched), checkedToday:index % 4 === rotation }));
  const calendarMonths = [0,1,2].map(offset => { const d = new Date(); d.setMonth(d.getMonth() + offset); return [d.getFullYear(), d.getMonth() + 1]; });
  const tokyoPolicePages = await Promise.all(calendarMonths.map(([y,m]) => fetchOptional(
    `https://r.jina.ai/${TOKYO_POLICE_BASE}calendar${y}${String(m).padStart(2,'0')}.html`, '警視庁カレンダー')));
  const tokyoPoliceEvents = tokyoPolicePages.flatMap((text, i) => parseTokyoPoliceCalendar(text, ...calendarMonths[i]));
  const tokyoPoliceMusicPages = await Promise.all(calendarMonths.map(([y,m]) => fetchOptional(
    `https://r.jina.ai/${TOKYO_POLICE_MUSIC_BASE}calendar${y}${String(m).padStart(2,'0')}.html`, '警視庁音楽隊カレンダー')));
  const tokyoPoliceMusicEvents = tokyoPoliceMusicPages.flatMap((text, i) => parseTokyoPoliceCalendar(text, ...calendarMonths[i], 'music'));
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
  const kanagawaPoliceEvents = parseKanagawaPolice(kanagawaPoliceText);
  const seaRegionalEvents = [...parseSeaKure(seaKureText), ...parseSeaTateyama(seaTateyamaText),
    ...parseSeaHachinohe(seaHachinoheText), ...parseSeaFukuoka(seaFukuokaText)];
  const cocoyokoBaseEvents = await parseCocoyokoBase(cocoyokoBaseText);
  console.log(`追加取得: 海自地方公式${seaRegionalEvents.length}件 / 第1音楽隊${landBandEvents.length}件 / 音楽まつり${musicFestivalEvents.length}件 / 千葉県警${chibaPoliceEvents.length}件 / 神奈川県警${kanagawaPoliceEvents.length}件 / 警視庁${tokyoPoliceEvents.length + tokyoPoliceMusicEvents.length}件`);
  const portEvents = PORT_SUPPLEMENTS.map(item => makeEvent({ ...item, forceCategory:item.category }));
  const regionalEvents = REGIONAL_SUPPLEMENTS.map(item => makeEvent({ ...item, forceCategory:item.category }));
  const optionalSuccesses = [landBandText, musicFestivalText, chibaPoliceText, kanagawaPoliceText, seaKureText, seaTateyamaText, seaHachinoheText, seaFukuokaText, cocoyokoBaseText,
    ...tokyoPolicePages, ...tokyoPoliceMusicPages].filter(Boolean).length;
  const degraded = optionalSuccesses < 6;
  if (degraded) console.warn(`取得先障害を検出: 前回の正常データを保持します（成功${optionalSuccesses}系統）`);
  const combined = [...(degraded ? previousData.events : []), ...parse(markdown), ...seaEvents, ...seaRegionalEvents, ...unitEvents, ...cocoyokoBaseEvents, ...supplemental, ...landBandEvents, ...portEvents, ...regionalEvents,
    ...musicFestivalEvents, ...chibaPoliceEvents, ...kanagawaPoliceEvents, ...tokyoPoliceEvents, ...tokyoPoliceMusicEvents];
  const unique = [...new Map(combined.map(e => [`${e.date}|${e.title.replace(/[（(].*$/,'')}`, e])).values()];
  const events = unique
    .filter(e => !isCancelled(e))
    .filter(e => new Date(`${e.date}T00:00:00+09:00`) >= now)
    .map(e => ({ ...e, sourceType:inferSourceType(e), openType:inferOpenType(e) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const data = { updatedAt: new Date().toISOString(), sourceUrl: 'https://www.mod.go.jp/j/press/events/', seaSourceUrl: SEA_OFFICIAL,
    seaSources:[SEA_OFFICIAL, SEA_KURE_OFFICIAL, SEA_TATEYAMA_OFFICIAL, SEA_HACHINOHE_OFFICIAL, SEA_FUKUOKA_OFFICIAL],
    portSources:PORT_OFFICIAL_SOURCES, foreignVesselSources:FOREIGN_VESSEL_SOURCES, baseOpenSources:BASE_OPEN_SOURCES,
    militaryPortCitySources:MILITARY_PORT_CITY_SOURCES,
    regionalSources:REGIONAL_SUPPLEMENTS.map(item => item.officialUrl),
    kanagawaPrioritySources:KANAGAWA_PRIORITY_SOURCES,
    seaUnitSources:unitSourceStatus,
    policeSources:[CHIBA_POLICE_OFFICIAL, KANAGAWA_POLICE_OFFICIAL, TOKYO_POLICE_BASE], count: events.length, events };
  await fs.writeFile(path.join(ROOT, 'data.json'), JSON.stringify(data, null, 2) + '\n');
  console.log(`${events.length}件を書き出しました`);
}

main().catch(error => { console.error(error); process.exit(1); });
