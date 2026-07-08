import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoreComponent } from './core.component';
import { CoreRoutingModule } from './core-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DataTablesModule } from 'angular-datatables';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer'
import { DatePipe } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { NotificationComponent } from './notification/notification.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NewTestComponent } from './new-test/new-test.component';
import { LandingHomeComponent } from './landing-home/landing-home.component';
import { OverviewComponent } from './overview/overview.component';
import { CartComponent } from './cart/cart.component';
import { UpdateTestComponent } from './update-test/update-test.component';
import { PackageComponent } from './package/package.component';
import { UpdatePackageComponent } from './update-package/update-package.component';
import { PopularTestComponent } from './popular-test/popular-test.component';
import { PopularPackageComponent } from './popular-package/popular-package.component';
import { KeysPipe } from '../../keys.pipe'; // <-- Add this
import { DropdownModule } from 'primeng/dropdown';
import { ListTestComponent } from './list-test/list-test.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConsentFormsComponent } from './consent-forms/consent-forms.component';
import { ResourcesComponent } from './resources/resources.component';
import { TestAlgorithmsComponent } from './test-algorithms/test-algorithms.component';
import { FaqComponent } from './faq/faq.component';
import { SampleCollectionManualComponent } from './sample-collection-manual/sample-collection-manual.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
import { SynOverviewComponent } from './syn-overview/syn-overview.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { DiseaseComponent } from './disease/disease.component';
import { SpecialityTestingComponent } from './speciality-testing/speciality-testing.component';
import { PaginatorModule } from 'primeng/paginator';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DoctorSpecialityComponent } from './doctor-speciality/doctor-speciality.component';
import { DiseaseTableComponent } from './disease-table/disease-table.component';
import { CountdownModule } from 'ngx-countdown';
import { NgOtpInputModule } from  'ng-otp-input';
import { VideoGalleryComponent } from './video-gallery/video-gallery.component';

@NgModule({
  declarations: [
    
    DashboardComponent,
    CoreComponent,
    NotificationComponent,
    NewTestComponent,
    LandingHomeComponent,
    OverviewComponent,
    CartComponent,
    UpdateTestComponent,
    PackageComponent,
    UpdatePackageComponent,
    PopularTestComponent,
    PopularPackageComponent,
    KeysPipe,
    ListTestComponent,
    ConsentFormsComponent,
    ResourcesComponent,
    TestAlgorithmsComponent,
    FaqComponent,
    SampleCollectionManualComponent,
    SymptomsComponent,
    SynOverviewComponent,
    ResourcesComponent,
    ConsentFormsComponent,
    DiseaseComponent,
    SpecialityTestingComponent,
    DoctorSpecialityComponent,
    DiseaseTableComponent,
    VideoGalleryComponent
  ],
  imports: [
    CommonModule,CountdownModule,
    FormsModule,NgOtpInputModule,
    ReactiveFormsModule,
    CoreRoutingModule,
    QRCodeModule,
    DataTablesModule,
    FormsModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    CarouselModule,
    HttpClientModule,
    TooltipModule.forRoot(),
    NgxExtendedPdfViewerModule,
    PdfViewerModule,
    NgSelectModule,
    DropdownModule,
    TableModule,
    PaginatorModule,
    ButtonModule,
    AccordionModule.forRoot(),
    AutoCompleteModule,
  
  ],
  providers: [
    DatePipe
  ]
})
export class CoreModule { }
