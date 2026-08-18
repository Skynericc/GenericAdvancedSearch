import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
    
    const regex = new RegExp(this.escapeRegExp(search), 'gi');
    const highlighted = value.replace(regex, match => 
      `<span class="highlight">${match}</span>`
    );
    
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}
