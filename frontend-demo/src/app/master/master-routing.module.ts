import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from '../shared/layouts/home-layout.component';
import { LabelMasterComponent } from './label-master/label-master.component';
import { LanguageMasterComponent } from './language-master/language-master.component';
import { ThemeMasterComponent } from './theme-master/theme-master.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        component: LanguageMasterComponent
      },
      {
        path: 'lableMaster',
        component: LabelMasterComponent
      },
      {
        path: 'themeMaster',
        component: ThemeMasterComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
