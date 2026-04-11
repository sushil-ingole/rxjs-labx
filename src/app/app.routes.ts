import { Routes } from '@angular/router';
import { OperatorDetailComponent } from './operator-detail/operator-detail.component';
import { RxjsOperatorsComponent } from './rxjs-operators/rxjs-operators.component';

export const routes: Routes = [
    { path: 'operators', component: RxjsOperatorsComponent },
    { path: 'operator/:name', component: OperatorDetailComponent },
    { path: '', redirectTo: 'operators', pathMatch: 'full' }
];
