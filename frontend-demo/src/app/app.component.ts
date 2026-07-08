import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public xmatch: any;
  title = 'Metropolis';
  constructor(
    private router: Router,
    private bnIdle: BnNgIdleService,
    service: CookieService
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        // console.log('Route change detected');
      }
      if (event instanceof NavigationEnd) {
        $('.ssddropdown-content').css({ display: 'none' });
        // $(".main-menu-link.active").removeClass('active')
        window.scrollTo(0, 0);
        if (this.xmatch) {
          const openMenu: any = document.querySelector('.open-menu');
          const menuWrapper: any = document.querySelector('.life-sidebar');
          const menuaside: any = document.querySelector('.sidebar-sec');
          const mainContent: any = document.querySelector('.main-panel');
          const miniContent: any = document.querySelector('body');
          let arr: any = openMenu?.classList;
          for (const i of arr) {
            if (i == 'change') {
              openMenu?.classList.remove('close-menu');
              openMenu?.classList.remove('change');
              menuWrapper?.classList.add('mini-sidebar');
              mainContent?.classList.add('full-content');
              menuaside?.classList.add('aside-sidebar');
              miniContent?.classList.add('mini-panel');
              $('.life-sidebar').css({ height: '100%' });
            }
          }
        }
      }
      if (event instanceof NavigationError) {
        // console.log(event.error);
      }
    });
  }

  ngOnInit(): void {
    const resizeFunction = (x: any) => {
      this.xmatch = x.matches ? true : false;
    };
    var x = window.matchMedia('(max-width: 991px)');
    resizeFunction(x); // Call listener function at run time
    x.addListener(resizeFunction); // Attach listener function on state changes
  }
}
