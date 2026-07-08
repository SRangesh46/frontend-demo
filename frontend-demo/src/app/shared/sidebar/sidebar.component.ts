import { Component, OnInit } from '@angular/core';

import { SessionKeys } from 'src/app/app-config/SessionKeys';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { NavbarService } from '../navbar/navbar.service';
import { SpecialityService } from 'src/app/core/speciality-testing/speciality.service';
import { RequestModel } from 'src/app/models/RequestModel';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { TableRequestModel } from 'src/app/models/TableRequestModel';
import { EncryptDecryptResponse } from 'src/app/models/response/EncryAndDecryResponse';
import { EncryptdecryptService } from 'src/app/auth/encryptdecrypt.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public requestModel: RequestModel = new RequestModel();
  public responseModel: ResponseModel = new ResponseModel();
  public encrydecryresponse: EncryptDecryptResponse = new EncryptDecryptResponse();
  public tableRequestModel: TableRequestModel = new TableRequestModel();
  [x: string]: any;
  text = '';
  session: any;
  public menuList: any = [];
  public landing: any = [];
  public spliedClass: any = []
  loginForm: any;
  searchInput = new FormControl();
  public assignparamedic: any
  public searchedTest: any = new FormControl('');
  constructor(private auth: AuthService, private router: Router, private navbarService: NavbarService, private service: SpecialityService,
    private encryptDecrypt: EncryptdecryptService,) { }
  letters: any = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];
  alphabets(e: any) {
    this.search_content = e;
    this.search_active = false;
    this.navbarService.changeAlphabetSearchWord(e)
    this.router.navigate([""])
  }
  xmatch: any
  selectedItem: any; // Assuming selectedItem is declared in your component
  filteredSuggestions: any[] = []; // Array to hold filtered suggestions
  showNoDataMessage: boolean = false; // Flag to toggle "No data found" message

routerlink:any='/new-test';
  routerLink(link:any){
    this.routerlink=link
  }

  route_link() {
    $('.ssddropdown-content').css({ display: 'none' });
    if (this.xmatch) {
      const openMenu: any = document.querySelector('.open-menu');
      const menuWrapper: any = document.querySelector('.life-sidebar');
      const menuaside: any = document.querySelector('.sidebar-sec');
      const mainContent: any = document.querySelector('.main-panel');
      const miniContent: any = document.querySelector('body');
      let arr: any = openMenu?.classList;
      for (const i of arr) {
        console.log(i);
        if (i == "change") {
          openMenu?.classList.remove('close-menu');
          openMenu?.classList.remove('change');
          menuWrapper?.classList.add('mini-sidebar');
          mainContent?.classList.add('full-content');
          menuaside?.classList.add('aside-sidebar');
          miniContent?.classList.add('mini-panel');
        }
      }
    }
  }
  ssddropdown(e:any){
    if(document.body.clientWidth>991){
      $(`.center-content .p-dropdown-panel`).css({display:'none'})
      $(`.${e} .ssddropdown-content`).css({display:'block'})
    }
  }
  ssddropdown_leave(e:any){
    if(document.body.clientWidth>991){
      $(`.center-content .p-dropdown-panel`).css({display:'block'})
      $(`.${e} .ssddropdown-content`).css({display:'none'})
      this.selectedItem = null; // Clear selected item
      this.showNoDataMessage = false;
      this.getSpeciality()
    }
  }

  


  ngOnInit(): void {
    let user_data = JSON.parse(sessionStorage.getItem(SessionKeys.userDetail) as string);
    this.userList = user_data


    let data = JSON.parse(sessionStorage.getItem(SessionKeys.Menu_Details) as string)
    this.menuList = data
    this.getSpeciality();
    this.getDoctorSpeciality();
    //console.log("vivekkkkkkkkkkkkkkkkkkkkkkkkkk",this.parentList)
    const body: any = document.querySelector('body');
    const openMenu = document.querySelector(".open-menu");
    const closeMenu = document.querySelector(".close-menu");
    const menuWrapper = document.querySelector(".sidebar-sec");
    const hasCollapsible = document.querySelectorAll(".main-menu");
    // Sidenav Toggle
    // openMenu.addEventListener("click", function () {
    // 	menuWrapper.classList.add("mini-sidebar");
    // });

    // closeMenu.addEventListener("click", function () {
    // 	menuWrapper.classList.remove("mini-sidebar");
    // });
    // Collapsible Menu


    const resizeFunction = (x: any) => {
      this.xmatch = x.matches ? true : false;
    }

    var x = window.matchMedia('(max-width: 991px)');
    resizeFunction(x); // Call listener function at run time
    x.addListener(resizeFunction); // Attach listener function on state changes

    hasCollapsible.forEach((collapsible) => {
      collapsible.addEventListener("click", (e: any) => {
        if (document.body.clientWidth < 991) {
          collapsible.classList.toggle("active");
          // Close Other Collapsible
          hasCollapsible.forEach(function (otherCollapsible) {
            if (otherCollapsible !== collapsible) {
              otherCollapsible.classList.remove("active");
            }
          });
        }
      });
    });
    this.parentGlobal = this.parentList

    this.updateTime();
setInterval(() => {
  this.updateTime();
}, 1000);
  }


  currentTime: string = '';

updateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleString('en-GB', { month: 'short' });
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  this.currentTime = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

// currentTime: string = '';

// updateTime() {
//   const now = new Date();
//   this.currentTime = now.toLocaleString('en-GB', {
//     hour: '2-digit', minute: '2-digit', second: '2-digit',
//     hour12: false
//   });
// }

  
  logout() {
    this.auth.removeToken();
    this.router.navigateByUrl('');
  }

  


  // getItem(){ sessionStorage.setItem('session',JSON.stringify(SessionKeys.user)); }


  loadData() {
    let user: any = sessionStorage.getItem(SessionKeys.userDetail);
    // console.log(this.session=JSON.parse(user));
  }




  setActive(TARGETNAME: any): void {
    console.log(TARGETNAME,'TARGETNAME');
    // console.log(document.getElementById(TARGETNAME))
    this.spliedClass = document.getElementById(TARGETNAME)?.className.split(" ")
    if (this.spliedClass[2] == 'active' || this.spliedClass[3] == 'active') {
      document.getElementById(TARGETNAME)!.classList.remove("active");
    }
    else {
      document.getElementById(TARGETNAME)!.classList.add('active');
    }
  }

  searchTest() {
    this.navbarService.changeNavbarSearchWord(this.searchedTest.value)
    this.searchedTest.setValue('')
    this.router.navigate([""])
  }


  specialityTestingList: any = [];
  async getSpeciality() {
    try {
      const getSpeciality = await this.service.getSpecialityDetails();
      console.log(getSpeciality);
      this.responseModel = new ResponseModel()
      let clientSecret = getSpeciality.headers.get('clientsecret')
      this.responseModel = getSpeciality.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse, 'this.encrydecryresponse.data');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.specialityTestingList = this.encrydecryresponse.data.responseObj
        this.filteredSuggestions = this.encrydecryresponse.data.responseObj
        console.log("getSpeciality: ", this.specialityTestingList);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  doctorspecialityList: any = [];
  async getDoctorSpeciality() {
    try {
      const getSpeciality = await this.service.getDoctorSpecialityDetails();
      console.log(getSpeciality);
      this.responseModel = new ResponseModel()
      let clientSecret = getSpeciality.headers.get('clientsecret')
      this.responseModel = getSpeciality.body
      this.encrydecryresponse = this.encryptDecrypt.decryption(this.responseModel.responseData, clientSecret);
      console.log(this.encrydecryresponse, 'DoctorSpecialityRes');
      if (this.encrydecryresponse.data.statusCode == 200) {
        this.doctorspecialityList = this.encrydecryresponse.data.responseObj
        console.log("getDoctorSpeciality: ", this.doctorspecialityList);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  navigateToSpecialityTesting(data: any) {
    console.log(data, 'specialityName');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(["/speciality-testing"], { state: { name: data.SpecialityName, } });
    });
  }

  navigateToDoctorSpecialityTesting(data: any) {
    console.log(data, 'doctorSpecialityName');
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(["/doctor-speciality"], { state: { name: data.doctorSpecialityName,  } });
    });
  }

  filterSuggestions(event: any) {
    // console.log(event.target.value.toLowerCase())
    const searchTerm = event.target.value.toLowerCase();

    this.filteredSuggestions = this.specialityTestingList.filter((item: any) =>
      item.SpecialityName.toLowerCase().includes(searchTerm)
    );
    this.showNoDataMessage = this.filteredSuggestions.length === 0; // Show message if no suggestions found
    // console.log(this.filteredSuggestions)
  }


  
}



function details(details: any) {
  throw new Error('Function not implemented.');
}



