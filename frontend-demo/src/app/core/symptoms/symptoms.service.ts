import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SymptomsService {

  constructor(private ws: PostmethodService) { }

  getSymptoms(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getSymptomsDetails", iv);
  }

  getPopularSymptoms() {
    return this.ws.wsGetStaticToken(environment.catalogueSearchUrl + "getPopularSymptomsSearch");
  }
}
