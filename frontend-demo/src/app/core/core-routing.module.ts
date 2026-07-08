import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from '../shared/layouts/home-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewTestComponent } from './new-test/new-test.component';
import { LandingHomeComponent } from './landing-home/landing-home.component';
import { CartComponent } from './cart/cart.component';
import { OverviewComponent } from './overview/overview.component';
import { UpdateTestComponent } from './update-test/update-test.component';
import { UpdatePackageComponent } from './update-package/update-package.component';
import { PackageComponent } from './package/package.component';
import { ListTestComponent } from './list-test/list-test.component';
import { ResourcesComponent } from './resources/resources.component';
import { TestAlgorithmsComponent } from './test-algorithms/test-algorithms.component';
import { ConsentFormsComponent } from './consent-forms/consent-forms.component';
import { PopularTestComponent } from './popular-test/popular-test.component';
import { PopularPackageComponent } from './popular-package/popular-package.component';
import { FaqComponent } from './faq/faq.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
import { SampleCollectionManualComponent } from './sample-collection-manual/sample-collection-manual.component';
import { SynOverviewComponent } from './syn-overview/syn-overview.component';
import { DiseaseComponent } from './disease/disease.component';
import { DoctorSpecialityComponent } from './doctor-speciality/doctor-speciality.component';
import { DiseaseTableComponent } from './disease-table/disease-table.component';
import { SpecialityTestingComponent } from './speciality-testing/speciality-testing.component';
import { VideoGalleryComponent } from './video-gallery/video-gallery.component';

const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    
    children: [
      
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'overview',
        component: OverviewComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'new-test',
        component: NewTestComponent
      },
      {
        path: '',
        component: LandingHomeComponent
      },
      {
        path: 'landing',
        component: LandingHomeComponent
      },
       {
        path: 'banner',
        component: LandingHomeComponent
      },
      {
        path: 'updated-test',
        component: UpdateTestComponent
      },
      {
        path: 'updated-package',
        component: UpdatePackageComponent
      },
      {
        path: 'new-package',
        component: PackageComponent
      },
      {
        path: 'list',
        component: ListTestComponent
      },
      {
        path: 'resources',
        component: ResourcesComponent
      },
      {
        path: 'test-algorithms',
        component: TestAlgorithmsComponent
      },
      {
        path: 'test-requisition-and-consent-forms',
        component: ConsentFormsComponent
      },
      {
        path: 'popular-test',
        component: PopularTestComponent
      },
      {
        path: 'popular-package',
        component: PopularPackageComponent
      },
      {
        path: 'sample-collection-manual',
        component: SampleCollectionManualComponent
      },
      {
        path: 'symptoms',
        component: SymptomsComponent
      },
      {
        path: 'faq',
        component: FaqComponent
      },
      {
        path: 'overviews',
        component: SynOverviewComponent
      },
      {
        path: 'diseases',
        component: DiseaseComponent
      },
      {
        path: 'Diseases',
        component: DiseaseTableComponent
      },
      {
        path: 'speciality-testing',
        component: SpecialityTestingComponent
      },
      {
        path: 'doctor-speciality',
        component: DoctorSpecialityComponent
      },
      {
        path: 'video-gallery',
        component: VideoGalleryComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule { }
