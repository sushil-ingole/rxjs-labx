import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OPERATOR_REGISTRY } from '../data/operator-registry';

interface OperatorGroup {
  title: string;
  operators: string[];
}

@Component({
  selector: 'app-rxjs-operators',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './rxjs-operators.component.html',
  styleUrl: './rxjs-operators.component.scss'
})
export class RxjsOperatorsComponent {
  readonly libraryName = 'RxJS';
  searchTerm = '';

  get totalOperators(): number {
    return this.operatorGroups.reduce((sum, g) => sum + g.operators.length, 0);
  }

  get filteredOperatorGroups(): OperatorGroup[] {
    return this.filterGroups(this.operatorGroups);
  }

  get filteredComparisonGuides(): OperatorGroup[] {
    return this.filterGroups(this.comparisonGuides);
  }

  private filterGroups(groups: OperatorGroup[]): OperatorGroup[] {
    if (!this.searchTerm.trim()) return groups;
    const term = this.searchTerm.toLowerCase();
    return groups
      .map(g => ({
        ...g,
        operators: g.operators.filter(op => op.toLowerCase().includes(term))
      }))
      .filter(g => g.operators.length > 0 || g.title.toLowerCase().includes(term));
  }

  // Category display order
  private static readonly CATEGORY_ORDER = [
    'Creation & Combination',
    'Transformation',
    'Filtering',
    'Utility & Side Effects',
    'Error Handling',
    'Multicasting & Sharing',
    'Aggregation',
    'Conditional & Boolean',
    'Time-based'
  ];

  // Auto-generated from OPERATOR_REGISTRY categories
  operatorGroups: OperatorGroup[] = (() => {
    const groups = new Map<string, string[]>();
    for (const [name, op] of Object.entries(OPERATOR_REGISTRY)) {
      const cat = op.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(name);
    }
    // Sort operators alphabetically within each group
    for (const ops of groups.values()) ops.sort();
    // Order groups by defined category order
    return RxjsOperatorsComponent.CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => ({ title: cat, operators: groups.get(cat)! }));
  })();

  deprecatedOperators: OperatorGroup[] = [
    {
      title: 'Deprecated Mapping Shortcuts',
      operators: [
        'mapTo',
        'pluck',
        'exhaust',
        'repeatWhen',
        'retryWhen'
      ]
    },
    {
      title: 'Deprecated *To Operators',
      operators: [
        'concatMapTo',
        'mergeMapTo',
        'switchMapTo'
      ]
    },
    {
      title: 'Deprecated Multicasting APIs',
      operators: [
        'publish',
        'publishBehavior',
        'publishReplay',
        'publishLast',
        'refCount'
      ]
    },
    {
      title: 'Deprecated / Discouraged APIs',
      operators: [
        'onErrorResumeNext'
      ]
    }
  ];

  comparisonGuides: OperatorGroup[] = [

    {
      title: 'Combination Basics',
      operators: [
        'combineLatest-VS-zip-VS-forkJoin-VS-withLatestFrom'
      ]
    },

    {
      title: 'Flattening (Inner Observables)',
      operators: [
        'mergeMap-VS-concatMap-VS-switchMap-VS-exhaustMap'
      ]
    },

    {
      title: 'Flatten Helpers',
      operators: [
        'mergeAll-VS-concatAll-VS-switchAll-VS-exhaustAll'
      ]
    },

    {
      title: 'Take Family',
      operators: [
        'take-VS-takeLast-VS-takeUntil-VS-takeWhile'
      ]
    },

    {
      title: 'First vs Last vs Single',
      operators: [
        'first-VS-last-VS-single'
      ]
    },

    {
      title: 'Skip Family',
      operators: [
        'skip-VS-skipLast-VS-skipUntil-VS-skipWhile'
      ]
    },

    {
      title: 'Time Control (Debounce vs Throttle vs Sample vs Audit)',
      operators: [
        'debounceTime-VS-throttleTime-VS-sampleTime-VS-auditTime'
      ]
    },

    {
      title: 'Distinct Variants',
      operators: [
        'distinct-VS-distinctUntilChanged-VS-distinctUntilKeyChanged'
      ]
    },

    {
      title: 'Buffer vs Window',
      operators: [
        'buffer-VS-bufferCount-VS-bufferTime-VS-window-VS-windowCount-VS-windowTime'
      ]
    },

    {
      title: 'Find vs Element Access',
      operators: [
        'find-VS-findIndex-VS-elementAt'
      ]
    },

    {
      title: 'Repeat vs Retry (Core Difference)',
      operators: [
        'repeat-VS-retry'
      ]
    },

    {
      title: 'Retry Strategies',
      operators: [
        'retry-VS-retryWhen'
      ]
    },

    {
      title: 'Repeat Strategies',
      operators: [
        'repeat-VS-repeatWhen'
      ]
    },

    {
      title: 'Error Handling',
      operators: [
        'catchError-VS-retry-VS-retryWhen'
      ]
    },

    {
      title: 'Delay vs DelayWhen',
      operators: [
        'delay-VS-delayWhen'
      ]
    },

    {
      title: 'Timeout Handling',
      operators: [
        'timeout-VS-timeoutWith'
      ]
    },

    {
      title: 'Multicasting',
      operators: [
        'share-VS-shareReplay'
      ]
    },

    {
      title: 'Connect vs Connectable',
      operators: [
        'connect-VS-connectable'
      ]
    },

    {
      title: 'Aggregation',
      operators: [
        'count-VS-toArray-VS-reduce'
      ]
    },

    {
      title: 'Reduce vs Scan',
      operators: [
        'reduce-VS-scan'
      ]
    },

    {
      title: 'Min vs Max',
      operators: [
        'min-VS-max'
      ]
    },

    {
      title: 'Empty Handling',
      operators: [
        'isEmpty-VS-defaultIfEmpty-VS-throwIfEmpty'
      ]
    },

    {
      title: 'Sequence Comparison',
      operators: [
        'sequenceEqual-VS-every'
      ]
    },

    {
      title: 'Time Metadata',
      operators: [
        'timeInterval-VS-timestamp'
      ]
    }
  ];
}
