import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PdfViewerComponent } from './pdf-viewer.component';
import { SearchService } from '../../services/search.service';

describe('PdfViewerComponent', () => {
  let component: PdfViewerComponent;
  let fixture: ComponentFixture<PdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PdfViewerComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { documentId: 'test-document' } },
        { provide: SearchService, useValue: {
          getDocument: () => of({ id: 'test-document', text: '', metadata: {}, document_url: '/api/documents/test-document', source_url: null }),
          getSourceUrl: () => '/api/documents/test-document/source',
        } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
