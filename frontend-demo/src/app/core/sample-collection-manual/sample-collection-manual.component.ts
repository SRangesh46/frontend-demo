import { Component, OnInit, ViewChild } from '@angular/core';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { SampleCollectionService } from './sample-collection.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sample-collection-manual',
  templateUrl: './sample-collection-manual.component.html',
  styleUrls: ['./sample-collection-manual.component.css']
})
export class SampleCollectionManualComponent implements OnInit {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  pdfList:any=[];
  isLoading = false;
  src:any;
  modalRef:any;


  @ViewChild('pdfViewer', { static: true }) pdfViewer: any;

  constructor(private modalService: BsModalService , private encryptDecrypt: EncryptdecryptService,private service:SampleCollectionService){}
  open_pdf(template: any,pdfLink:any) {
    console.log(pdfLink,'pdf');
    this.isLoading = true

    this.src = pdfLink.Pdf    ;
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
  async getSampleCollectionPdfDetails() {
    this.isLoading = true;

    try{
      const pdf =  await this.service.getSampleCollectionPdfDetails();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = pdf.headers.get('clientsecret')
      this.responseModel = pdf.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
            this.pdfList = this.encrydecryresponse.data.responseObj;
            console.log("pdfList: ", this.pdfList);
            this.isLoading = false;

          }
    }catch(error:any){
     console.log(error);
     this.isLoading = false;
    }
   
  }

  downloadPdf(data: any) {
    //console.log(data, 'adata');
    let fileUrl: any
    let newFilename: any
    // Define the file URL and new filename
 
      fileUrl = data.Pdf;
      newFilename = data.title + '.pdf';
    
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
ngOnInit(): void {
  this.getSampleCollectionPdfDetails()
}

}
