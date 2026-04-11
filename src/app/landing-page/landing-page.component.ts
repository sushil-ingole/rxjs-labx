import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  features = [
    'Visual timelines instead of theory',
    'Real-time input experimentation',
    'Understand behavior instantly'
  ];

  capabilities = [
    'Play with RxJS operators in real-time',
    'Modify inputs and see output changes',
    'Understand timing & async behavior visually',
    'Build intuition instead of memorizing'
  ];

  futureItems = [
    'Operators',
    'Observables',
    'Subjects',
    'Schedulers',
    'Marble Testing'
  ];

  openGitHub() {
    window.open('https://github.com/sushil-ingole/rxjs-labx', '_blank');
  }
}
