import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SearchService } from 'src/app/services/search.service';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-phrase-dialog',
  templateUrl: './phrase-dialog.component.html',
  styleUrls: ['./phrase-dialog.component.css'] // on peut réutiliser le même css
})
export class PhraseDialogComponent {
  constructor(
    private searchService: SearchService, private dialog: MatDialog,
    public dialogRef: MatDialogRef<PhraseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { phrase: string; lawData?: any }
  ) {}

  openPdf(chunkId: number) {
    this.searchService.getDocument(String(chunkId)).subscribe({
      next: (res: any) => {
        // console.log('📄 URL PDF envoyée au viewer:', res.file_url);
        this.dialog.open(PdfViewerComponent, {
          width: '90vw',
          height: '95vh',
          data: {
            fileUrl: res.file_url,
            page: res.page,
            searchTerms: null
          }
        });
      },
      error: (err: unknown) => console.error('Unable to open document:', err)
    });
  }
}
