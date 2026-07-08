import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SampleCollectionService {


  constructor(private ws: PostmethodService) { }

  async getSampleCollectionPdfDetails() {
    return this.ws.wsGet(environment.catalogueSearchUrl + "getSampleCollectionPdfDetails").toPromise();
  }}
