import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { LandingHomeService } from '../landing-home/landing-home.service';
import { TestAlgorithmService } from './test-algorithm.service';
import { Pdf, PdfDetail } from 'src/app/models/PdfModel';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-test-algorithms',
  templateUrl: './test-algorithms.component.html',
  styleUrls: ['./test-algorithms.component.css']
})
export class TestAlgorithmsComponent implements OnInit {
  myControl = new FormControl<string | Pdf>('');
  filteredPdfOptions: Observable<Pdf[]>;
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  isLoading: boolean = false;
  rotation: number = 0;
  @ViewChild('pdfViewer', { static: true }) pdfViewer: any;

  letter: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  pdfList: any = []
  constructor(private modalService: BsModalService, private service: TestAlgorithmService, private encryptDecrypt: EncryptdecryptService,
    private landingHomeService: LandingHomeService,private sharedservice :SharedService) {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
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
    if (this.page > 1) {
      this.page--;
    }
  }

  closePdf(){
    this.zoom =1
  }
  modalRef: any;
  src: any;
  testForm: any = FormGroup;
  public testStatusMaster = [{ "value": "Y", "name": "Active" }, { "value": "N", "name": "Inactive" }]
  letters: any;
  alphabets(e: any, event: any) {
    $('.alphabets').map((e, l: any) => { $(l).removeClass('alphabets_active') })
    $(event.target).addClass("alphabets_active");
    (document.querySelector(`#apl_id_${e}`) as any).scrollIntoView()

  }

  createForm() {
    this.testForm = new FormGroup({
      department: new FormControl(''),
      category: new FormControl(''),
      method: new FormControl(''),
      reportOn: new FormControl(''),
      status: new FormControl(''),
      disease: new FormControl(''),
      speciality: new FormControl(''),
      segment: new FormControl('')

    })
  }

  private filterPdfName(pdfName: string) {
    const filterValue = pdfName.toLowerCase();
    return this.pdfList
      .map((item: any) => ({
        ...item,
        pdfDetails: item.pdfDetails.filter((pdf: any) => pdf.title.toLocaleLowerCase().includes(filterValue)),
      }))
      .filter((item: any) => item.pdfDetails.length > 0);

  }

