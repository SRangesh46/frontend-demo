import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsentFormsService {

  constructor(private ws: PostmethodService) { }
  async getRequisitionConsentPdfDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getRequisitionConsentPdfDetails").toPromise();
  }
}
