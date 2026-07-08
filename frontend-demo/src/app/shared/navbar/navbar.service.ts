import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private ws: PostmethodService) { }
  private navbarSearchWord: any = new BehaviorSubject<any>('')
  private clearGlobalSearch:any= new BehaviorSubject<boolean>(false)
  private pdf: any = new BehaviorSubject<any>('')
  private alphabetSearchWord: any = new BehaviorSubject<any>('')
  currentNavbarSearchedData: any = this.navbarSearchWord.asObservable();
  clearGlobalSearchObs:any=this.clearGlobalSearch.asObservable();
  currentAlphabetSearchedData: any = this.alphabetSearchWord.asObservable();

  private location: any = new BehaviorSubject<any>('')

  currentLocationData: any = this.location.asObservable();
  private data = new BehaviorSubject<string>('0');
  private activeTab = new BehaviorSubject<string>('0');

  currentData: any = this.data.asObservable();
  changeData(newData: string) {
    this.data.next(newData);
  }

  currentTab: any = this.activeTab.asObservable();
  changeTab(newData: string) {
    this.activeTab.next(newData);
  }

  private elasticSearchRequest: any = new BehaviorSubject<any>({
    "newOne": "",
    "locationName": "",
    "updated": "",
    "testName": "",
    "globalSearch": "",
    "keyword": "",
    "department": "",
    "categoryName": "",
    "methodName": "",
    "reportedOn": "",
    "diseasesName": "",
    "specilityName": "",
    "testType": "",
    "isAvtice": "",
    "flag": ""
  });

  currentElasticRequestData: any = this.elasticSearchRequest.asObservable();

  changeElasticReq(newData: any) {
    this.elasticSearchRequest.next(newData);
  }

  changeLocationData(newData: any) {
    this.location.next(newData);
  }

  changeLocation(newData: any) {
    this.pdf.next(newData);
  }

  changeNavbarSearchWord(newData: any) {
    this.navbarSearchWord.next(newData);
  }
  clearGlobalSearchfn(newData:boolean){
 this.clearGlobalSearch.next(newData)
  
  }

  changeAlphabetSearchWord(newData: any) {
    this.alphabetSearchWord.next(newData);
  }

  // getB2cLocationMaster() {
  //   return this.ws.wsGetStaticToken(environment.masterServiceUrl + "getB2cLocationMaster");
  // }

  getB2cLocationMaster(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.masterServiceUrl + "getB2cLocationMaster", iv);
  }
  
  getCurrentLocation(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.CatalogueServiceUrl + "getCurrentLocation", iv);
  }
}
