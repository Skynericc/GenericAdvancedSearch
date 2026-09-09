import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], declarations: [AppComponent] }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
  });
  it('creates', () => expect(fixture.componentInstance).toBeTruthy());
});
