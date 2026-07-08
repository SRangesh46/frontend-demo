import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(private ws: PostmethodService) { }

  async getFaqDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getFaqDetails").toPromise();
  }
}
