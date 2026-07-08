import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LandingHomeService {

  constructor(private ws: PostmethodService) { }

  getDiseaseMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getDiseasesmaster");
  }

  getSpecilityTestMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSpecialityDetails");
  }

  getPopularTest(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getPopularTest", iv);
  }

  getPopularTestSearch() {
    return this.ws.wsGetStaticToken(environment.catalogueSearchUrl + "getPopularTestSearch");
  }

  // getB2cLocationMaster() {
  //   return this.ws.wsGetStaticToken(environment.masterServiceUrl + "getB2cLocationMaster");
  // }

   getB2cLocationMaster(request: RequestModel, iv: string) {
  return this.ws.wsPostStaticToken(request,environment.masterServiceUrl + "getB2cLocationMaster",iv);
}


  elasticgetTests(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "elasticgetTests", iv);
  }

  getBanner() {
    return this.ws.wsGetStaticToken(environment.masterServiceUrl + "getCatalogBannerMaster");
  }

  getCatalogNotificationdetails(request: RequestModel, iv: string) {
    // return this.ws.wsPost(request, environment.CatalogueServiceUrl + "getCatalogNotificationdetails", iv);
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getCatalogNotificationdetails", iv);
  }
  getCatalogNotificationdetails1() {
    // return this.ws.wsGetStaticToken(environment.masterServiceUrl + "getCatalogNotificationdetails");
  }

  getCataloguePdfView(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getCataloguePdfView", iv);
  }

  getGloalSearchData(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getGlobalTopTestSearch", iv);
  }

   getViewScheduleAndTAT(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "viewScheduleAndTAT", iv);
  }

}
