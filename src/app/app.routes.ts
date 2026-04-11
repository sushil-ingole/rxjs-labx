import { Routes } from '@angular/router';
import { OperatorDetailComponent } from './operator-detail/operator-detail.component';
import { RxjsOperatorsComponent } from './rxjs-operators/rxjs-operators.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'operators', component: RxjsOperatorsComponent },
    { path: 'operator/:name', component: OperatorDetailComponent },
    { path: '', redirectTo: '/', pathMatch: 'full' }
];
