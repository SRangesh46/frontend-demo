import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotifyService } from 'src/app/shared/notify/notify.service';
@Component({
  selector: 'app-label-master',
  templateUrl: './label-master.component.html',
  styleUrls: ['./label-master.component.css'],
})
export class LabelMasterComponent implements OnInit {
  public Receive: DataTables.Settings = {};
  public Received: DataTables.Settings = {};
  public crm_id_list: DataTables.Settings = {};
  public newdata: any = [];
  labledetails: any[] = [];
  public isEditing : boolean = false;
  public isCheck : boolean = false;
  constructor(private notify : NotifyService) {}

  lableMasterForm = new FormGroup({
    Lable_id: new FormControl('', [Validators.required]),
    Lable_Name: new FormControl('', [Validators.required]),
    Lable_Discription: new FormControl('', [Validators.required]),
    Language_id: new FormControl('', [Validators.required]),
    Lable_pageID: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.Receive = {
      initComplete: function () {

        $('#receivesample-receive').wrap(
          "<div class='tableFixHead' style=' margin-top: 10px !important;overflow:auto;min-height:auto;max-height:400px; width:100%;position:relative;'></div>"
        );
      },

      pagingType: 'full_numbers',
      autoWidth: false,
      pageLength: 10,
      lengthMenu: [5, 10, 25],
      processing: true,
      language: {
        paginate: {
          last: '<i class="fa fa-angle-double-right"></i>',
          first: '<i class="fa fa-angle-double-left"></i>',
          previous: '<i class="fa fa-angle-left"></i>',
          next: '<i class="fa fa-angle-right"></i>',
        },
      },
    };

    this.Received = {
      initComplete: function () {
        $('#receivesample-received').wrap(
          "<div class='tableFixHead' style=' margin-top: 10px !important;overflow:auto;min-height:auto;max-height:400px; width:100%;position:relative;'></div>"
        );
      },

      pagingType: 'full_numbers',
      autoWidth: false,
      pageLength: 10,
      lengthMenu: [5, 10, 25],
      processing: true,
      language: {
        paginate: {
          last: '<i class="fa fa-angle-double-right"></i>',
          first: '<i class="fa fa-angle-double-left"></i>',
          previous: '<i class="fa fa-angle-left"></i>',
          next: '<i class="fa fa-angle-right"></i>',
        },
      },
    };

    this.crm_id_list = {
      initComplete: function () {

        $('#crm_id_list_fix').wrap(
          "<div class='tableFixHead' style=' margin-top: 10px !important;overflow:auto;min-height:auto;max-height:300px; width:100%;position:relative;'></div>"
        );
      },

      pagingType: 'full_numbers',
      autoWidth: false,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      processing: true,
      language: {
        paginate: {
          last: '<i class="fa fa-angle-double-right"></i>',
          first: '<i class="fa fa-angle-double-left"></i>',
          previous: '<i class="fa fa-angle-left"></i>',
          next: '<i class="fa fa-angle-right"></i>',
        },
      },
    };
  }

  public addNewLable() {
    if (this.lableMasterForm.invalid) {
      this.notify.errorMessage('All Fields are Mandatory','')
    } else {
      var data = {
        Lable_id: this.lableMasterForm.value.Lable_id,
        Lable_Name: this.lableMasterForm.value.Lable_Name,
        Lable_Discription: this.lableMasterForm.value.Lable_Discription,
        Language_id: this.lableMasterForm.value.Language_id,
        Lable_pageID: this.lableMasterForm.value.Lable_pageID,
      };
      this.newdata.push(data);
      this.labledetails = this.newdata;
      console.log(this.newdata);
      this.lableMasterForm.reset();
    }
  }
  removeItemByIndex(language: any) {
    this.newdata.forEach((value: any, index: any) => {
      if (value == language) {
        this.newdata.splice(index, 1);
      }
      console.log(this.newdata);
    });
  }
  editData(index: number, lineItem:any){
    console.log(index)
        if (index < this.newdata.length) {
          this.isEditing = !this.isEditing;
          this.isCheck = !this.isCheck
      }
      }

      saveData(event: any, rowIndex: number, propertyKey: string){
        this.isEditing = false;
        this.isCheck = false;
        console.log(this.newdata)
      }
}
