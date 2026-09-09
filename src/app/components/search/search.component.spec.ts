import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormsModule, HttpClientTestingModule], declarations: [SearchComponent], schemas: [NO_ERRORS_SCHEMA] }).compileComponents();
    fixture = TestBed.createComponent(SearchComponent);
  });
  it('creates', () => expect(fixture.componentInstance).toBeTruthy());
});
