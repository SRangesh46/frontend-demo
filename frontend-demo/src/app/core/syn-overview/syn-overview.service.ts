import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SynOverviewService {

  constructor(private ws: PostmethodService) { }

  getSynOverview(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getSymptomsDetailsbyId", iv);
  }

  getDiseaseOverview(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getDiseaseDetailsbyId", iv);
  }
}
