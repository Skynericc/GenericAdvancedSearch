import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-phrase-dialog',
  templateUrl: './phrase-dialog.component.html',
  styleUrls: ['./phrase-dialog.component.css'] // on peut réutiliser le même css
})
export class PhraseDialogComponent {
  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<PhraseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { phrase: string; lawData?: any }
  ) {}

  openPdf(chunkId: string | number) {
    this.dialog.open(PdfViewerComponent, {
      width: '90vw',
      height: '95vh',
      data: { documentId: String(chunkId), searchTerms: [] }
    });
  }
}
