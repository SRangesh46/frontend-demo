import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestAlgorithmService {

  constructor(private ws: PostmethodService) { }
  async getDepartmentMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getDepartmentDetails").toPromise()
  }

  async getCategoryMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getCategoryDetails").toPromise();
  }

  async getMethodMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getMethodDetails").toPromise();
  }

  async getReportedOnMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getReportedDetails").toPromise();
  }

  async getDiseaseMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getDiseasesmaster").toPromise();
  }

  async getSpecilityTestMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSpecialityDetails").toPromise();
  }

  async getTestAlgorithmsPdfDetails(request: any, iv: string) {
    return this.ws.wsPostNoToken(request,environment.catalogueSearchUrl + "getTestAlgorithmsPdfDetails",iv).toPromise();
  }

  async getSegmentDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSegmentDetails").toPromise();
  }
}
