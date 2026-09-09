
import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { BrandingConfig, FrontendLabels } from './models/search-api.models';
import { SearchService } from './services/search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showTitle = true;
  branding?: BrandingConfig;
  labels?: FrontendLabels;

  constructor(private router: Router, private readonly searchService: SearchService, @Inject(DOCUMENT) private readonly document: Document) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Hide title if route is /chatbot
        this.showTitle = !event.urlAfterRedirects.startsWith('/chatbot');
      });
  }

  ngOnInit(): void {
    this.searchService.getConfig().subscribe({
      next: config => {
        this.branding = config.branding;
        this.labels = config.labels;
        this.document.title = config.branding.page_title || config.branding.title;
        const direction = config.branding.direction || 'ltr';
        this.document.documentElement.dir = direction;
        this.document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
        if (config.branding.primary_color) this.document.documentElement.style.setProperty('--primary-color', config.branding.primary_color);
        this.applyFavicon(config.branding.favicon_url);
      }
    });
  }

  private applyFavicon(faviconUrl?: string | null): void {
    if (!faviconUrl) return;

    let favicon = this.document.head.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!favicon) {
      favicon = this.document.createElement('link');
      favicon.rel = 'icon';
      this.document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
    favicon.type = faviconUrl.toLowerCase().includes('.svg') ? 'image/svg+xml' : 'image/x-icon';
  }
}
