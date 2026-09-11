import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultCardComponent } from './result-card.component';

describe('ResultCardComponent', () => {
  let fixture: ComponentFixture<ResultCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ResultCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ResultCardComponent);
    fixture.componentInstance.fields = ['title', 'missing', 'tags'];
    fixture.componentInstance.hit = {
      id: '1',
      metadata: { title: 'Configured title', tags: ['one', 'two'], source_file: 'bulletin.pdf', source_page: 3 },
      score: 0.4,
    };
    fixture.detectChanges();
  });

  it('renders only configured metadata fields and falls back for absent values', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Configured title');
    expect(element.textContent).toContain('الوثيقة');
    expect(element.textContent).toContain('bulletin.pdf');
    expect(element.textContent).toContain('الصفحة 3');
    expect(element.textContent).toContain('one, two');
    expect(element.textContent).toContain('—');
    expect(element.textContent).not.toContain('التقييم');
    expect(element.querySelectorAll('.metadata-row').length).toBe(3);
  });
});
