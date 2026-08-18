import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-description-dialog',
  templateUrl: './description-dialog.component.html',
  styleUrls: ['./description-dialog.component.css']
})
export class DescriptionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      subtitle?: string;
      description: string;
      searchTerms?: string[];
      sourceRanges?: Array<[number, number] | number[] | { start: number; end: number }>;
      metadata?: {
        filename?: string;
        doctype?: string;
        lawnumber?: string;
        date?: string;
        subjects?: string[];
        signatures?: string[];
        page?: string | number;
      };
    }
  ) {}
}