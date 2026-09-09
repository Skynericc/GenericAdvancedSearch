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
      metadata: { title: 'Configured title', tags: ['one', 'two'] },
    };
    fixture.detectChanges();
  });

  it('renders only configured metadata fields and falls back for absent values', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Configured title');
    expect(element.textContent).toContain('one, two');
    expect(element.textContent).toContain('—');
    expect(element.querySelectorAll('.metadata-row').length).toBe(3);
  });
});
