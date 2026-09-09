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
  let serviceSpy: jasmine.SpyObj<SearchService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<SearchService>('SearchService', ['getDocument', 'getSourceUrl']);
    serviceSpy.getDocument.and.returnValue(of({ id: 'test-document', text: '', metadata: {}, document_url: '/api/documents/test-document', source_url: null }));
    serviceSpy.getSourceUrl.and.returnValue('/api/documents/test-document/source');
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PdfViewerComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { documentId: 'test-document' } },
        { provide: SearchService, useValue: serviceSpy },
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

  it('uses the configured API origin for a relative backend source URL', () => {
    serviceSpy.getDocument.and.returnValue(of({
      id: 'document#page=3', text: '', metadata: { source_page: 3 },
      document_url: '/api/documents/document', source_url: '/api/documents/document/source#page=3',
    }));
    serviceSpy.getSourceUrl.and.returnValue('http://localhost:5000/api/documents/document%23page%3D3/source');

    component.ngOnInit();

    expect(component.fileUrl).toBe('http://localhost:5000/api/documents/document%23page%3D3/source');
    expect(component.targetPage).toBe(3);
  });
});
