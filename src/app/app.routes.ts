import { Routes } from '@angular/router';
import { AllSurveys } from './all-surveys/all-surveys';
import { Survey } from './survey/survey';
import { Home } from './home/home';
import { UpdateSurvey } from './update-survey/update-survey';

export const routes: Routes = [
	{ path: 'all-surveys', component: AllSurveys },
	{ path: 'update-survey', component: UpdateSurvey },
	{ path: 'survey', component: Survey },
	{ path: 'home', component: Home },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', redirectTo: 'home' }
];
