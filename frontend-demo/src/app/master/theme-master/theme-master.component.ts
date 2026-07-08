import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotifyService } from 'src/app/shared/notify/notify.service';
@Component({
  selector: 'app-theme-master',
  templateUrl: './theme-master.component.html',
  styleUrls: ['./theme-master.component.css']
})
export class ThemeMasterComponent implements OnInit {
  public Receive: DataTables.Settings = {};
  public Received: DataTables.Settings = {};
  public crm_id_list: DataTables.Settings = {};
  public newdata:any = [];
  colordetails: any[] = [];
  public isEditing : boolean = false;
  public isCheck : boolean = false;
  constructor(private notify : NotifyService) {}

  themeMasterForm = new FormGroup({
    Colorid: new FormControl('',[Validators.required]),
    Colorname: new FormControl('',[Validators.required]),
    ColorCode: new FormControl('',[Validators.required]),
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

  public addNewTheme (){
    if(this.themeMasterForm.invalid){
      this.notify.errorMessage('All Fields are Mandatory','')
    }
    else{
      var data ={
        Colorid: this.themeMasterForm.value.Colorid,
        Colorname: this.themeMasterForm.value.Colorname,
        ColorCode: this.themeMasterForm.value.ColorCode,
      }
       this.newdata.push(data)
       this.colordetails = this.newdata
       console.log(this.newdata)
       this.themeMasterForm.reset();
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
