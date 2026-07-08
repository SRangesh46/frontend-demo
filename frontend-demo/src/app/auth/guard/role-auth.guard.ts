import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SessionKeys } from 'src/app/app-config/SessionKeys';
import { Location } from '@angular/common';
import { window } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class RoleAuthGuard implements CanActivate {
  data = JSON.parse(sessionStorage.getItem(SessionKeys.Menu_Details) as string)
  currentUrl:any | null=this.location.path().substring(1)

  constructor(private _router: Router,private toastr: ToastrService, private location: Location) { }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):any {
    let url = this.data.some((data:any) => data.URL == this.currentUrl);
    this.data.forEach((data:any):any => {
      if(!this.currentUrl){
        return true;
      }
      else if(url == true ){
        console.log('true');
        return true;
      }else if(url == false){
        console.log('false');
        sessionStorage.clear();
         this._router.navigateByUrl('')
         this.currentUrl=''
         return false;
      }
      
    });
  }
  
}
