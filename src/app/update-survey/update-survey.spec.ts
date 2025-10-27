import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSurvey } from './update-survey';

describe('UpdateSurvey', () => {
  let component: UpdateSurvey;
  let fixture: ComponentFixture<UpdateSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSurvey]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSurvey);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
