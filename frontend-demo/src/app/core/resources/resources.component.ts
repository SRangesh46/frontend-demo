import { Component, OnInit, ViewChild } from '@angular/core';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { ResourceService } from './resource.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  public isLoading = false;
  public pdfList:any=[];
  public modalRef:any;
  public src:any
  @ViewChild('pdfViewer', { static: true }) pdfViewer: any;

  constructor(private modalService: BsModalService,private encryptDecrypt: EncryptdecryptService,private service:ResourceService) { }
  rotation: number = 0; // Initial rotation
  public zoom = 1;
  totalPages: number;
  page = 1;


  zoomin() {
    if (this.zoom <= 1.4000000000000004) {
      this.zoom += 0.1;
    }
    console.log(this.zoom);

  }

  zoomout() {
    if (this.zoom > 0.40000000000000013) {
      this.zoom -= 0.1;
      console.log(this.zoom);

    }
  }


  rotateClockwise() {
    this.rotation += 90;
    if (this.pdfViewer) {
      this.pdfViewer.renderPage();
    }
  }

  rotateCounterClockwise() {
    this.rotation -= 90;
    if (this.pdfViewer) {
      this.pdfViewer.renderPage();
    }
  }
  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    console.log(this.totalPages);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }

  }

  prevPage() {
    if (this.page>1) {
      this.page--;
    }
  }
  closePdf(){
    this.zoom =1
  }
  open_pdf(template: any,pdfLink:any) {
    console.log(pdfLink,'pdf');
    this.isLoading = true

     this.src = pdfLink.Pdf    ;
   // this.src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg"
    console.log(this.src,'src');
    
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-xxl',
    });
    setTimeout(() => {
      this.isLoading = false
     }, 100);
  }
  async getResourcesPdfDetails() {
    this.isLoading=true;
    try{
      const pdf =  await this.service.getResourcesPdfDetails();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = pdf.headers.get('clientsecret')
      this.responseModel = pdf.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
            this.pdfList = this.encrydecryresponse.data.responses.resources;
            console.log("pdfList: ", this.pdfList);
            this.isLoading=false;
          }
    }catch(error:any){
     console.log(error);
     this.isLoading=false;

    }
   
  }

  downloadPdf(data: any) {
    //console.log(data, 'adata');
    let fileUrl: any
    let newFilename: any
    // Define the file URL and new filename
 
      fileUrl = data.Pdf;
      newFilename = data.subTitle + '.pdf';
    
    // Fetch the file as a blob
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        // Create an object URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = newFilename;
        // Trigger a click event on the anchor element
        a.click();
        // Cleanup: Revoke the object URL
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error fetching the file:', error);
      });
  }
  ngOnInit() {
    this.getResourcesPdfDetails();
  }

}
