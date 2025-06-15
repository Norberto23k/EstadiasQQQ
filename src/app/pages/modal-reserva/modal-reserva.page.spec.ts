import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalReservaPage } from './modal-reserva.page';

describe('ModalReservaPage', () => {
  let component: ModalReservaPage;
  let fixture: ComponentFixture<ModalReservaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalReservaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
