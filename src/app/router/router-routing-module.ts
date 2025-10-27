import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllSurveys } from '../all-surveys/all-surveys';
import { Survey } from '../survey/survey';
import { Home } from '../home/home';

const routes: Routes = [
  { path: 'all-surveys', component: AllSurveys },
  { path: 'survey', component: Survey },
  { path: 'home', component: Home },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RouterRoutingModule { }
