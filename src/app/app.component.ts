
import { Component, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { BrandingConfig, FrontendLabels } from './models/search-api.models';
import { ConfigStore } from './services/config.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showTitle = true;
  branding?: BrandingConfig;
  labels?: FrontendLabels;

  constructor(private router: Router, private readonly configStore: ConfigStore, @Inject(DOCUMENT) private readonly document: Document) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Hide title if route is /chatbot
        this.showTitle = !event.urlAfterRedirects.startsWith('/chatbot');
      });
  }

  ngOnInit(): void {
    this.configStore.config$.subscribe({
      next: config => {
        this.branding = config.branding;
        this.labels = config.labels;
        const direction = config.branding.direction || 'ltr';
        this.document.documentElement.dir = direction;
        this.document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
        if (config.branding.primary_color) this.document.documentElement.style.setProperty('--primary-color', config.branding.primary_color);
      }
    });
  }
}
