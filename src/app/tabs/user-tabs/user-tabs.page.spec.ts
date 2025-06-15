import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTabsPage } from './user-tabs.page';

describe('UserTabsPage', () => {
  let component: UserTabsPage;
  let fixture: ComponentFixture<UserTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
