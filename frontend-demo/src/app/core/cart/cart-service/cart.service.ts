import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private ws: PostmethodService) { }

  addedCartItem: any = []
  private data = new BehaviorSubject<string>('0');
  currentData: any = this.data.asObservable();
  changeData(newData: string) {
    this.data.next(newData);
  }

  private data1 = new BehaviorSubject<string>('0');
  currentTotalPrice: any = this.data1.asObservable();
  changePrice(newData: string) {
    this.data1.next(newData);
  }

  private data2 = new BehaviorSubject<string>('0');
  currentCartItem: any = this.data2.asObservable();
  getCurrentCartItems(newData: string) {
    this.data2.next(newData);
  }

  private data3 = new BehaviorSubject<string>('0');
  navigation: any = this.data3.asObservable();
  navigateTolanding(newData: string) {
    this.data3.next(newData);
  }


  getTestCartDetailsByUserId(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "getTestCartDetailsByUserId", iv);
  }
  getRelatedPackage(request: RequestModel, iv: string) {
    return this.ws.wsPostNoToken(request, environment.catalogueSearchUrl + "getRelatedPackage", iv);
  }
  insertUpdateTestCartDetails(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "insertUpdateTestCartDetails", iv);
  }

  async smsCatalogCartPdf(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "smsCatalogCartPdf", iv).toPromise();
  }

  async emailCatalogCart(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "emailCatalogCart", iv).toPromise();
  }

  async mailCatalogCartPdf(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "mailCatalogCartPdf", iv).toPromise();
  }

  async cartPdfGenerateOtp(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "cartPdfGenerateOtp", iv).toPromise();
  }

  async cartPdfWithOtpVerfication(request: RequestModel, iv: string) {
    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "cartPdfWithOtpVerfication", iv).toPromise();
  }

  async getCartRelatedPackageTestDetails(request: RequestModel, iv: string) {
    console.log("request payoad and iv  ", request, iv);

    return this.ws.wsPost(request, environment.CatalogueServiceUrl + "getCartRelatedPackageTestDetails", iv).toPromise();

  }


}
