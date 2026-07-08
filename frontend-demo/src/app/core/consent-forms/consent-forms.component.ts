import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { Pdf, PdfDetail } from 'src/app/models/PdfModel';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { ConsentFormsService } from './consent-forms.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-consent-forms',
  templateUrl: './consent-forms.component.html',
  styleUrls: ['./consent-forms.component.css']
})
export class ConsentFormsComponent implements OnInit ,AfterViewInit{
  myControl = new FormControl<string | Pdf>('');
  filteredPdfOptions: Observable<Pdf[]>;
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  isLoading = false;
  src:any;
  modalRef:any;
  @ViewChild('pdfViewer', { static: true }) pdfViewer: any;
ngAfterViewInit(): void {
  if (this.pdfViewer) {
    this.pdfViewer.renderPage();
  }
}
  letter: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  pdfList:any=[ ]
  alphabets(e: any, event: any) {
    //console.log(e);
    $('.alphabets').map((e, l: any) => { $(l).removeClass('alphabets_active') })
    $(event.target).addClass("alphabets_active");
    (document.querySelector(`#apl_id_${e}`) as any).scrollIntoView()
  }
 

  constructor(private modalService: BsModalService,private encryptDecrypt: EncryptdecryptService,private service : ConsentFormsService) {
   
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

  closePdf(){
    this.zoom =1
  }
  private filterPdfName(pdfName: string){
    const filterValue = pdfName.toLowerCase(); 
      return this.pdfList
      .map((item:any) => ({
        ...item,
        pdfDetails: item.pdfDetails.filter((pdf:any) => pdf.title.toLocaleLowerCase().includes(filterValue)),
      }))
      .filter((item:any) => item.pdfDetails.length > 0);
    
  }

  filterPdf(){
    //this.pdfList = this.pdfList.slice().sort((a: { letter: string; }, b: { letter: any; }) => a.letter.localeCompare(b.letter));
    //console.log(this.pdfList,'pdfList');
    this.filteredPdfOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const title = typeof value === 'string' ? value.trim() : value?.pdfDetails.some((val:PdfDetail)=>val.title);
        return title ? this.filterPdfName(title as string) : this.pdfList.slice();
      }),
    );
    
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

  
  async getRequisitionConsentPdfDetails() {
    this.isLoading = true;
    try{
      const pdf =  await this.service.getRequisitionConsentPdfDetails();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = pdf.headers.get('clientsecret')
      this.responseModel = pdf.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
            this.pdfList = this.encrydecryresponse.data.responses.requisition_consent_forms;
            console.log("pdfList: ", this.pdfList);
            this.filterPdf();
            this.isLoading = false;

          }
    }catch(error:any){
     console.log(error);
     this.  isLoading = false;
    }
   
  }

  isAlphabetDisabled(alphabet: string): boolean {
    const matchingItems = this.pdfList.filter((item:any) => item.letter === alphabet );
    return matchingItems.length === 0;
  }

  ngOnInit() {
   this.getRequisitionConsentPdfDetails()
   this.isAlphabetDisabled(this.letter)

  }

}
