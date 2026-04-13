import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
export class LandingPageComponent implements AfterViewInit {
  private readonly registry = Object.values(OPERATOR_REGISTRY);

  @ViewChild('heroStats') heroStatsRef!: ElementRef;

  stats = [
    { target: this.registry.length, suffix: '+', display: '0+', label: 'Operators' },
    { target: COMPARISON_GUIDES.length, suffix: '', display: '0', label: 'Comparisons' },
    { target: new Set(this.registry.map(op => op.category)).size, suffix: '', display: '0', label: 'Categories' }
  ];

  ngAfterViewInit(): void {
    // Stats count-up observer
    const statsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.animateStats();
        statsObserver.disconnect();
      }
    }, { threshold: 0.2 });
    statsObserver.observe(this.heroStatsRef.nativeElement);

    // Scroll-reveal observer for .anim elements
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.anim').forEach(el => revealObserver.observe(el));
  }

  private animateStats(): void {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      this.stats.forEach(stat => {
        const current = Math.round(eased * stat.target);
        stat.display = `${current}${stat.suffix}`;
      });

      if (step >= steps) {
        clearInterval(timer);
        this.stats.forEach(stat => {
          stat.display = `${stat.target}${stat.suffix}`;
        });
      }
    }, interval);
  }

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
