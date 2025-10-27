import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllSurveys } from '../all-surveys/all-surveys';
import { Survey } from '../survey/survey';
import { RouterModule as NgRouterModule } from '@angular/router';
import { Home } from '../home/home'; 


import { RouterRoutingModule } from './router-routing-module';

@NgModule({
  imports: [
    CommonModule,
    RouterRoutingModule
  ],
  exports: [RouterRoutingModule]
})
export class RouterModule { }
