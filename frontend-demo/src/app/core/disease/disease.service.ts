import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  constructor(private ws: PostmethodService) { }
  private data = new BehaviorSubject<string>('0');
  currentDiseaseData: any = this.data.asObservable();
  changediseaseData(newData: string) {
    this.data.next(newData);
  }
  getDiseases(request: RequestModel, iv: string) {
    return this.ws.wsPostStaticToken(request, environment.catalogueSearchUrl + "getDiseasesDetails", iv);
  }

  getPopularDisease() {
    return this.ws.wsGetStaticToken(environment.catalogueSearchUrl + "getPopularDiseaseSearch");
  }
}
