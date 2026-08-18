import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataViewModule } from 'primeng/dataview';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';

import { HighlightPipe } from './pipes/highlight.pipe';
import { HighlightComponent } from './components/highlight/highlight.component';
import { DescriptionDialogComponent } from './components/description-dialog/description-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

// ✅ NEW (needed by Admin UI)
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';   // ✅ ADD THIS

import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { CheckboxModule } from 'primeng/checkbox';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';

// ✅ Admin page
import { AdminComponent } from './components/admin/admin.component';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    HighlightPipe,
    HighlightComponent,
    DescriptionDialogComponent,
    PdfViewerComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DataViewModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    MatIconModule,
    CommonModule,
    NgxExtendedPdfViewerModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,

    // ✅ NEW
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTableModule, // ✅ ADD THIS

    CalendarModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    ChipsModule,
    CheckboxModule,
	AutoCompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }