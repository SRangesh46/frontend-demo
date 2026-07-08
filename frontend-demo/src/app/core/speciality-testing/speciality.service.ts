import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {

  constructor(private ws: PostmethodService) { }
  async getSpecialityDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSpecialityDetails").toPromise()
  }
  async getDoctorSpecialityDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getDoctorSpecialityDetails").toPromise()
  }
}
