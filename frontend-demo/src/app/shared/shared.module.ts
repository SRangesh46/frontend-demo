import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponent } from './shared.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SearchPipe } from './sidebar/search.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberOnlyDirective } from './custom-derectives/number-only/number-only.directive';
import { NgOtpInputModule } from  'ng-otp-input';
import { CountdownModule } from 'ngx-countdown';
import { DropdownModule } from 'primeng/dropdown';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [SharedComponent, NavbarComponent, HomeLayoutComponent, LoginLayoutComponent, SidebarComponent, SearchPipe, NumberOnlyDirective,],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,NgOtpInputModule,CountdownModule,TabsModule,
    // BrowserModule,
    // NgxFlagPickerModule,
    RouterModule,
    // NgbModule
    ReactiveFormsModule,
    DropdownModule,NgxIntlTelInputModule,
    RouterModule,
    AutoCompleteModule
  ],
  exports: [NavbarComponent, HomeLayoutComponent, LoginLayoutComponent, NumberOnlyDirective],
  providers: [
  ],
})
export class SharedModule { }
