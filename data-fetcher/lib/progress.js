// progress.js — Terminal progress display (no external deps)
import { performance } from 'perf_hooks';

export class Progress {
  constructor(label, total) {
    this.label = label;
    this.total = total;
    this.done = 0;
    this.skipped = 0;
    this.failed = 0;
    this.current = '';
    this.startTime = performance.now();
    this._lastRender = 0;
  }

  tick({ success = false, skip = false, fail = false, label = '' } = {}) {
    if (success || skip) this.done++;
    if (skip) this.skipped++;
    if (fail) this.failed++;
    if (label) this.current = label;
    this._render();
  }

  _render() {
    const now = performance.now();
    // Throttle renders to max 10/sec
    if (now - this._lastRender < 100) return;
    this._lastRender = now;

    const pct = this.total > 0 ? Math.round((this.done / this.total) * 100) : 0;
    const bar = this._bar(pct);
    const elapsed = ((now - this.startTime) / 1000).toFixed(1);
    const line = `  ${this.label} ${bar} ${pct}% (${this.done}/${this.total}) ${elapsed}s  ${this.current.slice(0, 30)}`;
    process.stdout.write(`\r${line.padEnd(100)}`);
  }

  _bar(pct) {
    const width = 20;
    const filled = Math.round((pct / 100) * width);
    return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
  }

  finish() {
    this._lastRender = 0;
    this._render();
    process.stdout.write('\n');
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);
    const lines = [
      `  ✓ ${this.label}: ${this.done} traités en ${elapsed}s`,
    ];
    if (this.skipped > 0) lines.push(`    ↷ ${this.skipped} déjà existants (ignorés)`);
    if (this.failed > 0) lines.push(`    ✗ ${this.failed} échecs`);
    console.log(lines.join('\n'));
  }
}

export function printHeader(title) {
  console.log('\n' + '─'.repeat(60));
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

export function printSummary(results) {
  console.log('\n' + '═'.repeat(60));
  console.log('  RÉSUMÉ FINAL');
  console.log('═'.repeat(60));

  const rows = [
    ['Module', 'Total', 'Téléchargés', 'Ignorés', 'Échecs'],
    ['───────────────', '─────', '────────────', '───────', '──────'],
    ...results.map(r => [r.label, r.total, r.downloaded, r.skipped, r.failed]),
  ];

  for (const row of rows) {
    console.log(
      '  ' + row[0].toString().padEnd(18) +
      row[1].toString().padStart(6) +
      row[2].toString().padStart(13) +
      row[3].toString().padStart(8) +
      row[4].toString().padStart(7)
    );
  }
  console.log('═'.repeat(60));
}
