const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

function loadParser() {
  const file = path.resolve(__dirname, '../scripts/fetch-events.js');
  const source = fs.readFileSync(file, 'utf8');
  const runtime = source.slice(0, source.indexOf('\nasync function main()'));
  const loaded = new Module(file);
  loaded.filename = file;
  loaded.paths = Module._nodeModulePaths(path.dirname(file));
  loaded._compile(`${runtime}\nmodule.exports = { parseUnitEventCandidates };`, file);
  return loaded.exports;
}

const { parseUnitEventCandidates } = loadParser();
const unit = { name:'試験航空基地', region:'青森', location:'海上自衛隊 試験航空基地', url:'https://example.test/events' };

test('unit crawler admits a dated public event without a known event name', () => {
  const markdown = `
## 航空基地ふれあいデー2026
令和8年10月18日に開催します。
どなたでも入場でき、航空機の地上展示と音楽演奏を予定しています。
`;
  const rows = parseUnitEventCandidates(markdown, unit);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, '航空基地ふれあいデー2026');
  assert.equal(rows[0].date, '2026-10-18');
});

test('unit crawler still rejects vendor recruitment notices', () => {
  const markdown = `
## 航空基地ふれあいデー2026 出店業者募集要領
令和8年10月18日の出店業者を募集します。
`;
  assert.deepEqual(parseUnitEventCandidates(markdown, unit), []);
});
