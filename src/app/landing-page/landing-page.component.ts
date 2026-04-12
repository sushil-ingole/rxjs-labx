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
  stats = [
    { value: '50+', label: 'Operators' },
    { value: 'Live', label: 'Timelines' },
    { value: '100%', label: 'Free' }
  ];

  features = [
    {
      icon: '▶',
      title: 'Live Visual Timelines',
      description: 'See values emitted over time — not static marble diagrams, but actual running streams.'
    },
    {
      icon: '⚡',
      title: 'Instant Experimentation',
      description: 'Change inputs, hit run, and watch the output update. No setup, no boilerplate.'
    },
    {
      icon: '🔍',
      title: 'Side-by-Side Comparisons',
      description: 'Compare similar operators like switchMap vs mergeMap to see exactly how they differ.'
    }
  ];

  capabilities = [
    {
      title: 'Real-time operator playground',
      description: 'Pick any operator and run it with custom inputs. See each emitted value timestamped on a live timeline.'
    },
    {
      title: 'Adjustable parameters',
      description: 'Modify source values, intervals, and operator arguments to understand how each parameter affects behavior.'
    },
    {
      title: 'Async behavior visualization',
      description: 'Timing is what makes RxJS tricky. Watch delays, intervals, and race conditions play out visually.'
    },
    {
      title: 'Compare & contrast operators',
      description: 'Run composite comparisons to see multiple operators process the same input side by side.'
    }
  ];

  futureItems = [
    { label: 'Operators', active: true },
    { label: 'Observables', active: false },
    { label: 'Subjects', active: false },
    { label: 'Schedulers', active: false },
    { label: 'Marble Testing', active: false }
  ];

  openGitHub() {
    window.open('https://github.com/sushil-ingole/rxjs-labx', '_blank');
  }
}
