import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostmethodService } from '../app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private ws: PostmethodService) { }
  getDepartmentMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getDepartmentDetails");
  }

  getCategoryMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getCategoryDetails");
  }

  getMethodMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getMethodDetails");
  }

  getReportedOnMaster() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getReportedDetails");
  }
  getSampleTypeDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSampleTypeDetails");
  }


  allowNumbersDotOnly(event: any) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[0-9\.]+/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  

  restrict_special_char(e: any) {
    if (/^[a-zA-Z0-9\s]*$/.test(e.key)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  allowNumbersOnly(event: any) {
    let inp = String.fromCharCode(event.keyCode);
    if (/[\d]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

 

  allowAlphabetsOnly(event: any) {
    let inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z\s]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
}
}
