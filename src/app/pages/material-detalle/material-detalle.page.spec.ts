import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialDetallePage } from './material-detalle.page';

describe('MaterialDetallePage', () => {
  let component: MaterialDetallePage;
  let fixture: ComponentFixture<MaterialDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
