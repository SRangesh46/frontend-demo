import { Component, OnInit, ChangeDetectorRef, TemplateRef, ElementRef, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets, PositionType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color } from 'ng2-charts';
// import { drawRoundedEdges } from 'src/assets/script/round';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import * as Chart from 'chart.js';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { DashboardService } from './dashboard.service';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { BehaviorSubject, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
 

  constructor(private modalService: BsModalService,
    private dashboardServices: DashboardService,
    private encryptDecrypt: EncryptdecryptService,
    public fb: FormBuilder,
    private serviceMethod: PostmethodService,
    public tableChange: ChangeDetectorRef,
    private router: Router,
    private toastr: ToastrService

  ) {
  
  }
  

  // popup start
  web_add_config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-xxl',
  };


ngOnInit(): void {
    
}
}
