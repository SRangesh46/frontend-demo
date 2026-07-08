import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PostmethodService } from 'src/app/app-config/postmethod.service';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  isLoading: Subject<boolean>;


  constructor( private ws:PostmethodService) {}

}
