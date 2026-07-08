import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SessionKeys } from 'src/app/app-config/SessionKeys';
import { Location } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
   data = JSON.parse(sessionStorage.getItem(SessionKeys.Menu_Details) as string)
  constructor(private _router: Router,private toastr: ToastrService, private location: Location) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

      if (sessionStorage.getItem('autho_token')) {
          return true;
      }
      else{
        this.toastr.error("Session got Expired Please Login again.")
        this._router.navigate(['']);
        return false;
      }
  
  }
  
  
  



  

}
