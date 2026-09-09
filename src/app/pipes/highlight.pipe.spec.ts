import { HighlightPipe } from './highlight.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('HighlightPipe', () => {
  it('create an instance', () => {
    const sanitizer = { bypassSecurityTrustHtml: (value: string) => value } as unknown as DomSanitizer;
    const pipe = new HighlightPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});

