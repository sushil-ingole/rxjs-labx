import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OPERATOR_REGISTRY } from '../data/operator-registry';
import { COMPARISON_GUIDES } from '../rxjs-operators/rxjs-operators.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  private readonly registry = Object.values(OPERATOR_REGISTRY);

  stats = [
    { value: `${this.registry.length}+`, label: 'Operators' },
    { value: `${COMPARISON_GUIDES.length}`, label: 'Comparisons' },
    { value: `${new Set(this.registry.map(op => op.category)).size}`, label: 'Categories' }
  ];

  private readonly deprecatedCount = this.registry.filter(op => op.deprecated).length;

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
      description: `${COMPARISON_GUIDES.length} comparison guides let you run similar operators against the same input and see exactly how they differ.`
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
    },
    {
      title: 'Deprecated operator coverage',
      description: `Explore ${this.deprecatedCount}+ deprecated operators with working playgrounds and clear guidance on modern replacements.`
    }
  ];
}
