import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DataTablesModule } from 'angular-datatables';
import { LoaderInterceptor } from './app-config/loader.interceptor';
import {PostmethodService} from './app-config/postmethod.service'
import { ToastrModule } from 'ngx-toastr';
import { BnNgIdleService } from 'bn-ng-idle';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { QRCodeModule } from 'angularx-qrcode';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    PdfViewerModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DataTablesModule,
    ModalModule.forRoot(),
    SharedModule,
    RouterModule,
    QRCodeModule,
    BsDatepickerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-full-width',
      preventDuplicates: true,
      closeButton:true,
      // tapToDismiss:false,
      // disableTimeOut:true,
    }),
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(), // optional
    NgxExtendedPdfViewerModule,
    // PdfJsViewerModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    BnNgIdleService,
    PostmethodService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
