// Verifies WCAG 2.2 contrast for the MindCare palette. Run: node scripts/check-contrast.mjs
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const P = { primary: '#438F91', secondary: '#E8F3F5', canvas: '#F8FAFC', card: '#FFFFFF', ink: '#243447', warning: '#F5C66A',
  primaryStrong: '#2F6B6D', primaryStronger: '#265A5C', inkMuted: '#55667A', warnSoft: '#FDF3DC', warnInk: '#6B4A07', danger: '#B0413E', dangerSoft: '#FBEBEA',
  amberChart: '#B9852A', steelChart: '#5E7C99', violetChart: '#7A6AA8', line: '#DDE6EC' };
const checks = [
  ['ink on card (body text)', P.ink, P.card, 4.5], ['ink on canvas', P.ink, P.canvas, 4.5], ['ink on secondary', P.ink, P.secondary, 4.5],
  ['inkMuted on card', P.inkMuted, P.card, 4.5], ['inkMuted on canvas', P.inkMuted, P.canvas, 4.5], ['inkMuted on secondary', P.inkMuted, P.secondary, 4.5],
  ['EXACT primary as text on card', P.primary, P.card, 4.5], ['white on EXACT primary', P.card, P.primary, 4.5], ['ink on EXACT primary', P.ink, P.primary, 4.5],
  ['primaryStrong as text on card', P.primaryStrong, P.card, 4.5], ['primaryStrong text on secondary', P.primaryStrong, P.secondary, 4.5],
  ['white on primaryStrong (buttons)', P.card, P.primaryStrong, 4.5], ['white on primaryStronger (hover)', P.card, P.primaryStronger, 4.5],
  ['ink on warning (amber fill)', P.ink, P.warning, 4.5], ['warnInk on warnSoft', P.warnInk, P.warnSoft, 4.5],
  ['danger on card', P.danger, P.card, 4.5], ['danger on dangerSoft', P.danger, P.dangerSoft, 4.5],
  ['EXACT primary vs card (graphics/focus, 3:1)', P.primary, P.card, 3], ['primaryStrong vs card (focus ring 3:1)', P.primaryStrong, P.card, 3],
  ['amberChart vs card (3:1)', P.amberChart, P.card, 3], ['steelChart vs card (3:1)', P.steelChart, P.card, 3], ['violetChart vs card (3:1)', P.violetChart, P.card, 3],
  ['EXACT warning vs card (graphics 3:1)', P.warning, P.card, 3], ['ink vs card (graphics)', P.ink, P.card, 3], ['line (border) vs card (decorative only)', P.line, P.card, 1],
];
let bad = 0;
for (const [name, fg, bg, min] of checks) {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (need ${min})  ${name}`);
}
console.log(`\n${bad} failing pair(s) listed above.`);