  filterPdf() {
    //this.pdfList = this.pdfList.slice().sort((a: { letter: string; }, b: { letter: any; }) => a.letter.localeCompare(b.letter));
    //console.log(this.pdfList,'pdfList');
    console.log(this.pdfList, 'pdf');
    this.filteredPdfOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const title = typeof value === 'string' ? value.trim() : value?.pdfDetails.some((val: PdfDetail) => val.title);
        return title ? this.filterPdfName(title as string) : this.pdfList.slice();
      }),
    );

  }




  open_pdf(template: any, pdfLink: any) {
    this.isLoading = true;
    this.src = pdfLink;
    //this.src = "https://dos-2-prod.s3.ap-south-1.amazonaws.com/Reports/C0044-CBCHaemogram.pdf"
    console.log(this.src, 'src');

    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-xxl',
    });
    setTimeout(() => {
      this.isLoading = false
    }, 100);
  }


  closeModal() {
    this.modalService.hide();
  }



  public departmentMasterList: any = []
  async getDepartmentMaster() {
    try {
      const department = await this.service.getDepartmentMaster();
      //console.log(department); 
      this.responseModel = new ResponseModel()
      let clientSecret = department.headers.get('clientsecret')
      this.responseModel = department.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.departmentMasterList = this.encrydecryresponse.data.responseObj
        //console.log("departmentMasterList: ", this.departmentMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  public categoryMasterList: any = []
  async getCategoryMaster() {
    try {
      const category = await this.service.getCategoryMaster();
      //console.log(category); 
      this.responseModel = new ResponseModel()
      let clientSecret = category.headers.get('clientsecret')
      this.responseModel = category.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.categoryMasterList = this.encrydecryresponse.data.responseObj
        //console.log("categoryMasterList: ", this.categoryMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  public methodMasterList: any = []
  async getMethodMaster() {

    try {
      const method = await this.service.getMethodMaster();
      //console.log(method); 
      this.responseModel = new ResponseModel()
      let clientSecret = method.headers.get('clientsecret')
      this.responseModel = method.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.methodMasterList = this.encrydecryresponse.data.responseObj
        //console.log("methodMasterList: ", this.methodMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }

  }

  public diseaseMasterList: any = []
  async getDiseaseMaster() {

    try {
      const disease = await this.service.getDiseaseMaster();
      //console.log(disease); 
      this.responseModel = new ResponseModel()
      let clientSecret = disease.headers.get('clientsecret')
      this.responseModel = disease.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');

      this.diseaseMasterList = this.encrydecryresponse.data
      //console.log("diseaseMasterList: ", this.diseaseMasterList);

    } catch (error: any) {
      console.log(error);
    }

  }

  public specialityMasterList: any = []
  async getSpecilityTestMaster() {
    try {
      const specility = await this.service.getSpecilityTestMaster();
      //console.log(specility); 
      this.responseModel = new ResponseModel()
      let clientSecret = specility.headers.get('clientsecret')
      this.responseModel = specility.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.specialityMasterList = this.encrydecryresponse.data.responseObj
        //console.log("specialityMasterList: ", this.specialityMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }


  }

  public reportedOnMasterList: any = []
  async getReportedOnMaster() {

    try {
      const report = await this.service.getReportedOnMaster();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = report.headers.get('clientsecret')
      this.responseModel = report.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      //console.log(this.encrydecryresponse.data,'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.reportedOnMasterList = this.encrydecryresponse.data.responseObj
        //console.log("reportedOnMasterList: ", this.reportedOnMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }

  }


  public sampleTypeDetailsMaster: any = []
  getSampleTypeDetails() {
    this.sharedservice.getSampleTypeDetails().subscribe((response: any) => {
      this.responseModel = new ResponseModel()
      let clientSecret = response.headers.get('clientsecret')
      this.responseModel = response.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.sampleTypeDetailsMaster = this.encrydecryresponse.data.responseObj
         console.log("sampleTypeDetailsMaster: ", this.reportedOnMasterList);
      }
    });
  }

  public segmentMasterList: any = []
  async getSegmentDetails() {

    try {
      const segment = await this.service.getSegmentDetails();
      //console.log(report); 
      this.responseModel = new ResponseModel()
      let clientSecret = segment.headers.get('clientsecret')
      this.responseModel = segment.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data, 'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.segmentMasterList = this.encrydecryresponse.data.responseObj
        console.log("segmentMasterList: ", this.segmentMasterList);
      }
    } catch (error: any) {
      console.log(error);
    }

  }
  lettersEnable: any = []
  async getTestAlgorithmsPdfDetails() {
    console.log(this.testForm.value, 'this.testForm.value');

    const request = {
      "department": this.testForm.value.department ? this.testForm.value.department : '',
      "categoryName": this.testForm.value.category ? this.testForm.value.category : '',
      "methodName": this.testForm.value.method ? this.testForm.value.method : '',
      "reportedOn": this.testForm.value.reportOn ? this.testForm.value.reportOn : '',
      "isAvtice": this.testForm.value.status ? this.testForm.value.status : '',
      "specilityName": this.testForm.value.speciality ? this.testForm.value.speciality : '',
      "diseasesName": this.testForm.value.disease ? this.testForm.value.disease : '',
      "segment": this.testForm.value.segment ? this.testForm.value.segment : '',
    }
    console.log(request);

    this.requestModel = new RequestModel()
    this.encrydecryresponse = new EncryptDecryptResponse()
    this.encrydecryresponse = this.encryptDecrypt.encryption(request)
    this.requestModel.payload = this.encrydecryresponse.data
    this.isLoading = true;
    try {
      const pdf: any = await this.service.getTestAlgorithmsPdfDetails(this.requestModel, this.encrydecryresponse.iv);
      console.log(pdf);
      this.responseModel = new ResponseModel()
      let clientSecret = pdf.headers.get('clientsecret')
      this.responseModel = pdf.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse.data, 'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.pdfList = this.encrydecryresponse.data.responses.test_algorithms;
        console.log("pdfList: ", this.pdfList);
        this.filterPdf();
        this.isLoading = false;
      }
    } catch (error: any) {
      console.log(error);
      this.isLoading = false;

    }

  }

  ngOnInit(): void {
    this.createForm();
    this.getDepartmentMaster();
    this.getCategoryMaster();
    this.getMethodMaster();
    this.getDiseaseMaster();
    this.getSpecilityTestMaster();
    this.getReportedOnMaster();
    this.getSampleTypeDetails()
    this.getSegmentDetails();
    this.getTestAlgorithmsPdfDetails();
    this.isAlphabetDisabled(this.letter)

  }

  isAlphabetDisabled(alphabet: string): boolean {
    const matchingItems = this.pdfList.filter((item: any) => item.letter === alphabet);
    return matchingItems.length === 0;
  }
}
