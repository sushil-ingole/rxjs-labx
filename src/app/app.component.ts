import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { RxjsOperatorsComponent } from "./rxjs-operators/rxjs-operators.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RxjsOperatorsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
