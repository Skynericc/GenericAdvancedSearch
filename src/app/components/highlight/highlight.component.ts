import { Component, Input, OnChanges } from '@angular/core';

type Part = { text: string; highlight: boolean };
type SourceRangeInput =
  | [number, number]
  | number[]
  | { start: number; end: number };

@Component({
  selector: 'app-highlight',
  template: `
    <span *ngFor="let part of parts" [class.highlight]="part.highlight">
      {{ part.text }}
    </span>
  `,
  styles: [`
    .highlight {
      background-color: yellow;
      color: black;
      font-weight: bold;
    }
  `]
})
export class HighlightComponent implements OnChanges {
  @Input() text: string = '';
  @Input() searchTerms: string[] = [];

  /**
   * ✅ NEW:
   * Explicit ranges [start, end) to highlight directly in the ORIGINAL text.
   * Used for semantic search results (source_ranges from backend).
   */
  @Input() sourceRanges: SourceRangeInput[] = [];

  parts: Part[] = [];

  ngOnChanges(): void {
    const text = this.text || '';

    // ✅ Prefer exact source ranges when provided (semantic mode)
    const rangeParts = this.buildHighlightedPartsFromRanges(text, this.sourceRanges || []);
    if (rangeParts) {
      this.parts = rangeParts;
      return;
    }

    // fallback to old keyword-based highlighting (lexical mode)
    this.parts = this.buildHighlightedParts(text, this.searchTerms || []);
  }

  // ------------------------------------------------------------------
  // NEW: exact highlight by ranges ([start,end) Python slicing style)
  // ------------------------------------------------------------------
  private buildHighlightedPartsFromRanges(originalText: string, rawRanges: SourceRangeInput[]): Part[] | null {
    if (!originalText) return [{ text: '', highlight: false }];
    if (!Array.isArray(rawRanges) || rawRanges.length === 0) return null;

    const ranges: Array<{ start: number; end: number }> = [];

    for (const r of rawRanges) {
      let a: any;
      let b: any;

      if (Array.isArray(r) && r.length >= 2) {
        a = r[0];
        b = r[1];
      } else if (r && typeof r === 'object' && 'start' in r && 'end' in r) {
        a = (r as any).start;
        b = (r as any).end;
      } else {
        continue;
      }

      const start = Number(a);
      const end = Number(b);

      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

      let s = Math.trunc(start);
      let e = Math.trunc(end);

      // assume [start, end) (end exclusive)
      if (e < s) {
        const t = s; s = e; e = t;
      }

      s = Math.max(0, Math.min(originalText.length, s));
      e = Math.max(0, Math.min(originalText.length, e));

      if (e <= s) continue;

      ranges.push({ start: s, end: e });
    }

    if (ranges.length === 0) return null;

    ranges.sort((x, y) => x.start - y.start || x.end - y.end);

    // merge overlapping/touching ranges
    const merged: Array<{ start: number; end: number }> = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (!last) {
        merged.push({ ...r });
      } else if (r.start <= last.end) {
        last.end = Math.max(last.end, r.end);
      } else {
        merged.push({ ...r });
      }
    }

    const parts: Part[] = [];
    let cursor = 0;

    for (const r of merged) {
      if (r.start > cursor) {
        parts.push({ text: originalText.slice(cursor, r.start), highlight: false });
      }
      parts.push({ text: originalText.slice(r.start, r.end), highlight: true });
      cursor = r.end;
    }

    if (cursor < originalText.length) {
      parts.push({ text: originalText.slice(cursor), highlight: false });
    }

