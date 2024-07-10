import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListsComponent } from './view-lists.component';

describe('ViewListsComponent', () => {
  let component: ViewListsComponent;
  let fixture: ComponentFixture<ViewListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewListsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
