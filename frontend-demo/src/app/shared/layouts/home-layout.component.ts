import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styles: [],
})
export class HomeLayoutComponent {
  user: string;
  constructor(private router: Router) {}
  ngOnInit(): void {
    // this.checkRemember();
    const openMenu :any = document.querySelector('.open-menu');
    const closeMenu :any = document.querySelector('.close-menu');
    const menuWrapper :any = document.querySelector('.life-sidebar');
    const menuaside :any = document.querySelector('.sidebar-sec');
    const mainContent :any = document.querySelector('.main-panel');
    const miniContent :any = document.querySelector('body');
    const hasCollapsible = document.querySelectorAll('.has-collapsible');
    const sidebarmenu :any = document.querySelector('.sidebar-menu');

    function resizeFunction(x: any) {
      if (x.matches) {
        // If media query matches
        menuWrapper?.classList.add('mini-sidebar');
        mainContent?.classList.add('full-content');
        menuaside?.classList.add('aside-sidebar');
        miniContent?.classList.add('mini-panel');
      } else {
        menuWrapper?.classList.remove('mini-sidebar');
        mainContent?.classList.remove('full-content');
        menuaside?.classList.remove('aside-sidebar');
        miniContent?.classList.remove('mini-panel');
      }
    }


    var x = window.matchMedia('(max-width: 991px)');
    resizeFunction(x); // Call listener function at run time
    x.addListener(resizeFunction); // Attach listener function on state changes

    // Sidenav Toggle
    openMenu?.addEventListener('click', function () {
      if ($(".open-menu").hasClass('close-menu')) {
        openMenu?.classList.remove('close-menu');
        openMenu?.classList.remove('change');
        menuWrapper?.classList.add('mini-sidebar');
        mainContent?.classList.add('full-content');
        menuaside?.classList.add('aside-sidebar');
        miniContent?.classList.add('mini-panel');
      } else {
        menuWrapper?.classList.remove('mini-sidebar');
        mainContent?.classList.remove('full-content');
        menuaside?.classList.remove('aside-sidebar');
        miniContent?.classList.remove('mini-panel');
        openMenu?.classList.add('close-menu');
        openMenu?.classList.add('change');
        openMenu?.classList.add('change');
        
      }


    });

    closeMenu?.addEventListener('click', function () {
      alert("hi");
    });
    menuWrapper?.addEventListener('click', function (e:any) {
      if (x.matches) {
        // If media query matches
      if (!sidebarmenu.contains(e.srcElement)) {
        openMenu?.classList.remove('close-menu');
        openMenu?.classList.remove('change');
        menuWrapper?.classList.add('mini-sidebar');
        mainContent?.classList.add('full-content');
        menuaside?.classList.add('aside-sidebar');
        miniContent?.classList.add('mini-panel');
      }
      }
    });
    // Collapsible Menu
    // hasCollapsible.forEach(function (collapsible) {
    // 	collapsible.addEventListener("click", function () {
    // 		collapsible.classList.toggle("active");

    // 		// Close Other Collapsible
    // 		hasCollapsible.forEach(function (otherCollapsible) {
    // 			if (otherCollapsible !== collapsible) {
    // 				otherCollapsible.classList.remove("active");
    // 			}
    // 		});
    // 	});
    // });
  }
  // public checkRemember() {
  //   const rememberMe = localStorage.getItem('rememberMe');
  //   if (rememberMe) {
  //     this.router.navigate(['/dashboard']);
  //   }
  //   else {
  //     this.router.navigate(['/login']);
  //   }
  // }
}
