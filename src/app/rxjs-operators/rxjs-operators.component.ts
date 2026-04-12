import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OPERATOR_REGISTRY } from '../data/operator-registry';

export interface OperatorGroup {
  title: string;
  operators: string[];
}

export const COMPARISON_GUIDES: OperatorGroup[] = [

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
    title: 'Take & Skip (Count-based)',
    operators: [
      'take-VS-takeLast-VS-skip-VS-skipLast'
    ]
  },

  {
    title: 'Take vs Skip (Until — Time Trigger)',
    operators: [
      'takeUntil-VS-skipUntil'
    ]
  },

  {
    title: 'Take vs Skip (While — Condition)',
    operators: [
      'takeWhile-VS-skipWhile'
    ]
  },

  {
    title: 'First vs Last vs Single',
    operators: [
      'first-VS-last-VS-single'
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
      'distinct-VS-distinctUntilChanged'
    ]
  },

  {
    title: 'Buffer vs Window (Event-based)',
    operators: [
      'buffer-VS-window'
    ]
  },

  {
    title: 'Buffer vs Window (Time-based)',
    operators: [
      'bufferTime-VS-windowTime'
    ]
  },

  {
    title: 'Buffer vs Window (Count-based)',
    operators: [
      'bufferCount-VS-windowCount'
    ]
  },

  {
    title: 'Find vs FindIndex',
    operators: [
      'find-VS-findIndex'
    ]
  },

  {
    title: 'Error Handling',
    operators: [
      'catchError-VS-retry'
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
    title: 'Time Metadata',
    operators: [
      'timeInterval-VS-timestamp'
    ]
  }
];

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

  // Auto-generated from OPERATOR_REGISTRY categories (excludes deprecated)
  operatorGroups: OperatorGroup[] = (() => {
    const groups = new Map<string, string[]>();
    for (const [name, op] of Object.entries(OPERATOR_REGISTRY)) {
      if (op.deprecated) continue;
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

  // Deprecated operator groupings
  private static readonly DEPRECATED_GROUPS: { title: string; operators: string[] }[] = [
    {
      title: 'Deprecated Mapping Shortcuts',
      operators: ['mapTo', 'pluck', 'flatMap']
    },
    {
      title: 'Deprecated *To Operators',
      operators: ['concatMapTo', 'mergeMapTo', 'switchMapTo']
    },
    {
      title: 'Deprecated Flattening',
      operators: ['exhaust', 'combineAll']
    },
    {
      title: 'Deprecated Repeat & Retry',
      operators: ['repeatWhen', 'retryWhen']
    },
    {
      title: 'Deprecated Multicasting APIs',
      operators: ['publish', 'publishBehavior', 'publishReplay', 'publishLast', 'multicast', 'refCount']
    },
    {
      title: 'Deprecated Creation Operators',
      operators: ['race', 'partition']
    },
    {
      title: 'Deprecated / Discouraged APIs',
      operators: ['onErrorResumeNext', 'timeoutWith']
    }
  ];

  // Auto-filtered: only show operators that exist in registry
  deprecatedOperators: OperatorGroup[] = RxjsOperatorsComponent.DEPRECATED_GROUPS
    .map(g => ({
      ...g,
      operators: g.operators.filter(op => OPERATOR_REGISTRY[op])
    }))
    .filter(g => g.operators.length > 0);

  comparisonGuides: OperatorGroup[] = COMPARISON_GUIDES;
}
