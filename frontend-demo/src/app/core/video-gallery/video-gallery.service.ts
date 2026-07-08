import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';

@Injectable({
  providedIn: 'root'
})
export class VideoGalleryService {

  constructor(private ws: PostmethodService) { }

    async getVideoCategory(request: RequestModel, iv: string) {
      return this.ws.wsPostStaticToken(request, environment.CatalogueServiceUrl + "getVideoCategory", iv).toPromise();
    }
    async getVideoDisease(request: RequestModel, iv: string) {
      return this.ws.wsPostStaticToken(request, environment.CatalogueServiceUrl + "getVideoDisease", iv).toPromise();
    }
    async getVideoGallery(request: RequestModel, iv: string) {
      return this.ws.wsPostStaticToken(request, environment.CatalogueServiceUrl + "getVideoGallery", iv).toPromise();
    }

}
