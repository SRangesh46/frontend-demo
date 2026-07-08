import { Injectable } from '@angular/core';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListTestService {

  constructor(private ws: PostmethodService) { }

  getViewScheduleAndTAT(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "viewScheduleAndTAT", iv);
  }

}
