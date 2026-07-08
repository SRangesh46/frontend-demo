import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  constructor(private ws: PostmethodService) { }

  async getResourcesPdfDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getResourcesPdfDetails").toPromise();
  }
}
