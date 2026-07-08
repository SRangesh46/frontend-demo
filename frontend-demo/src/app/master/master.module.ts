import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageMasterComponent } from './language-master/language-master.component';
import { LabelMasterComponent } from './label-master/label-master.component';
import { ThemeMasterComponent } from './theme-master/theme-master.component';
import { MasterRoutingModule } from './master-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
// import { NgxPrettyCheckboxModule } from 'ngx-pretty-checkbox';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DataTablesModule } from 'angular-datatables';
@NgModule({
  declarations: [
    LanguageMasterComponent,
    LabelMasterComponent,
    ThemeMasterComponent
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxPrettyCheckboxModule,
    TabsModule,
    ModalModule,
    DataTablesModule
  ]
})
export class MasterModule { }
