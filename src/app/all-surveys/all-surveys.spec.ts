import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSurveys } from './all-surveys';

describe('AllSurveys', () => {
  let component: AllSurveys;
  let fixture: ComponentFixture<AllSurveys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSurveys]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSurveys);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
