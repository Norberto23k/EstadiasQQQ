import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InUsePage } from './in-use.page';

describe('InUsePage', () => {
  let component: InUsePage;
  let fixture: ComponentFixture<InUsePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InUsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
