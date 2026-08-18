import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';

type UploadItem = {
  file: File;
  name: string;
  sizeLabel: string;
  ext: string;
};

type DocProgress = {
  doc_key: string;
  name: string;
  rel_path?: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  percent: number;
  current_page: number;
  total_pages: number;
  message?: string;
};

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  dragging = false;
  isProcessing = false;

  selected: UploadItem[] = [];
  doneMessage: string | null = null;

  allowedExt = ['pdf'];

  jobId: string | null = null;
  progressDocs: DocProgress[] = [];
  private es?: EventSource;

  constructor(
    private router: Router,
    private snack: MatSnackBar,
    private adminService: AdminService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.closeStream();
  }

  private closeStream(): void {
    if (this.es) {
      this.es.close();
      this.es = undefined;
    }
  }

  backToSearch(): void {
    this.router.navigate(['/search']);
  }

  onBrowseFiles(input: HTMLInputElement): void {
    input.click();
  }

  onFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length) {
      this.addFiles(Array.from(files));
    }

    input.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragging = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragging = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragging = false;

    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this.addFiles(Array.from(files));
    }
  }

  remove(i: number): void {
    this.selected.splice(i, 1);
    this.doneMessage = null;
  }

  clearAll(): void {
    this.selected = [];
    this.doneMessage = null;
  }

  private addFiles(files: File[]): void {
    const added: UploadItem[] = [];
    const rejected: string[] = [];

    for (const f of files) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();

      if (!this.allowedExt.includes(ext)) {
        rejected.push(f.name);
        continue;
      }

      const dup = this.selected.some(x => x.name === f.name && x.file.size === f.size);
      if (dup) continue;

      added.push({
        file: f,
        name: f.name,
        ext,
        sizeLabel: this.formatBytes(f.size)
      });
    }

    if (rejected.length) {
      this.snack.open(
        `تم تجاهل ملفات غير مدعومة: ${rejected.slice(0, 3).join('، ')}${rejected.length > 3 ? ' ...' : ''}`,
        'حسنًا',
        { duration: 4500 }
      );
    }

    if (added.length) {
      this.selected = [...this.selected, ...added];
      this.doneMessage = null;
      this.snack.open(`تمت إضافة ${added.length} ملف(ات) PDF.`, 'حسنًا', { duration: 2500 });
    }
  }

  process(): void {
    if (!this.selected.length || this.isProcessing) return;

    this.isProcessing = true;
    this.doneMessage = null;
    this.jobId = null;
    this.progressDocs = [];
    this.closeStream();

    const files = this.selected.map(x => x.file);

    this.adminService.startProcessDocuments(files).subscribe({
      next: (res: any) => {
        const jobId = res?.job_id;

        if (!jobId) {
          this.snack.open('لم يتم الحصول على job_id من الخادم.', 'حسنًا', { duration: 4000 });
          this.isProcessing = false;
          return;
        }

        this.jobId = jobId;

        this.progressDocs = (res?.docs || []).map((d: any, index: number) => ({
          doc_key: d.doc_key || d.stored_name || d.original_name || `doc-${index}`,
          name: d.original_name || d.name || d.stored_name || `ملف ${index + 1}`,
          rel_path: d.stored_path || d.rel_path || '',
          status: 'done',
          percent: 100,
          current_page: 0,
          total_pages: 0,
          message: 'تم قبول الرفع'
        }));

        this.es = this.adminService.openProgressStream(jobId);

        this.es.addEventListener('progress', (ev: MessageEvent) => {
          this.zone.run(() => {
            try {
              const data = JSON.parse(ev.data || '{}');
              this.applyProgressSnapshot(data);
            } catch {
              // ignore malformed progress events
            }
          });
        });

        this.es.addEventListener('done', (ev: MessageEvent) => {
          this.zone.run(() => {
            try {
              const data = JSON.parse(ev.data || '{}');
              this.applyProgressSnapshot(data);

              const msg = data?.message || 'تم قبول الرفع. الإدماج التلقائي غير مفعّل حالياً.';
              this.doneMessage = msg;
              this.snack.open(msg, 'حسنًا', { duration: 4000 });
            } catch {
              this.doneMessage = 'تم قبول الرفع. الإدماج التلقائي غير مفعّل حالياً.';
            } finally {
              this.isProcessing = false;
              this.closeStream();
            }
          });
        });

        this.es.onerror = (err) => {
          console.error('SSE error', err);
          this.zone.run(() => {
            this.snack.open('انقطع اتصال التقدّم. قد يكون الخادم أكمل العملية بالفعل.', 'حسنًا', { duration: 5000 });
            this.isProcessing = false;
            this.closeStream();
          });
        };
      },
      error: (err) => {
        console.error(err);
        this.snack.open('حدث خطأ أثناء رفع الملفات. تحقق من الخادم.', 'حسنًا', { duration: 4500 });
        this.isProcessing = false;
      }
    });
  }

  private applyProgressSnapshot(data: any): void {
    const docs = data?.docs || [];
    if (!Array.isArray(docs)) return;

    this.progressDocs = docs.map((d: any, index: number) => ({
      doc_key: d.doc_key || d.stored_name || d.original_name || `doc-${index}`,
      name: d.original_name || d.name || d.stored_name || `ملف ${index + 1}`,
      rel_path: d.stored_path || d.rel_path || '',
      status: 'done',
      percent: 100,
      current_page: 0,
      total_pages: 0,
      message: 'تم قبول الرفع'
    }));
  }

  private formatBytes(bytes: number): string {
    if (!bytes && bytes !== 0) return '-';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    const v = bytes / Math.pow(k, i);

    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }
}