    return parts.length ? parts : [{ text: originalText, highlight: false }];
  }

  // ------------------------------------------------------------------
  // Existing keyword-based highlight (lexical mode)
  // ------------------------------------------------------------------
  private buildHighlightedParts(originalText: string, rawTerms: string[]): Part[] {
    if (!originalText) return [{ text: '', highlight: false }];

    const terms = rawTerms.map(t => (t || '').trim()).filter(Boolean);
    if (terms.length === 0) return [{ text: originalText, highlight: false }];

    const { norm, mapNormToOrig } = this.normalizeWithMap(originalText);

    const normTerms = Array.from(new Set(
      terms.map(t => this.normalizeArabic(t)).filter(Boolean)
    )).sort((a, b) => b.length - a.length);

    if (normTerms.length === 0 || !norm) return [{ text: originalText, highlight: false }];

    const matches: Array<{ start: number; end: number }> = [];

    for (const nt of normTerms) {
      let from = 0;
      while (from <= norm.length) {
        const idx = norm.indexOf(nt, from);
        if (idx === -1) break;
        matches.push({ start: idx, end: idx + nt.length });
        from = idx + Math.max(1, nt.length);
      }
    }

    if (matches.length === 0) return [{ text: originalText, highlight: false }];

    matches.sort((a, b) => a.start - b.start || a.end - b.end);
    const merged: Array<{ start: number; end: number }> = [];
    for (const m of matches) {
      const last = merged[merged.length - 1];
      if (!last || m.start > last.end) merged.push({ ...m });
      else last.end = Math.max(last.end, m.end);
    }

    const ranges: Array<{ start: number; end: number }> = merged.map(r => {
      const startOrig = this.normIndexToOrigIndex(mapNormToOrig, r.start);
      const endOrigExclusive = this.normIndexToOrigIndex(mapNormToOrig, r.end - 1) + 1;
      return {
        start: Math.max(0, Math.min(originalText.length, startOrig)),
        end: Math.max(0, Math.min(originalText.length, endOrigExclusive)),
      };
    }).filter(r => r.end > r.start);

    ranges.sort((a, b) => a.start - b.start || a.end - b.end);
    const mergedRanges: Array<{ start: number; end: number }> = [];
    for (const r of ranges) {
      const last = mergedRanges[mergedRanges.length - 1];
      if (!last || r.start > last.end) mergedRanges.push({ ...r });
      else last.end = Math.max(last.end, r.end);
    }

    const parts: Part[] = [];
    let cursor = 0;
    for (const r of mergedRanges) {
      if (r.start > cursor) parts.push({ text: originalText.slice(cursor, r.start), highlight: false });
      parts.push({ text: originalText.slice(r.start, r.end), highlight: true });
      cursor = r.end;
    }
    if (cursor < originalText.length) parts.push({ text: originalText.slice(cursor), highlight: false });

    return parts.length ? parts : [{ text: originalText, highlight: false }];
  }

  private normalizeArabic(text: string): string {
    return (text || '')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // harakat + Quranic marks
      .replace(/ـ/g, '') // tatweel
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeWithMap(original: string): { norm: string; mapNormToOrig: number[] } {
    const map: number[] = [];
    const out: string[] = [];

    for (let i = 0; i < original.length; i++) {
      const ch = original[i];
      if (/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(ch)) continue;
      if (ch === 'ـ') continue;
      out.push(ch);
      map.push(i);
    }

    // collapse whitespace (best effort mapping)
    const normRaw = out.join('');
    const mapRaw = map;

    const norm2: string[] = [];
    const map2: number[] = [];

    let j = 0;
    while (j < normRaw.length) {
      const c = normRaw[j];
      if (/\s/.test(c)) {
        norm2.push(' ');
        map2.push(mapRaw[j]);
        while (j < normRaw.length && /\s/.test(normRaw[j])) j++;
      } else {
        norm2.push(c);
        map2.push(mapRaw[j]);
        j++;
      }
    }

    // trim norm2 and map2 together
    while (norm2.length && norm2[0] === ' ') { norm2.shift(); map2.shift(); }
    while (norm2.length && norm2[norm2.length - 1] === ' ') { norm2.pop(); map2.pop(); }

    return { norm: norm2.join(''), mapNormToOrig: map2 };
  }

  private normIndexToOrigIndex(mapNormToOrig: number[], normIndex: number): number {
    if (!mapNormToOrig.length) return 0;
    const i = Math.max(0, Math.min(mapNormToOrig.length - 1, normIndex));
    return mapNormToOrig[i];
  }
}