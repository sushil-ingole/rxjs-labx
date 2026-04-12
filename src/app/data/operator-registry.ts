import {
  combineLatest,
  combineLatestAll,
  concat,
  delay,
  interval,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  Subscription,
  zip,
  zipAll,
  forkJoin,
  withLatestFrom,
  merge,
  concatAll,
  concatMap,
  mergeAll,
  mergeMap,
  exhaustMap,
  exhaustAll,
  mergeScan,
  pairwise,
  race,
  raceWith,
  startWith,
  switchAll,
  buffer,
  bufferCount,
  bufferTime,
  bufferToggle,
  bufferWhen,
  expand,
  groupBy,
  scan,
  window,
  windowTime,
  windowToggle,
  windowWhen,
  windowCount,
  audit,
  auditTime,
  debounce,
  debounceTime,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  elementAt,
  catchError,
  filter,
  find,
  findIndex,
  first,
  ignoreElements,
  endWith,
  last,
  sample,
  sampleTime,
  single,
  skip,
  skipLast,
  skipUntil,
  skipWhile,
  takeLast,
  takeUntil,
  takeWhile,
  throttle,
  throttleTime,
  delayWhen,
  finalize,
  repeat,
  repeatWhen,
  retry,
  retryWhen,
  timeout,
  timeoutWith,
  toArray,
  throwIfEmpty,
  share,
  shareReplay,
  connectable,
  connect,
  count,
  max,
  min,
  defaultIfEmpty,
  reduce,
  every,
  isEmpty,
  sequenceEqual,
  timeInterval,
  timestamp,
  combineLatestWith,
  concatWith,
  mergeWith,
  zipWith,
  switchScan,
  materialize,
  dematerialize,
  observeOn,
  subscribeOn,
  asyncScheduler,
  mapTo,
  pluck,
  partition,
  multicast,
  publish,
  publishBehavior,
  publishLast,
  publishReplay,
  refCount,
  Subject,
  ReplaySubject,
  BehaviorSubject,
  onErrorResumeNext,
  Notification,
  EMPTY,
  timer,
} from 'rxjs';

export interface OperatorDemo {
  name: string;
  category: string;
  description: string;
  syntax: string;

  inputs: {
    label: string;
    defaultValue: any[];
    type?: 'number' | 'text' | 'object' | 'radio' | 'select';
    hide?: boolean;
    options?: any[];
  }[];

  run: (inputs: any[][]) => Observable<PlaygroundEvent>;

  // Related operators for comparison
  comparisons?: string[];

  // If deprecated, the replacement recommendation
  deprecated?: string;
}

export type PlaygroundEvent =
  | string
  | { type: 'inner'; label: string }
  | { type: 'value'; value: string }
  | { type: 'composite-header'; operator: string };

export type OutputRow =
  | {
      kind: 'value';
      index: number;
      value: string;
      time: string;
    }
  | {
      kind: 'meta';
      value: string;
      time: string;
    };

// Internal type: name is auto-derived from registry key
type OperatorRegistryEntry = Omit<OperatorDemo, 'name'>;

interface OperatorDescriptionConfig {
  definition: string;
  mentalModel: string;
  stepByStep: string[];
  timeline?: string;
  keyDifferences: string[];
  useCases: string[];
  gotchas: string[];
  categoryNote?: string;
}

function createOperatorDescription({
  definition,
  mentalModel,
  stepByStep,
  timeline,
  keyDifferences,
  useCases,
  gotchas,
  categoryNote,
}: OperatorDescriptionConfig): string {
  const sections: string[] = [
    definition,
    '',
    '🧠 Mental Model:',
    mentalModel,
    '',
    '⚙️ How it works:',
    ...stepByStep.map((step, i) => `${i + 1}. ${step}`),
  ];

  if (timeline) {
    sections.push('', '⏱️ Timeline:', timeline);
  }

  sections.push(
    '',
    '🔀 Key Differences:',
    ...keyDifferences.map((diff) => `• ${diff}`),
    '',
    '💡 Use Cases:',
    ...useCases.map((use) => `• ${use}`),
    '',
    '⚠️ Gotchas:',
    ...gotchas.map((g) => `• ${g}`),
  );

  if (categoryNote) {
    sections.push('', '📦 Category Insight:', categoryNote);
  }

  return sections.join('\n');
}

const _REGISTRY: Record<string, OperatorRegistryEntry> = {
  combineLatest: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Combines latest values from multiple observables, emitting whenever ANY observable emits (after all have emitted at least once).',
      mentalModel:
        'A spreadsheet that recalculates whenever any cell changes, always using the latest value from each column.',
      stepByStep: [
        'Subscribe to all observables simultaneously',
        'Wait until each observable has emitted at least once',
        'Store the latest value from each observable',
        'Whenever any observable emits, combine with latest values from others',
        'Emit the combined result as an array',
      ],
      timeline: `A:   --1--------2--------3--|
B:   --10-------20-------30-|
Out: --[1,10]--[2,10]--[2,20]--[3,20]--[3,30]
     ↑ Both emitted    ↑ A changed, reuse B's latest`,
      keyDifferences: [
        'vs zip → zip pairs values one-to-one by index; combineLatest reuses latest values',
        'vs forkJoin → forkJoin emits once after all complete; combineLatest emits continuously',
        'vs withLatestFrom → withLatestFrom emits only when source emits, not on any change',
      ],
      useCases: [
        'Combining multiple form field values in real-time',
        'Merging UI filters with API data',
        'Live dashboards with multiple data streams',
      ],
      gotchas: [
        'Does NOT emit until all observables have emitted at least once',
        'Can emit very frequently if any source emits rapidly',
        'Keeps latest values in memory for each source',
      ],
      categoryNote:
        'Combination operator → merges multiple streams using latest-value strategy.',
    }),

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

combineLatest([obs1$, obs2$])
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),
    comparisons: [
      'combineLatestAll',
      'zip',
      'zipAll',
      'forkJoin',
      'withLatestFrom',
    ],

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [500] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return combineLatest([obs1$, obs2$]).pipe(
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },
  combineLatestAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by applying combineLatest on all collected inner observables after the source completes.',
      mentalModel:
        'Collect all inner channels first, then monitor all of them simultaneously with combineLatest.',
      stepByStep: [
        'Subscribe to outer (source) observable',
        'Collect each inner observable as source emits them',
        'Wait for the source observable to complete',
        'Apply combineLatest to all collected inner observables',
        'Emit combined latest values whenever any inner emits',
      ],
      timeline: `Source: --innerA\$----innerB\$--|  (completes after emitting 2 inners)
After source completes → combineLatest(innerA\$, innerB\$)
InnerA\$ emits 1,2,3 synchronously (of) → latest stored = 3
InnerB\$ emits 10,20,30 synchronously (of) → combines with A's latest (3)
Out:    [3,10] → [3,20] → [3,30]`,
      keyDifferences: [
        'vs combineLatest → combineLatest takes a static list; combineLatestAll works with dynamic inner observables',
        'vs mergeAll → mergeAll emits from each inner independently; combineLatestAll combines latest from all',
        'vs concatAll → concatAll subscribes to inners sequentially; combineLatestAll subscribes to all after source completes',
      ],
      useCases: [
        'Dynamic number of streams that need latest-value combination',
        'Reactive forms with dynamically added fields',
      ],
      gotchas: [
        'No output until the outer observable completes',
        'If outer never completes, no values are ever emitted',
        'All inner observables must emit at least once before output starts',
      ],
      categoryNote:
        'Combination operator → higher-order variant of combineLatest for dynamic inner streams.',
    }),

    comparisons: [
      'combineLatest',
      'zipAll',
      'mergeAll',
      'concatAll',
      'switchAll',
    ],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const intervalMs = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;

interval(intervalMs)
  .pipe(
    take(2),
    map(i => i === 0 ? of(...aValues) : of(...bValues)),
    combineLatestAll()
  )
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Interval (ms)', defaultValue: [1000] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
    ],

    run: (inputs) => {
      const [aValues, intervalMs, bValues] = inputs;

      const innerA$ = of(...aValues);
      const innerB$ = of(...bValues);

      return interval(intervalMs[0]).pipe(
        take(2),
        map((i) => (i === 0 ? innerA$ : innerB$)),
        combineLatestAll(),
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },
  concat: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Subscribes to observables one after another sequentially, starting each only after the previous completes.',
      mentalModel:
        'A playlist — next song starts only when the current one finishes.',
      stepByStep: [
        'Subscribe to the first observable',
        'Emit all its values',
        'Wait for it to complete',
        'Subscribe to the next observable',
        'Repeat until all observables are done',
      ],
      timeline: `A: --1--2--3--|
B:              --10--20--30--|
Out: 1, 2, 3, 10, 20, 30  (sequential, never mixed)`,
      keyDifferences: [
        'vs merge → merge subscribes to all concurrently and interleaves; concat is strictly sequential',
        'vs switchMap → switchMap cancels previous; concat waits for completion',
        'vs forkJoin → forkJoin runs in parallel and emits last values; concat runs in series',
      ],
      useCases: [
        'Executing sequential HTTP requests (step 1 → step 2 → step 3)',
        'Ensuring ordered operations like: fetch → cache → display',
        'Loading resources in a specific order',
      ],
      gotchas: [
        'If any observable never completes, subsequent ones never start',
        'Order of arguments determines execution order',
        'Not suitable for parallel operations',
      ],
      categoryNote:
        'Combination operator → sequential concatenation of streams.',
    }),

    comparisons: ['merge', 'switchMap'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;

concat(of(...aValues), of(...bValues))
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [0], hide: true },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [0], hide: true },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      return concat(of(...aValues), of(...bValues)).pipe(
        map((value) => String(value)),
      );
    },
  },
  concatAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by subscribing to each inner observable one at a time, in order.',
      mentalModel:
        'A queue — process one task completely before starting the next.',
      stepByStep: [
        'Subscribe to the source (outer) observable',
        'Receive and subscribe to the first inner observable',
        'Emit all its values',
        'Wait for it to complete',
        'Subscribe to the next inner observable',
        'Repeat until all inners are done',
      ],
      timeline: `Source: --innerA\$--innerB\$--|
innerA\$: --1--2--3--|
innerB\$:              --10--20--30--|
Out:     1, 2, 3, 10, 20, 30  (one at a time, in order)`,
      keyDifferences: [
        'vs mergeAll → mergeAll subscribes to all inners concurrently; concatAll waits for each to complete',
        'vs switchAll → switchAll cancels previous inner; concatAll queues them',
        'vs exhaustAll → exhaustAll ignores new while busy; concatAll queues and processes all',
      ],
      useCases: [
        'Processing tasks in strict sequential order',
        'Sequential animations that must not overlap',
        'Ordered API call chains from dynamic sources',
      ],
      gotchas: [
        'If any inner never completes, the queue stalls permanently',
        'Backpressure risk if inners arrive faster than they complete',
        'Queued inners accumulate in memory',
      ],
      categoryNote:
        'Combination operator → sequential flattening of higher-order observables.',
    }),

    comparisons: ['mergeAll', 'switchAll', 'concat'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;

// Outer observable emits inner observables
of(
  of(...aValues),
  of(...bValues)
)
.pipe(concatAll())
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      {
        label: 'Inner Observable A Interval (ms)',
        defaultValue: [0],
        hide: true,
      },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      {
        label: 'Inner Observable B Interval (ms)',
        defaultValue: [0],
        hide: true,
      },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      return of(of(...aValues), of(...bValues)).pipe(
        concatAll(),
        map((value) => String(value)),
      );
    },
  },
  concatMap: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Maps each source value to an inner observable and subscribes sequentially, waiting for each to complete before processing the next.',
      mentalModel:
        'A factory assembly line — each item must finish processing before the next one enters.',
      stepByStep: [
        'Receive value from source',
        'Map it to an inner observable using the projection function',
        'Subscribe to the inner observable',
        'Emit all inner values',
        'Wait for inner to complete',
        'Process the next source value',
      ],
      timeline: `Source:  --A------B------C--|
innerA\$: --1--2--|
innerB\$:          --3--4--|
innerC\$:                   --5--6--|
Out:     1, 2, 3, 4, 5, 6  (strictly ordered)`,
      keyDifferences: [
        'vs mergeMap → mergeMap runs all inners concurrently; concatMap queues them',
        'vs switchMap → switchMap cancels previous inner on new source; concatMap waits',
        'vs exhaustMap → exhaustMap ignores new source values while busy; concatMap queues them',
      ],
      useCases: [
        'Sequential API calls where order matters',
        'File uploads processed one at a time',
        'Database operations needing strict ordering',
      ],
      gotchas: [
        'Slow inner observables delay all subsequent ones',
        'Source values queue up in memory while waiting',
        'If inner never completes, the stream stalls',
      ],
      categoryNote: 'Combination operator → sequential higher-order mapping.',
    }),

    comparisons: ['mergeMap', 'switchMap', 'exhaustMap', 'concatAll'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const innerValues = $INPUT_2_ARRAY;
const innerInterval = $INPUT_3_VALUE;

interval(sourceInterval)
  .pipe(
    take(sourceValues.length),
    concatMap((_, index) =>
      interval(innerInterval).pipe(
        take(innerValues.length),
        map(i => 'inner-' + (index + 1) + ': ' + innerValues[i])
      )
    )
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Inner Values', defaultValue: [10, 20, 30] },
      { label: 'Inner Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [sourceValues, sourceIntervalArr, innerValues, innerIntervalArr] =
        inputs;

      const sourceInterval = sourceIntervalArr[0];
      const innerInterval = innerIntervalArr[0];

      return interval(sourceInterval).pipe(
        take(sourceValues.length),
        concatMap((_, index) =>
          interval(innerInterval).pipe(
            take(innerValues.length),
            map((i) => `inner-${index + 1}: ${innerValues[i]}`),
          ),
        ),
        map(String),
      );
    },
  },
  exhaustAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable, ignoring new inner observables while the current one is still active.',
      mentalModel:
        'A busy door — if someone is inside, no one else can enter until they leave.',
      stepByStep: [
        'Subscribe to the source (outer) observable',
        'Subscribe to the first inner observable',
        'Emit its values',
        'Ignore any new inner observables that arrive while the current is active',
        'When current inner completes, accept the next inner',
      ],
      timeline: `Source:  --inner1\$--inner2\$(ignored)--|
inner1\$: --1--2--3--|
Out:     1, 2, 3  (inner2\$ was ignored because inner1\$ was still active, source had no more inners)`,
      keyDifferences: [
        'vs mergeAll → mergeAll subscribes to all concurrently; exhaustAll ignores new while busy',
        'vs switchAll → switchAll cancels current for new; exhaustAll keeps current and ignores new',
        'vs concatAll → concatAll queues all inners; exhaustAll drops ones that arrive while busy',
      ],
      useCases: [
        'Preventing duplicate form submissions',
        'Ignoring rapid button clicks while processing',
        'Debounce-like behavior for operations',
      ],
      gotchas: [
        'New inner observables during active subscription are silently dropped',
        'No queuing — dropped inners are lost forever',
        'If inner never completes, all subsequent inners are permanently lost',
      ],
      categoryNote:
        'Combination operator → selective flattening that prevents concurrent execution.',
    }),

    comparisons: ['exhaustMap', 'mergeAll', 'concatAll'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const inner1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const inner2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

of(inner1$, inner2$)
  .pipe(exhaustAll())
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Inner Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      { label: 'Inner Observable B Interval (ms)', defaultValue: [100] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const inner1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const inner2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return of(inner1$, inner2$).pipe(
        exhaustAll(),
        map((v) => String(v)),
      );
    },
  },
  exhaustMap: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Maps each source value to an inner observable, ignoring new source values while the current inner is still active.',
      mentalModel:
        'A phone call — if you are on a call, incoming calls are ignored until you hang up.',
      stepByStep: [
        'Receive value from source',
        'Map to inner observable and subscribe',
        'Emit inner values',
        'Ignore new source values while inner is active',
        'When inner completes, accept the next source value',
      ],
      timeline: `Source:  --1------2(ignored)--3(ignored)--|
inner-1: --10--20--30--|
Out:     inner-1: 10, inner-1: 20, inner-1: 30  (2 and 3 ignored because inner-1 was still active)`,
      keyDifferences: [
        'vs switchMap → switchMap cancels current for new; exhaustMap keeps current and ignores new',
        'vs mergeMap → mergeMap runs all concurrently; exhaustMap only allows one at a time',
        'vs concatMap → concatMap queues all values; exhaustMap drops those arriving while busy',
      ],
      useCases: [
        'Login button click handling (ignore re-clicks while logging in)',
        'Preventing duplicate API requests',
        'Form submission protection',
      ],
      gotchas: [
        'New source values during active inner are silently lost',
        'Not suitable when every value must be processed',
        'Different from debounce — exhaustMap processes immediately',
      ],
      categoryNote:
        'Combination operator → selective mapping that prevents concurrent execution.',
    }),

    comparisons: ['concatMap', 'mergeMap', 'switchMap', 'exhaustAll'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const innerValues = $INPUT_2_ARRAY;
const innerInterval = $INPUT_3_VALUE;

interval(sourceInterval)
  .pipe(
    take(sourceValues.length),
    exhaustMap((_, index) =>
      interval(innerInterval).pipe(
        take(innerValues.length),
        map(i => 'inner-' + (index + 1) + ': ' + innerValues[i])
      )
    )
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [200] },
      { label: 'Inner Values', defaultValue: [10, 20, 30] },
      { label: 'Inner Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [sourceValues, sourceIntervalArr, innerValues, innerIntervalArr] =
        inputs;

      const sourceInterval = sourceIntervalArr[0];
      const innerInterval = innerIntervalArr[0];

      return interval(sourceInterval).pipe(
        take(sourceValues.length),
        exhaustMap((_, index) =>
          interval(innerInterval).pipe(
            take(innerValues.length),
            map((i) => `inner-${index + 1}: ${innerValues[i]}`),
          ),
        ),
        map(String),
      );
    },
  },
  forkJoin: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Waits for ALL observables to complete, then emits the LAST value from each as a single combined emission.',
      mentalModel:
        'Promise.all() — wait for everything to finish, then give me all the final results.',
      stepByStep: [
        'Subscribe to all observables concurrently',
        'Wait for each one to complete',
        'Collect the last emitted value from each',
        'Emit combined array/object of last values',
        'Complete',
      ],
      timeline: `A: --1--2--3--|       (completes at 900ms)
B: --10--------20--------30--|  (completes at 1500ms)
Out:                          [3, 30]  (last value from each, after ALL complete)`,
      keyDifferences: [
        'vs combineLatest → combineLatest emits continuously on any change; forkJoin emits once at the end',
        'vs zip → zip pairs by emission index; forkJoin only cares about final values',
        'vs concat → concat runs sequentially; forkJoin runs in parallel',
      ],
      useCases: [
        'Parallel HTTP requests needing all results before proceeding',
        'Loading initial app data from multiple APIs simultaneously',
        'Batch operations that must all succeed',
      ],
      gotchas: [
        'If ANY observable errors, the whole forkJoin errors',
        'If ANY observable never completes, forkJoin never emits',
        'Empty observables cause forkJoin to complete immediately with empty result',
      ],
      categoryNote:
        'Combination operator → parallel execution with final-result collection.',
    }),

    comparisons: ['combineLatest', 'zip'],
    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

forkJoin([obs1$, obs2$])
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return forkJoin([obs1$, obs2$]).pipe(map(([a, b]) => `[${a}, ${b}]`));
    },
  },
  merge: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Subscribes to multiple observables concurrently and interleaves their emissions into a single output stream.',
      mentalModel:
        'Multiple lanes merging into one highway — all cars arrive as they come, no waiting.',
      stepByStep: [
        'Subscribe to all observables at once',
        'Emit values from any source as they arrive',
        'Continue until all observables complete',
        'Complete the output',
      ],
      timeline: `A: --1-----2-----3--|
B: ----10-----20-----30--|
Out: 1, 10, 2, 20, 3, 30  (interleaved by timing)`,
      keyDifferences: [
        'vs concat → concat waits for each to complete before next; merge runs all concurrently',
        'vs combineLatest → combineLatest combines latest values; merge just interleaves independently',
        'vs race → race only keeps the first emitter; merge keeps all',
      ],
      useCases: [
        'Merging multiple event streams (clicks, hovers, keyboard)',
        'Combining multiple WebSocket feeds',
        'Aggregating responses from multiple sources',
      ],
      gotchas: [
        'Output order depends on timing, not argument order',
        'If any observable errors, merge errors',
        'Optional concurrent parameter limits simultaneous subscriptions',
      ],
      categoryNote:
        'Combination operator → concurrent interleaving of multiple streams.',
    }),

    comparisons: ['concat', 'mergeAll', 'switchMap'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

merge(
  interval(aInterval).pipe(take(aValues.length), map(i => aValues[i])),
  interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]))
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return merge(obs1$, obs2$).pipe(map((value) => String(value)));
    },
  },
  mergeAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by subscribing to all inner observables concurrently.',
      mentalModel:
        'Opening all packages at once instead of one at a time — everything comes out simultaneously.',
      stepByStep: [
        'Subscribe to the source (outer) observable',
        'As each inner observable arrives, subscribe immediately',
        'Emit values from all active inners concurrently',
        'Continue until all inners and source complete',
      ],
      timeline: `Source:  --innerA\$----innerB\$--|
innerA\$: --1----2----3--|
innerB\$:          --10----20----30--|
Out:     1, 10, 2, 20, 3, 30  (interleaved, all concurrent)`,
      keyDifferences: [
        'vs concatAll → concatAll subscribes one at a time; mergeAll subscribes to all concurrently',
        'vs switchAll → switchAll cancels previous inner; mergeAll keeps all active',
        'vs exhaustAll → exhaustAll ignores new while busy; mergeAll accepts everything',
      ],
      useCases: [
        'Handling multiple concurrent API calls',
        'Processing parallel tasks from dynamic sources',
        'Merging dynamic event streams',
      ],
      gotchas: [
        'Unlimited concurrency can overwhelm resources',
        'No ordering guarantee between inner emissions',
        'Memory grows with many active inner observables',
      ],
      categoryNote:
        'Combination operator → concurrent flattening of higher-order observables.',
    }),

    comparisons: ['concatAll', 'switchAll', 'merge', 'concatMap'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bInterval = $INPUT_3_VALUE;

// Outer observable emits inner observables
of(
  interval(aInterval).pipe(take(aValues.length), map(i => aValues[i])),
  interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]))
)
.pipe(mergeAll())
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Inner Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      { label: 'Inner Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      return of(
        interval(aInterval[0]).pipe(
          take(aValues.length),
          map((i) => aValues[i]),
        ),
        interval(bInterval[0]).pipe(
          take(bValues.length),
          map((i) => bValues[i]),
        ),
      ).pipe(
        mergeAll(),
        map((value) => String(value)),
      );
    },
  },
  mergeMap: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Maps each source value to an inner observable and subscribes to all of them concurrently, merging their emissions.',
      mentalModel:
        'A team of workers — each incoming task is assigned to a new worker immediately, all work in parallel.',
      stepByStep: [
        'Receive value from source',
        'Map to inner observable using projection function',
        'Subscribe immediately (no waiting for previous)',
        'Emit all inner values as they arrive',
        'Do this for every source value concurrently',
      ],
      timeline: `Source:   --1--------2--------3--|       (@200ms)
inner-1:   --10---20---30--|              (@300ms)
inner-2:            --10---20---30--|
inner-3:                     --10---20---30--|
Out: inner-1:10, inner-2:10, inner-1:20, inner-3:10, ...  (9 values, interleaved)`,
      keyDifferences: [
        'vs switchMap → switchMap cancels previous inner on new source; mergeMap keeps all running',
        'vs concatMap → concatMap queues sequentially; mergeMap runs concurrently',
        'vs exhaustMap → exhaustMap ignores new while busy; mergeMap processes all',
      ],
      useCases: [
        'Parallel HTTP requests where order does not matter',
        'Auto-suggest with concurrent searches',
        'Loading multiple resources simultaneously',
      ],
      gotchas: [
        'Unlimited concurrency by default (can overload server)',
        'No ordering guarantees on output',
        'Can cause race conditions in side effects',
      ],
      categoryNote: 'Combination operator → concurrent higher-order mapping.',
    }),

    comparisons: ['concatMap', 'switchMap', 'exhaustMap', 'mergeAll'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const innerValues = $INPUT_2_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const innerInterval = $INPUT_3_VALUE;

interval(sourceInterval)
  .pipe(
    take(sourceValues.length),
    mergeMap((_, index) =>
      interval(innerInterval).pipe(
        take(innerValues.length),
        map(i => 'inner-' + (index + 1) + ': ' + innerValues[i])
      )
    )
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [200] },
      { label: 'Inner Values', defaultValue: [10, 20, 30] },
      { label: 'Inner Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [sourceValues, sourceIntervalArr, innerValues, innerIntervalArr] =
        inputs;

      const sourceInterval = sourceIntervalArr[0];
      const innerInterval = innerIntervalArr[0];

      return interval(sourceInterval).pipe(
        take(sourceValues.length),
        mergeMap((_, index) =>
          interval(innerInterval).pipe(
            take(innerValues.length),
            map((i) => `inner-${index + 1}: ${innerValues[i]}`),
          ),
        ),
        map(String),
      );
    },
  },
  mergeScan: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Applies an accumulator function that returns an observable, merging each result into the accumulated state.',
      mentalModel:
        'scan + mergeMap combined — accumulate state where each accumulation step is an async operation.',
      stepByStep: [
        'Start with a seed value',
        'Receive value from source',
        'Pass current accumulation and value to accumulator function',
        'Subscribe to the returned observable',
        'Merge result into the accumulation',
        'Use updated accumulation for the next value',
      ],
      keyDifferences: [
        'vs scan → scan accumulates synchronously; mergeScan accumulates via observables',
        'vs mergeMap → mergeMap does not maintain accumulation state; mergeScan does',
        'vs reduce → reduce emits only final value; mergeScan emits each intermediate step',
      ],
      useCases: [
        'Recursive async state accumulation',
        'Paginated API loading with accumulated results',
        'State machines with async transitions',
      ],
      gotchas: [
        'Concurrent inner observables can lead to race conditions in accumulation',
        'Seed value is required',
        'Complex to debug due to async accumulation',
      ],
      categoryNote: 'Combination operator → async stateful accumulation.',
    }),

    comparisons: ['scan', 'mergeMap'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    mergeScan((acc,value)=>of(acc+value),0)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, intervalMs] = inputs;

      return interval(intervalMs[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        mergeScan((acc, v) => of(acc + v), 0),
        map((v) => String(v)),
      );
    },
  },
  pairwise: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Groups consecutive emissions into pairs, emitting each value alongside its previous value as a two-element array.',
      mentalModel:
        'A sliding window of size 2 — always looking at current and previous.',
      stepByStep: [
        'Wait for the first value (no emission yet)',
        'On second value, emit [first, second]',
        'On third value, emit [second, third]',
        'Continue pairing each value with the previous one',
      ],
      timeline: `Source: --1--2--3--4--|
Out:       [1,2] [2,3] [3,4]  (overlapping pairs)`,
      keyDifferences: [
        'vs bufferCount(2) → bufferCount creates non-overlapping chunks; pairwise creates overlapping pairs',
        'vs scan → scan accumulates any state; pairwise specifically pairs consecutive values',
        'vs withLatestFrom → withLatestFrom combines from other streams; pairwise pairs within same stream',
      ],
      useCases: [
        'Calculating deltas between consecutive values',
        'Mouse movement tracking (previous vs current position)',
        'Detecting state changes by comparison',
      ],
      gotchas: [
        'First source emission produces no output (needs 2 values to make a pair)',
        'Source with only 1 emission produces nothing',
        'Always emits one fewer value than the source',
      ],
      categoryNote: 'Combination operator → consecutive value pairing.',
    }),

    comparisons: ['scan'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
.pipe(pairwise())
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4] },
      { label: 'Source Interval (ms)', defaultValue: [0], hide: true },
    ],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        pairwise(),
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },
  race: {
    category: 'Creation & Combination',
    deprecated: 'Use raceWith() instead. race(a$, b$) → a$.pipe(raceWith(b$))',
    description: createOperatorDescription({
      definition:
        'Subscribes to all observables and mirrors only the FIRST one to emit, unsubscribing from all others.',
      mentalModel:
        'A race — first runner to cross the line wins, everyone else goes home.',
      stepByStep: [
        'Subscribe to all observables simultaneously',
        'Wait for any observable to emit first',
        'Mirror only that winning observable',
        'Unsubscribe from all losers',
        'Continue with the winner until it completes',
      ],
      timeline: `A: --1--2--3--|            ← A emits first (300ms), A wins
B: -------10--20--30--|
Out: 1, 2, 3              (B is unsubscribed)`,
      keyDifferences: [
        'vs merge → merge keeps all streams; race keeps only the fastest',
        'vs first → first takes one value and completes; race mirrors the entire winning stream',
        'vs combineLatest → combineLatest combines all; race selects one',
      ],
      useCases: [
        'Fastest API endpoint wins',
        'Timeout fallback patterns',
        'Redundant service calls — take the fastest response',
      ],
      gotchas: [
        'If the winner errors after winning, the race errors',
        'Losers are unsubscribed immediately and permanently',
        'Only the very first emission determines the winner',
      ],
      categoryNote:
        'Combination operator → competitive selection of the fastest stream.',
    }),

    comparisons: ['raceWith', 'merge', 'concat'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

race(obs1$, obs2$)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return race(obs1$, obs2$).pipe(map((v) => String(v)));
    },
  },
  raceWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Pipeable version of race — races the source observable against other provided observables, keeping whichever emits first.',
      mentalModel:
        'Same as race but used as a pipe operator on an existing observable.',
      stepByStep: [
        'Subscribe to the source and all provided observables',
        'First one to emit wins',
        'Mirror the winner',
        'Unsubscribe from all losers',
      ],
      keyDifferences: [
        'vs race → race is a creation function; raceWith is a pipeable operator',
        'vs merge → merge keeps all streams; raceWith picks one winner',
        'vs timeout → timeout throws an error; raceWith switches to alternate stream',
      ],
      useCases: [
        'Adding a timeout fallback using an alternate stream',
        'Racing primary vs backup API endpoint',
        'Responsive fallback patterns in a pipe chain',
      ],
      gotchas: [
        'Same behavior as race — first emission wins the race',
        'Source observable has no priority advantage',
        'All subscriptions start simultaneously',
      ],
      categoryNote: 'Combination operator → pipeable version of race.',
    }),

    comparisons: ['race'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

obs1$
.pipe(
  raceWith(obs2$)
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return obs1$.pipe(
        raceWith(obs2$),
        map((v) => String(v)),
      );
    },
  },
  startWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Emits specified values synchronously before the source observable begins emitting.',
      mentalModel:
        'Adding a preface to a book — guaranteed initial content before the main story.',
      stepByStep: [
        'Emit all provided values synchronously',
        'Then subscribe to the source observable',
        'Emit source values as they arrive normally',
      ],
      timeline: `startWith(0):
Source: -----1--2--3--|
Out:    0----1--2--3--|  (0 emitted synchronously at subscription)`,
      keyDifferences: [
        'vs endWith → endWith appends values at the end after completion; startWith prepends',
        'vs defaultIfEmpty → defaultIfEmpty only emits if source is empty; startWith always prepends',
        'vs of + concat → functionally equivalent but startWith is more concise',
      ],
      useCases: [
        'Providing initial state for UI before async data arrives',
        'Default loading state before API response',
        'Setting initial form values',
      ],
      gotchas: [
        'Values are emitted synchronously before source subscription',
        'Multiple values are emitted in the order provided',
        'Does not delay or affect the source subscription',
      ],
      categoryNote: 'Combination operator → synchronous value prepending.',
    }),

    comparisons: ['concat'],

    syntax: `
const startValues = $INPUT_0_ARRAY;
const sourceValues = $INPUT_2_ARRAY;

of(...sourceValues)
.pipe(
  startWith(...startValues)
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Start Values', defaultValue: [0] },
      { label: 'Start Interval (ms)', defaultValue: [0], hide: true },
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [0], hide: true },
    ],

    run: (inputs) => {
      const [startValues, , sourceValues] = inputs;

      return of(...sourceValues).pipe(
        startWith(...startValues),
        map((v) => String(v)),
      );
    },
  },
  switchAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by subscribing to only the most recent inner observable, canceling the previous one.',
      mentalModel:
        'A TV remote — always watching the latest channel, switching abandons the previous one.',
      stepByStep: [
        'Subscribe to the source of inner observables',
        'When a new inner arrives, subscribe to it',
        'If another inner arrives, unsubscribe from the current one',
        'Switch to the new inner observable',
        'Emit only from the currently active inner',
      ],
      timeline: `Source:  --innerA\$-----------innerB\$--|
innerA\$: --1--2--3--|                  (completes before B arrives)
innerB\$:                     --10--20--30--|
Out:     1, 2, 3, 10, 20, 30  (A completed before B, so no cancellation with these defaults)`,
      keyDifferences: [
        'vs mergeAll → mergeAll keeps all inners running; switchAll cancels previous',
        'vs concatAll → concatAll queues inners; switchAll replaces them',
        'vs exhaustAll → exhaustAll ignores new while busy; switchAll cancels current for new',
      ],
      useCases: [
        'Showing only latest search results',
        'Tab switching where only the active tab matters',
        'Auto-canceling previous async operation',
      ],
      gotchas: [
        'Previous inner is unsubscribed immediately on switch',
        'Values from previous inner after switch are lost',
        'Fast source emissions cause rapid subscribe/unsubscribe cycles',
      ],
      categoryNote: 'Combination operator → latest-wins flattening strategy.',
    }),

    comparisons: ['switchMap', 'mergeAll', 'concatAll'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const inner1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const inner2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

interval(1000)
.pipe(
  take(2),
  map(i => i === 0 ? inner1$ : inner2$),
  switchAll()
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Inner Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      { label: 'Inner Observable B Interval (ms)', defaultValue: [200] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const inner1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const inner2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return interval(1000).pipe(
        take(2),
        map((i) => (i === 0 ? inner1$ : inner2$)),
        switchAll(),
        map((v) => String(v)),
      );
    },
  },
  switchMap: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Maps each source value to an inner observable, subscribing to only the latest and canceling previous inner subscriptions.',
      mentalModel:
        'A search box — each new keystroke cancels the previous search and starts a new one.',
      stepByStep: [
        'Receive value from source',
        'Map to inner observable using projection function',
        'Unsubscribe from the previous inner observable',
        'Subscribe to the new inner observable',
        'Emit its values until next source emission triggers a switch',
      ],
      timeline: `Source:  --A------B------C--|
innerA\$: --1--X(cancelled)
innerB\$:          --3--X(cancelled)
innerC\$:                  --5--6--|
Out:     1, 3, 5, 6  (only latest inner survives)`,
      keyDifferences: [
        'vs mergeMap → mergeMap keeps all inners running concurrently; switchMap cancels previous',
        'vs concatMap → concatMap queues all values; switchMap only keeps the latest',
        'vs exhaustMap → exhaustMap ignores new while busy; switchMap cancels current for new',
      ],
      useCases: [
        'Type-ahead search (cancel previous request on new input)',
        'Route parameter changes triggering API calls',
        'Auto-canceling previous HTTP requests',
      ],
      gotchas: [
        'Previous inner observable is immediately canceled',
        'Work already done by the previous inner is discarded',
        'Not suitable when every request must complete',
      ],
      categoryNote: 'Combination operator → latest-wins higher-order mapping.',
    }),

    comparisons: ['mergeMap', 'concatMap', 'exhaustMap', 'switchAll'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const innerValues = $INPUT_2_ARRAY;
const innerInterval = $INPUT_3_VALUE;

interval(sourceInterval)
  .pipe(
    take(sourceValues.length),
    switchMap((_, index) =>
      interval(innerInterval).pipe(
        take(innerValues.length),
        map(i => 'inner-' + (index + 1) + ': ' + innerValues[i])
      )
    )
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [200] },
      { label: 'Inner Values', defaultValue: [10, 20, 30] },
      { label: 'Inner Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [sourceValues, sourceIntervalArr, innerValues, innerIntervalArr] =
        inputs;

      const sourceInterval = sourceIntervalArr[0];
      const innerInterval = innerIntervalArr[0];

      return interval(sourceInterval).pipe(
        take(sourceValues.length),
        switchMap((_, index) =>
          interval(innerInterval).pipe(
            take(innerValues.length),
            map((i) => `inner-${index + 1}: ${innerValues[i]}`),
          ),
        ),
        map(String),
      );
    },
  },
  withLatestFrom: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Combines the source emission with the latest values from other observables, emitting ONLY when the source emits.',
      mentalModel:
        'A snapshot camera — takes a photo of other streams only when the shutter (source) triggers.',
      stepByStep: [
        'Subscribe to source and all other observables',
        'Wait for all others to have emitted at least once',
        'When source emits, combine with latest values from others',
        'Emit the combined result',
      ],
      timeline: `Source: --1--------2--------3--|     (@500ms intervals)
Other:  --100----200----300--|          (@400ms intervals, emits faster)
Out:      [1,100]  [2,200]  [3,300]
          ↑ Source drives timing, Other's latest value is sampled`,
      keyDifferences: [
        'vs combineLatest → combineLatest emits on ANY change; withLatestFrom only on source',
        'vs forkJoin → forkJoin waits for completion; withLatestFrom emits continuously',
        'vs zip → zip pairs by index; withLatestFrom samples latest from others',
      ],
      useCases: [
        'Button click combined with current form values',
        'Form submission enriched with latest validation state',
        'Action events combined with latest app state',
      ],
      gotchas: [
        'Source emissions BEFORE others have emitted are silently lost',
        'Only source timing drives output emission',
        'Other observables are sampled, not subscribed fresh each time',
      ],
      categoryNote:
        'Combination operator → source-driven sampling of other streams.',
    }),

    comparisons: ['combineLatest', 'zip'],
    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const otherValues = $INPUT_2_ARRAY;
const otherInterval = $INPUT_3_VALUE;

// SOURCE observable
const source$ = interval(sourceInterval).pipe(take(sourceValues.length), map(i => sourceValues[i]));

// OTHER observable
const other$ = interval(otherInterval).pipe(take(otherValues.length), map(i => otherValues[i]));

source$.pipe(
  withLatestFrom(other$)
).subscribe(([s, o]) => console.log(s, o));
`.trim(),

    inputs: [
      { label: 'Source Observable', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
      { label: 'Other Observable', defaultValue: [100, 200, 300] },
      { label: 'Other Interval (ms)', defaultValue: [400] },
    ],

    run: (inputs) => {
      const [sourceValues, sourceInterval, otherValues, otherInterval] = inputs;

      const source$ = interval(sourceInterval[0]).pipe(
        take(sourceValues.length),
        map((i) => sourceValues[i]),
      );

      const other$ = interval(otherInterval[0]).pipe(
        take(otherValues.length),
        map((i) => otherValues[i]),
      );

      return source$.pipe(
        withLatestFrom(other$),
        map(([s, o]) => `[${s}, ${o}]`),
      );
    },
  },
  zip: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Combines values from multiple observables by matching them positionally (1st with 1st, 2nd with 2nd, etc.).',
      mentalModel: 'A zipper — teeth must match up one-to-one from both sides.',
      stepByStep: [
        'Subscribe to all observables',
        'Wait for each to emit its Nth value',
        'Pair the Nth values from all sources',
        'Emit the combined tuple',
        'Wait for all to emit the (N+1)th value and repeat',
      ],
      timeline: `A: --1--------2--------3--|
B: ----10----------20---------|
Out:  [1,10]      [2,20]       [3,???] ← waits for B
     ↑ Paired by position, pace limited by slowest`,
      keyDifferences: [
        'vs combineLatest → combineLatest reuses latest values; zip requires fresh values from each',
        'vs forkJoin → forkJoin only takes final values; zip pairs every emission by index',
        'vs merge → merge interleaves without pairing; zip always pairs',
      ],
      useCases: [
        'Pairing request with its corresponding response',
        'Combining correlated data streams by position',
        'Synchronizing parallel data sources one-to-one',
      ],
      gotchas: [
        'Fastest observable waits for the slowest (pace limited)',
        'Buffered values from fast observables grow in memory',
        'If any observable never emits again, zip stalls',
      ],
      categoryNote: 'Combination operator → positional pairing of streams.',
    }),

    comparisons: ['zipAll', 'combineLatest', 'combineLatestAll', 'forkJoin'],
    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

zip(obs1$, obs2$)
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),

    inputs: [
      { label: 'Observable A', defaultValue: [1, 2, 3] },
      { label: 'Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Observable B', defaultValue: [10, 20, 30] },
      { label: 'Observable B Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const obs1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );

      const obs2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return zip(obs1$, obs2$).pipe(map(([a, b]) => `[${a}, ${b}]`));
    },
  },
  zipAll: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by applying zip to all collected inner observables after the source completes.',
      mentalModel:
        'Collect all inner channels, then pair their emissions by position like zip.',
      stepByStep: [
        'Subscribe to the source (outer) observable',
        'Collect all inner observables as they arrive',
        'Wait for the source to complete',
        'Apply zip to all collected inner observables',
        'Emit positionally paired values',
      ],
      keyDifferences: [
        'vs zip → zip takes a static list; zipAll works with dynamic inner observables',
        'vs combineLatestAll → combineLatestAll uses latest values; zipAll pairs by position',
        'vs mergeAll → mergeAll interleaves without pairing; zipAll pairs by index',
      ],
      useCases: [
        'Dynamic parallel operations needing positional pairing',
        'Coordinating a dynamic number of observables by emission index',
      ],
      gotchas: [
        'No output until the source observable completes',
        'Pace limited by the slowest inner observable',
        'All inners must emit the same count for complete pairing',
      ],
      categoryNote: 'Combination operator → higher-order variant of zip.',
    }),

    comparisons: ['zip', 'combineLatestAll', 'mergeAll'],
    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

// OUTER SOURCE
const taskStream$ = interval(aInterval).pipe(
  take(2),
  map(i =>
    // INNER OBSERVABLE
    interval(bInterval).pipe(
      take(i === 0 ? aValues.length : bValues.length),
      map(j => i === 0 ? aValues[j] : bValues[j])
    )
  )
);

taskStream$
  .pipe(zipAll())
  .subscribe(([val1, val2]) => console.log(val1, val2));
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Inner Observable A Interval (ms)', defaultValue: [1500] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      { label: 'Inner Observable B Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      // Emit observables at intervals (simulating dynamic task creation)
      return interval(aInterval[0]).pipe(
        take(2),
        map((i) =>
          interval(bInterval[0]).pipe(
            take(i === 0 ? aValues.length : bValues.length),
            map((j) => (i === 0 ? aValues[j] : bValues[j])),
          ),
        ),
        zipAll(),
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },
  buffer: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Collects source values into an array, emitting the buffered array each time a closing notifier observable emits.',
      mentalModel:
        'A bucket that collects drops — dumps its contents when someone kicks it.',
      stepByStep: [
        'Subscribe to the source and the closing notifier',
        'Collect source values into an internal buffer',
        'When the notifier emits, emit the buffer as an array',
        'Start a new empty buffer',
        'Repeat until source completes',
      ],
      timeline: `Source:   --1--2--3--4--5--6--|
Notifier: --------X--------X--|
Out:      [1,2,3]     [4,5,6]`,
      keyDifferences: [
        'vs bufferCount → bufferCount closes by count; buffer closes by signal',
        'vs bufferTime → bufferTime closes by fixed time; buffer by observable signal',
        'vs window → window emits observables instead of arrays; buffer emits arrays',
      ],
      useCases: [
        'Batching events for bulk processing',
        'Collecting clicks between intervals',
        'Grouping log entries for batch sending',
      ],
      gotchas: [
        'Empty arrays are emitted if notifier fires with no collected values',
        'If notifier never emits, values accumulate in memory indefinitely',
        'Buffer resets completely after each emission',
      ],
      categoryNote: 'Transformation operator → signal-based value batching.',
    }),

    comparisons: ['bufferCount', 'bufferTime', 'bufferWhen'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const bufferCloseInterval = $INPUT_2_VALUE;

const source$ = interval(sourceInterval).pipe(
  take(values.length),
  map(i => values[i])
);

const closing$ = interval(bufferCloseInterval);

// Collect values until closing$ emits
source$
  .pipe(buffer(closing$))
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Buffer Close Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, closeInterval] = inputs;

      const source$ = interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
      );

      const closing$ = interval(closeInterval[0]);

      return source$.pipe(
        buffer(closing$),
        map((v) => `[${v.join(', ')}]`),
      );
    },
  },
  bufferCount: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Collects source values into an array of a specified size, emitting the array when it reaches capacity.',
      mentalModel:
        'An egg carton — once all slots are filled, close it and start a new one.',
      stepByStep: [
        'Start collecting values into a buffer',
        'Count each incoming value',
        'When count reaches the specified size, emit the buffer array',
        'Reset counter and start a new buffer',
        'Repeat until source completes',
      ],
      timeline: `Source: --1--2--3--4--5--6--|
bufferCount(2):
Out:    [1,2]  [3,4]  [5,6]`,
      keyDifferences: [
        'vs buffer → buffer closes by signal; bufferCount closes by count',
        'vs bufferTime → bufferTime closes by time; bufferCount by item count',
        'vs windowCount → windowCount emits observables instead of arrays',
      ],
      useCases: [
        'Batch processing N items at a time',
        'Pagination of streaming data',
        'Chunking large data streams',
      ],
      gotchas: [
        'Last buffer may be incomplete if source completes mid-batch',
        'Optional startEvery parameter creates overlapping buffers',
        'bufferCount(1) wraps each value in a single-element array',
      ],
      categoryNote: 'Transformation operator → count-based value batching.',
    }),

    comparisons: ['buffer', 'bufferTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
.pipe(
bufferCount(count)
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
      { label: 'Buffer Size', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, count] = inputs;

      return of(...values).pipe(
        bufferCount(count[0]),
        map((v) => `[${v.join(', ')}]`),
      );
    },
  },
  bufferTime: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Collects source values into arrays during fixed time windows, emitting each array when the window closes.',
      mentalModel:
        'A train that departs every N milliseconds, carrying whatever passengers boarded.',
      stepByStep: [
        'Start a time window',
        'Collect all values emitted during the window',
        'When time elapses, emit the collected values as an array',
        'Start a new window immediately',
        'Repeat until source completes',
      ],
      timeline: `Source: --1--2-----3--4--5--------|
bufferTime(500ms):
Out:    [1,2]    [3,4,5]     []   (empty if no values in window)`,
      keyDifferences: [
        'vs bufferCount → bufferCount closes by item count; bufferTime by time',
        'vs buffer → buffer closes by observable signal; bufferTime by fixed interval',
        'vs windowTime → windowTime emits observables; bufferTime emits arrays',
      ],
      useCases: [
        'Batching real-time events for periodic UI updates',
        'Rate-limiting event processing',
        'Aggregating sensor data at fixed intervals',
      ],
      gotchas: [
        'Empty arrays are emitted if no values arrive during a window',
        'Window size is fixed regardless of emission rate',
        'Optional creation interval parameter creates overlapping windows',
      ],
      categoryNote: 'Transformation operator → time-based value batching.',
    }),

    comparisons: ['buffer', 'bufferCount'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalMs = $INPUT_1_VALUE;
const bufferMs = $INPUT_2_VALUE;

interval(intervalMs)
.pipe(
take(values.length),
map(i => values[i]),
bufferTime(bufferMs)
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Buffer Time (ms)', defaultValue: [600] },
    ],

    run: (inputs) => {
      const [values, intervalMs, bufferMs] = inputs;

      return interval(intervalMs[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        bufferTime(bufferMs[0]),
        map((v) => `[${v.join(', ')}]`),
      );
    },
  },
  bufferToggle: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Collects values into buffers that open when an opening signal emits and close when a corresponding closing signal emits.',
      mentalModel:
        'A recording button — press to start recording, press stop to get the clip.',
      stepByStep: [
        'Wait for the opening observable to emit',
        'Start a new buffer and begin collecting source values',
        'Create a closing observable for this buffer',
        'When the closing observable emits, emit the buffer as an array',
        'Multiple buffers can be active simultaneously',
      ],
      timeline: `Source: --1--2--3--4--5--6--7--|
Open:   -----O-----------O----|
Close:       ---C         ---C
Out:         [2,3]        [6,7]`,
      keyDifferences: [
        'vs buffer → buffer has a single closing signal; bufferToggle has open/close pairs',
        'vs bufferWhen → bufferWhen creates sequential non-overlapping buffers; bufferToggle can overlap',
        'vs bufferTime → bufferTime uses fixed windows; bufferToggle uses dynamic open/close signals',
      ],
      useCases: [
        'Recording user activity between interaction start and end',
        'Collecting data during active sessions only',
        'Toggle-based event capture',
      ],
      gotchas: [
        'Multiple buffers can be active simultaneously (overlapping)',
        'A new closing observable is created for each opening',
        'Opening and closing are independent signals',
      ],
      categoryNote:
        'Transformation operator → toggle-controlled value batching.',
    }),

    comparisons: ['buffer', 'bufferWhen'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const openInterval = $INPUT_2_VALUE;
const closeInterval = $INPUT_3_VALUE;

// SOURCE
const source$ = interval(sourceInterval).pipe(
  take(values.length),
  map(i => values[i])
);

// OPENING observable
const openings$ = interval(openInterval);

source$
  .pipe(
    bufferToggle(
      openings$,
      () => interval(closeInterval)
    )
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Buffer Open Interval (ms)', defaultValue: [1000] },
      { label: 'Buffer Close Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, openInterval, closeInterval] = inputs;

      const source$ = interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
      );

      const openings$ = interval(openInterval[0]);

      return source$.pipe(
        bufferToggle(openings$, () => interval(closeInterval[0])),
        map((v) => `[${v.join(', ')}]`),
      );
    },
  },
  bufferWhen: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Collects values into a buffer, closing and emitting when a dynamically created closing observable emits, then immediately opens a new buffer.',
      mentalModel:
        'An hourglass — when sand runs out, flip it and start collecting again.',
      stepByStep: [
        'Call closing selector to get a closing observable',
        'Start collecting source values into a buffer',
        'When the closing observable emits, emit the buffer as an array',
        'Call closing selector again for the next closing signal',
        'Start a new buffer immediately and repeat',
      ],
      keyDifferences: [
        'vs buffer → buffer uses a single external notifier; bufferWhen creates a new closer each time',
        'vs bufferToggle → bufferToggle has separate open/close signals and can overlap; bufferWhen is sequential',
        'vs bufferTime → bufferTime has fixed timing; bufferWhen has dynamic closing logic',
      ],
      useCases: [
        'Dynamic batch sizes based on conditions',
        'Adaptive buffering based on system load',
        'Custom throttling strategies',
      ],
      gotchas: [
        'Closing selector is called immediately to start the first buffer',
        'If closing observable never emits, values accumulate forever',
        'New buffer starts immediately after previous one closes (no gap)',
      ],
      categoryNote: 'Transformation operator → dynamic sequential buffering.',
    }),

    comparisons: ['buffer', 'bufferToggle'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const closeInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    bufferWhen(() => interval(closeInterval))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Buffer Close Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, closeInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        bufferWhen(() => interval(closeInterval[0])),
        map((v) => `[${v.join(', ')}]`),
      );
    },
  },
  expand: {
    category: 'Transformation',

    description: createOperatorDescription({
      definition:
        'Recursively projects each emitted value into a new observable, emitting results and feeding them back as input.',
      mentalModel:
        'A tree growing branches — each branch can grow more branches, expanding outward recursively.',
      stepByStep: [
        'Receive a value',
        'Project it into an inner observable via the projection function',
        'Emit inner observable values to output',
        'Feed each result back into the projection function',
        'Continue recursively until an inner returns EMPTY',
      ],
      timeline: `Source:  1
expand(v => of(v + 2)), take(5):
1 → of(3) → 3 → of(5) → 5 → of(7) → 7 → of(9) → 9  (take(5) stops)
Out:     1, 3, 5, 7, 9`,
      keyDifferences: [
        'vs mergeMap → mergeMap processes each value once; expand feeds results back recursively',
        'vs scan → scan accumulates synchronously; expand expands asynchronously via observables',
        'vs repeat → repeat re-subscribes to source; expand feeds output back as input',
      ],
      useCases: [
        'Recursive API pagination (follow next-page links)',
        'Tree traversal and graph walking',
        'Exponential backoff retry patterns',
      ],
      gotchas: [
        'Must have a termination condition (return EMPTY) or it runs forever',
        'Concurrent inner observables can grow exponentially',
        'Default concurrency is unlimited',
      ],
      categoryNote: 'Transformation operator → recursive async expansion.',
    }),

    comparisons: ['mergeMap'],

    syntax: `
const start = $INPUT_0_VALUE;
const increment = $INPUT_1_VALUE;
const takeCount = $INPUT_2_VALUE;

of(start)
.pipe(
  expand(v => of(v + increment)),
  take(takeCount)
)
.subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Start Value', defaultValue: [1] },
      { label: 'Increment By', defaultValue: [2] },
      { label: 'Take Count', defaultValue: [5] },
    ],

    run: (inputs) => {
      const [start, increment, takeCount] = inputs;

      return of(start[0]).pipe(
        expand((v) => of(v + increment[0])),
        take(takeCount[0]),
        map((v) => String(v)),
      );
    },
  },
  groupBy: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Splits a source observable into multiple grouped observables, each emitting values that share the same computed key.',
      mentalModel:
        'A mail sorter — each letter goes into a different slot based on its destination.',
      stepByStep: [
        'Receive a value from the source',
        'Compute its group key using the key selector function',
        'If key is new, create a new GroupedObservable and emit it',
        'Route the value to the matching GroupedObservable',
        'Downstream can subscribe to each group independently',
      ],
      keyDifferences: [
        'vs filter → filter selects values by condition; groupBy categorizes ALL values into separate streams',
        'vs partition → partition creates exactly 2 groups (true/false); groupBy creates any number',
        'vs window → window splits by time/count/signal; groupBy splits by computed key',
      ],
      useCases: [
        'Categorizing events by type or severity',
        'Processing orders grouped by customer',
        'Routing messages to different handlers by topic',
      ],
      gotchas: [
        'Each unique key creates a new observable that stays in memory',
        'Unsubscribed groups still accumulate values unless a duration selector is used',
        'Inner grouped observables must be subscribed to or values are lost',
      ],
      categoryNote: 'Transformation operator → key-based stream splitting.',
    }),

    comparisons: ['scan'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
.pipe(
groupBy(v => v % 2 === 0 ? 'even' : 'odd')
)
.subscribe(group => {
group.subscribe(v => console.log(group.key, v));
});
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        groupBy((v) => (v % 2 === 0 ? 'even' : 'odd')),
        mergeMap((group) => group.pipe(map((v) => group.key + ': ' + v))),
      );
    },
  },
  map: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Transforms each emitted value by applying a projection function, emitting the transformed result.',
      mentalModel:
        'A factory conveyor belt — each item passes through a machine that transforms it.',
      stepByStep: [
        'Receive a value from the source',
        'Apply the projection function to the value',
        'Emit the transformed result',
        'Repeat for each value',
      ],
      keyDifferences: [
        'vs tap → tap observes without transforming; map transforms and emits new values',
        'vs switchMap/mergeMap/concatMap → higher-order maps return observables; map returns plain values',
        'vs scan → scan accumulates state across emissions; map is stateless',
      ],
      useCases: [
        'Extracting fields from API responses (res => res.data)',
        'Converting data formats',
        'Computing derived values',
      ],
      gotchas: [
        'Projection function should be pure for predictability',
        'Does NOT flatten — returning an observable wraps it (use mergeMap instead)',
        'Executes for every emission (no filtering)',
      ],
      categoryNote: 'Transformation operator → stateless value projection.',
    }),

    comparisons: ['concatMap', 'mergeMap', 'switchMap', 'exhaustMap'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const mapValues = $INPUT_2_ARRAY;

of(...sourceValues)
  .pipe(
    map((_, index) => mapValues[index])
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [0], hide: true },
      { label: 'Mapped Values', defaultValue: [10, 20, 30] },
      { label: 'Inner Interval (ms)', defaultValue: [0], hide: true },
    ],

    run: (inputs) => {
      const [sourceValues, sourceInterval, mapValues] = inputs;

      return of(...sourceValues).pipe(
        map((_, index) => mapValues[index % mapValues.length]),
        map((value) => String(value)),
      );
    },
  },
  scan: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Applies an accumulator function over each emitted value and emits every intermediate accumulated result.',
      mentalModel:
        'A running total — each new value updates the accumulated result, and you see every update.',
      stepByStep: [
        'Initialize with the seed value (if provided)',
        'Receive a value from the source',
        'Apply the accumulator function: accumulator(currentAccumulation, value)',
        'Emit the new accumulated result',
        'Use it as the starting point for the next value',
      ],
      timeline: `Source: --1--2--3--4--|
scan((acc, v) => acc + v, 0):
Out:    --1--3--6--10-|  (running sum)`,
      keyDifferences: [
        'vs reduce → reduce emits only the final result after completion; scan emits every step',
        'vs mergeScan → mergeScan returns observables from accumulator; scan is synchronous',
        'vs map → map is stateless; scan maintains state across emissions',
      ],
      useCases: [
        'Running totals and counters',
        'State management in reactive streams',
        'Accumulating event history',
      ],
      gotchas: [
        'Emits for every source value (unlike reduce which emits once)',
        'Seed value determines the initial state and output type',
        'Without a seed, the first value is used as the initial accumulator and emitted directly (not passed through the accumulator function)',
      ],
      categoryNote: 'Transformation operator → stateful running accumulation.',
    }),

    comparisons: ['reduce'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
.pipe(
scan((acc, v) => acc + v, 0)
)
.subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        scan((acc, v) => acc + v, 0),
        map((v) => String(v)),
      );
    },
  },
  window: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Splits the source into nested observables (windows), opening a new window each time a notifier emits.',
      mentalModel:
        'Cutting a ribbon at marked points — each piece becomes its own separate stream.',
      stepByStep: [
        'Subscribe to the source and the notifier',
        'Create the first window observable',
        'Emit source values into the current window',
        'When notifier emits, complete the current window and open a new one',
        'Repeat until source completes',
      ],
      keyDifferences: [
        'vs buffer → buffer emits arrays; window emits observables (more flexible)',
        'vs windowCount → windowCount splits by count; window splits by signal',
        'vs windowTime → windowTime splits by time interval; window by arbitrary signal',
      ],
      useCases: [
        'Processing events in chunks as sub-streams',
        'Time-sensitive batching with per-window operators',
        'Complex event processing needing per-chunk logic',
      ],
      gotchas: [
        'Each window is an observable that must be subscribed to',
        'Unsubscribed windows lose their values',
        'More complex than buffer but more flexible (can apply operators per window)',
      ],
      categoryNote: 'Transformation operator → signal-based stream windowing.',
    }),

    comparisons: ['buffer'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const windowInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    window(interval(windowInterval)),
    mergeMap((win$, i) => win$.pipe(map(v => 'Window ' + (i + 1) + ': ' + v)))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Window Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, windowInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        window(interval(windowInterval[0])),
        mergeMap((win$, i) => win$.pipe(map((v) => `Window ${i + 1}: ${v}`))),
      );
    },
  },
  windowCount: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Splits the source into nested observables (windows), each containing a fixed number of values.',
      mentalModel:
        'Dealing cards — every N cards form a new hand, each hand is processed independently.',
      stepByStep: [
        'Create the first window observable',
        'Emit values into it, counting each one',
        'When count reaches N, complete the window',
        'Open a new window for the next batch',
        'Repeat until source completes',
      ],
      keyDifferences: [
        'vs bufferCount → bufferCount emits arrays; windowCount emits observables',
        'vs window → window splits by external signal; windowCount by fixed count',
        'vs take → take limits total count; windowCount creates fixed-size chunks',
      ],
      useCases: [
        'Streaming data processing in fixed-size chunks',
        'Rolling analytics per N items',
        'Chunked processing with per-chunk operators',
      ],
      gotchas: [
        'Last window may have fewer values if source completes mid-chunk',
        'Optional startEvery parameter creates overlapping windows',
        'Each window is a separate observable needing subscription',
      ],
      categoryNote: 'Transformation operator → count-based stream windowing.',
    }),

    comparisons: ['bufferCount'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    windowCount(count),
    mergeMap((win$, i) => win$.pipe(map(v => 'Window ' + (i + 1) + ': ' + v)))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Window Size', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, count] = inputs;

      return of(...values).pipe(
        windowCount(count[0]),
        mergeMap((win$, i) => win$.pipe(map((v) => `Window ${i + 1}: ${v}`))),
      );
    },
  },
  windowTime: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Splits the source into nested observables (windows) that open and close at fixed time intervals.',
      mentalModel:
        'Shift changes at a factory — every N minutes a new shift takes over.',
      stepByStep: [
        'Open the first window observable',
        'Emit source values into it',
        'When the time interval elapses, complete the window',
        'Open a new window immediately',
        'Repeat until source completes',
      ],
      keyDifferences: [
        'vs bufferTime → bufferTime emits arrays; windowTime emits observables',
        'vs windowCount → windowCount splits by count; windowTime by time',
        'vs window → window splits by external signal; windowTime by fixed interval',
      ],
      useCases: [
        'Real-time analytics per time period',
        'Streaming dashboards with time-based windows',
        'Monitoring rate of events per time interval',
      ],
      gotchas: [
        'Empty windows are emitted if no values arrive during the interval',
        'Timing is wall-clock based, independent of emission rate',
        'Each observable window needs to be subscribed to',
      ],
      categoryNote: 'Transformation operator → time-based stream windowing.',
    }),

    comparisons: ['bufferTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const windowTimeMs = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    windowTime(windowTimeMs),
    mergeMap((win$, i) => win$.pipe(map(v => 'Window ' + (i + 1) + ': ' + v)))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Window Time (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, windowTimeMs] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        windowTime(windowTimeMs[0]),
        mergeMap((win$, i) => win$.pipe(map((v) => `Window ${i + 1}: ${v}`))),
      );
    },
  },
  windowToggle: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Creates nested observable windows that open on one signal and close on another, allowing overlapping windows.',
      mentalModel:
        'Multiple recording sessions that can overlap — each starts and stops independently.',
      stepByStep: [
        'Wait for the opening signal to emit',
        'Create a new window observable',
        'Emit source values into it',
        'Create a closing observable specific to this window',
        'When closing emits, complete the window',
        'Multiple windows can be open simultaneously',
      ],
      keyDifferences: [
        'vs bufferToggle → bufferToggle emits arrays; windowToggle emits observables',
        'vs windowWhen → windowWhen creates sequential non-overlapping windows; windowToggle can overlap',
        'vs window → window uses a single notifier; windowToggle has open/close pairs',
      ],
      useCases: [
        'Complex event capture with overlapping time ranges',
        'Multi-session recording and processing',
        'Parallel windowed analysis',
      ],
      gotchas: [
        'Multiple windows can be active simultaneously',
        'Each opening creates its own independent closing signal',
        'Overlapping windows can emit the same source value to multiple windows',
      ],
      categoryNote:
        'Transformation operator → toggle-controlled stream windowing.',
    }),

    comparisons: ['bufferToggle'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const openInterval = $INPUT_2_VALUE;
const closeInterval = $INPUT_3_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    windowToggle(interval(openInterval), () => interval(closeInterval)),
    mergeMap((win$, i) => win$.pipe(map(v => 'Window ' + (i + 1) + ': ' + v)))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Window Open Interval (ms)', defaultValue: [1000] },
      { label: 'Window Close Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, openInterval, closeInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        windowToggle(interval(openInterval[0]), () =>
          interval(closeInterval[0]),
        ),
        mergeMap((win$, i) => win$.pipe(map((v) => `Window ${i + 1}: ${v}`))),
      );
    },
  },
  windowWhen: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Splits the source into sequential nested observable windows, each closing when a dynamically created closing observable emits.',
      mentalModel:
        'Chapters of a book — each chapter ends when the author decides, the next starts immediately.',
      stepByStep: [
        'Call the closing selector function to get a closing observable',
        'Create a new window observable',
        'Emit source values into it',
        'When closing observable emits, complete the window',
        'Call the closing selector again and open a new window immediately',
      ],
      keyDifferences: [
        'vs bufferWhen → bufferWhen emits arrays; windowWhen emits observables',
        'vs windowToggle → windowToggle allows overlapping; windowWhen is strictly sequential',
        'vs window → window uses a single external notifier; windowWhen creates a new closer per window',
      ],
      useCases: [
        'Adaptive windowing based on dynamic conditions',
        'Dynamic event segmentation',
        'Custom streaming batch logic with per-window closing criteria',
      ],
      gotchas: [
        'Closing selector is called immediately to create the first window',
        'Strictly sequential — no overlapping windows',
        'Each window is an observable that must be subscribed to',
      ],
      categoryNote:
        'Transformation operator → dynamic sequential stream windowing.',
    }),

    comparisons: ['bufferWhen'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const closeInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    windowWhen(() => interval(closeInterval)),
    mergeMap((win$, i) => win$.pipe(map(v => 'Window ' + (i + 1) + ': ' + v)))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Window Close Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, closeInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        windowWhen(() => interval(closeInterval[0])),
        mergeMap((win$, i) => win$.pipe(map((v) => `Window ${i + 1}: ${v}`))),
      );
    },
  },
  audit: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Ignores source values for a duration determined by another observable, then emits the most recent value when the duration completes.',
      mentalModel:
        'A bouncer who lets you peek after a cooldown — shows you only the latest person in line.',
      stepByStep: [
        'Receive a source value (triggers the duration)',
        'Start the duration observable',
        'Ignore all subsequent source values during the duration',
        'When the duration completes, emit the most recent source value',
        'Wait for the next source value to start a new cycle',
      ],
      timeline: `Source: --1--2--3--------4--5--|
audit(durationOf(300ms)):
         ↓ start          ↓ start
         |--300ms--|      |--300ms--|
Out:              3               5  (latest when duration ends)`,
      keyDifferences: [
        'vs throttle → throttle emits the FIRST value of each cycle; audit emits the LAST',
        'vs debounce → debounce resets on every new value; audit does NOT reset',
        'vs sample → sample is driven by an external signal; audit is triggered by source values',
      ],
      useCases: [
        'Rate-limiting with latest-value preference',
        'Scroll position sampling',
        'Real-time data where only the latest matters',
      ],
      gotchas: [
        'First value triggers the duration but may not be the one emitted',
        'Duration is per-cycle, not continuous',
        'No emission if source completes during an active duration',
      ],
      categoryNote:
        'Filtering operator → duration-based latest-value sampling.',
    }),

    comparisons: ['auditTime', 'throttleTime', 'debounceTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const auditDuration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    audit(() => interval(auditDuration))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Audit Duration (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, auditDuration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        audit(() => interval(auditDuration[0])),
        map((v) => String(v)),
      );
    },
  },
  auditTime: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Ignores source values for a fixed time duration, then emits the most recent value once the duration ends.',
      mentalModel:
        'Check the mailbox every N ms — you always get the latest letter regardless of how many arrived.',
      stepByStep: [
        'Receive a source value (starts the timer)',
        'Ignore all values during the timer',
        'When the timer expires, emit the most recent source value',
        'Wait for the next source value to restart the timer',
      ],
      timeline: `Source: --1--2--3--------4--5--|
auditTime(300ms):
         |--300ms--|      |--300ms--|
Out:              3               5  (latest when timer fires)`,
      keyDifferences: [
        'vs audit → audit uses an observable for duration; auditTime uses fixed time',
        'vs throttleTime → throttleTime emits first then waits; auditTime waits then emits last',
        'vs debounceTime → debounceTime resets on each new value; auditTime does not reset',
      ],
      useCases: [
        'Sampling latest resize/scroll events at intervals',
        'Rate-limiting rapidly changing data',
        'Periodic latest-value capture',
      ],
      gotchas: [
        'Timer starts on first source emission, not on subscription',
        'Uses fixed time unlike audit which uses a dynamic observable',
        'Most recent value wins, even if earlier values were different',
      ],
      categoryNote: 'Filtering operator → fixed-time latest-value sampling.',
    }),

    comparisons: ['audit', 'throttleTime', 'debounceTime', 'sampleTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const auditDuration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    auditTime(auditDuration)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Audit Duration (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, auditDuration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        auditTime(auditDuration[0]),
        map((v) => String(v)),
      );
    },
  },
  debounce: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Delays value emission until a duration observable completes. Resets the timer on each new source value.',
      mentalModel:
        'An elevator door — keeps resetting the close timer every time someone walks in.',
      stepByStep: [
        'Receive a source value',
        'Start a duration observable for this value',
        'If a new value arrives before the duration completes, cancel and restart',
        'When the duration completes undisturbed, emit the value',
      ],
      timeline: `Source: --1--2-----3------------|
debounce(durationOf(300ms)):
         ↓  ↓(reset) ↓
         X  |--300ms--|--300ms--|
Out:                  2        3  (emitted after silence)`,
      keyDifferences: [
        'vs debounceTime → debounceTime uses fixed time; debounce uses an observable',
        'vs audit → audit does NOT reset on new values; debounce resets every time',
        'vs throttle → throttle emits immediately then blocks; debounce waits for silence',
      ],
      useCases: [
        'Dynamic debouncing based on value content',
        'Adaptive input delay (shorter for numbers, longer for text)',
        'Custom silence detection logic',
      ],
      gotchas: [
        'Only the last value in a rapid burst survives',
        'Duration observable is created fresh for each value',
        'If source completes, the last pending value is still emitted',
      ],
      categoryNote:
        'Filtering operator → observable-based adaptive debouncing.',
    }),

    comparisons: ['debounceTime', 'audit', 'throttleTime', 'sampleTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const debounceDuration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    debounce(() => interval(debounceDuration))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Debounce Duration (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, debounceDuration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        debounce(() => interval(debounceDuration[0])),
        map((v) => String(v)),
      );
    },
  },
  debounceTime: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Delays value emission by a fixed time, resetting the timer on each new value — emits only when the source is silent for the full duration.',
      mentalModel:
        'A search box — wait until the user stops typing for N ms before searching.',
      stepByStep: [
        'Receive a source value',
        'Start a timer for the specified duration',
        'If a new value arrives before the timer expires, cancel and restart with the new value',
        'When the timer completes undisturbed, emit the value',
      ],
      timeline: `Source: --h--he--hel--hello------------|
debounceTime(300ms):
                              |--300ms--|
Out:                                   hello  (after 300ms of silence)`,
      keyDifferences: [
        'vs debounce → debounce uses an observable for dynamic duration; debounceTime uses fixed time',
        'vs throttleTime → throttleTime emits first and blocks; debounceTime waits for silence',
        'vs auditTime → auditTime does not reset on new values; debounceTime resets each time',
      ],
      useCases: [
        'Search-as-you-type input delay',
        'Window resize handler debouncing',
        'Form validation delay',
      ],
      gotchas: [
        'Rapid continuous emissions may never trigger output if there is no pause',
        'Last value before source completion is always emitted',
        'Very short durations may not effectively prevent rapid fires',
      ],
      categoryNote: 'Filtering operator → fixed-time debouncing.',
    }),

    comparisons: ['debounce', 'auditTime', 'throttleTime', 'sampleTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const debounceDuration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    debounceTime(debounceDuration)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Debounce Duration (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, debounceDuration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        debounceTime(debounceDuration[0]),
        map((v) => String(v)),
      );
    },
  },
  distinct: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Emits only values that have NEVER been seen before, filtering out all duplicates across the entire stream lifetime.',
      mentalModel:
        'A guest list — only new names get through; anyone who already visited is turned away.',
      stepByStep: [
        'Receive a value from the source',
        'Check if it has been seen before (tracked in an internal Set)',
        'If new, emit it and add to the seen set',
        'If duplicate, skip silently',
      ],
      keyDifferences: [
        'vs distinctUntilChanged → distinctUntilChanged only compares with the immediately previous value; distinct remembers ALL',
        'vs distinctUntilKeyChanged → distinctUntilKeyChanged compares by a specific key; distinct compares whole values',
        'vs filter → filter uses a predicate function; distinct tracks history for deduplication',
      ],
      useCases: [
        'Ensuring unique event processing across a stream',
        'Deduplicating a stream of IDs',
        'First-time-only notifications',
      ],
      gotchas: [
        'Internal Set grows indefinitely, consuming memory',
        'Optional key selector for comparing complex objects',
        'Optional flush observable can clear the internal set periodically',
      ],
      categoryNote: 'Filtering operator → global duplicate elimination.',
    }),

    comparisons: ['distinctUntilChanged'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    distinct()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 2, 3, 1, 4] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        distinct(),
        map((v) => String(v)),
      );
    },
  },
  distinctUntilChanged: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Emits values only when the current value is different from the immediately previous value.',
      mentalModel:
        '"Are we there yet?" detector — only speaks up when the answer changes.',
      stepByStep: [
        'Receive a value',
        'Compare it with the previous value',
        'If different, emit and store as the new previous',
        'If same, skip silently',
      ],
      timeline: `Source: --1--1--2--2--3--1--|
Out:    --1-----2-----3--1--|  (consecutive duplicates removed)`,
      keyDifferences: [
        'vs distinct → distinct remembers ALL previous values forever; distinctUntilChanged only remembers the last',
        'vs distinctUntilKeyChanged → distinctUntilKeyChanged compares by a specific key; distinctUntilChanged compares whole values',
        'vs filter → filter uses a predicate; distinctUntilChanged uses comparison with previous',
      ],
      useCases: [
        'Avoiding unnecessary re-renders on identical state',
        'Reducing duplicate consecutive API calls',
        'State change detection in reactive streams',
      ],
      gotchas: [
        'Uses === comparison by default (reference equality for objects)',
        'Custom comparator function can be provided for deep comparison',
        'First value always emits (there is no previous to compare with)',
      ],
      categoryNote: 'Filtering operator → consecutive duplicate elimination.',
    }),

    comparisons: ['distinct'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    distinctUntilChanged()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 1, 2, 2, 3, 1] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        distinctUntilChanged(),
        map((v) => String(v)),
      );
    },
  },
  distinctUntilKeyChanged: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        "Emits values only when a specific property (key) differs from the previous value's same property.",
      mentalModel:
        'distinctUntilChanged for a single field — ignores changes in other properties.',
      stepByStep: [
        'Receive a value (typically an object)',
        'Extract the specified key/property from the value',
        'Compare it with the same key from the previous value',
        'If the key value changed, emit the full object',
        'If the key value is the same, skip',
      ],
      keyDifferences: [
        'vs distinctUntilChanged → distinctUntilChanged compares the entire value; distinctUntilKeyChanged compares only one key',
        'vs distinct → distinct remembers all values globally; distinctUntilKeyChanged only compares consecutive',
        'vs filter → filter uses an arbitrary condition; distinctUntilKeyChanged tracks key-based changes',
      ],
      useCases: [
        'Filtering state changes by a specific property (e.g., status field)',
        'Reacting only when a relevant field changes',
        'Optimizing renders based on a specific data field',
      ],
      gotchas: [
        'Only the specified key is compared, not the whole object',
        'Other properties can change without triggering an emission',
        'Custom comparator available for the key value comparison',
      ],
      categoryNote:
        'Filtering operator → key-based consecutive duplicate elimination.',
    }),

    comparisons: ['distinct', 'distinctUntilChanged'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    distinctUntilKeyChanged('id')
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      {
        label: 'Source Values',
        defaultValue: [
          '{"id":1}',
          '{"id":1}',
          '{"id":2}',
          '{"id":2}',
          '{"id":3}',
        ],
        type: 'object',
      },
    ],

    run: (inputs) => {
      const [values] = inputs;

      const parsed = values.map((v) => {
        try {
          return JSON.parse(v);
        } catch {
          return { id: v };
        }
      });

      return of(...parsed).pipe(
        distinctUntilKeyChanged('id'),
        map((v) => JSON.stringify(v)),
      );
    },
  },
  elementAt: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Emits only the value at a specified index position from the source, then completes immediately.',
      mentalModel:
        'Array bracket notation for streams — picks the exact Nth item.',
      stepByStep: [
        'Count emissions starting from index 0',
        'When the count matches the specified index, emit that value',
        'Complete immediately',
        'If source completes before reaching the index, emit default or throw error',
      ],
      keyDifferences: [
        'vs first → first always takes index 0; elementAt takes any index',
        'vs last → last waits for completion and takes the final value; elementAt picks by position',
        'vs take → take emits the first N values; elementAt emits a single value at a specific index',
      ],
      useCases: [
        'Extracting a specific positional value from a known sequence',
        'Getting the Nth result from a stream',
        'Selecting a specific emission by order',
      ],
      gotchas: [
        'Uses zero-based indexing',
        'Throws ArgumentOutOfRangeError if index is out of range (unless default provided)',
        'Completes immediately after emitting the single value',
      ],
      categoryNote: 'Filtering operator → positional value selection.',
    }),

    comparisons: ['first', 'last', 'take'],

    syntax: `
const values = $INPUT_0_ARRAY;
const index = $INPUT_1_VALUE;

of(...values)
  .pipe(
    elementAt(index)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [10, 20, 30, 40] },
      { label: 'Index', defaultValue: [1] },
    ],

    run: (inputs) => {
      const [values, indexArr] = inputs;

      const index = Number(indexArr[0]);

      return of(...values).pipe(
        elementAt(index),
        map((v) => String(v)),
        catchError((err) => of('❌ Index out of range')),
      );
    },
  },
  filter: {
    category: 'Filtering',
    description: createOperatorDescription({
      definition:
        'Emits only values from the source that satisfy a specified predicate function.',
      mentalModel:
        'A sieve — only items matching the condition pass through; the rest are discarded.',
      stepByStep: [
        'Receive a value from the source',
        'Apply the predicate function to it',
        'If predicate returns true, emit the value',
        'If predicate returns false, skip the value',
        'Continue for all source emissions',
      ],
      timeline: `Source: --1--2--3--4--5--6--|
filter(x => x % 2 === 0):
Out:    -----2-----4-----6--|  (only even numbers pass)`,
      keyDifferences: [
        'vs find → find takes only the FIRST match then completes; filter emits ALL matches',
        'vs takeWhile → takeWhile stops entirely on first failure; filter skips non-matches and continues',
        'vs skipWhile → skipWhile starts emitting after first failure; filter checks every value',
      ],
      useCases: [
        'Filtering even/odd numbers',
        'Selecting valid API responses',
        'Removing null/undefined values from a stream',
      ],
      gotchas: [
        'Predicate runs for every emission (no short-circuiting)',
        'Stateless between calls — no memory of previous values',
        'Does not transform values, only selects or rejects them',
      ],
      categoryNote: 'Filtering operator → predicate-based value selection.',
    }),

    comparisons: ['takeWhile', 'skipWhile', 'distinct'],

    syntax: `
const values = $INPUT_0_ARRAY;
const filterType = "$INPUT_1_VALUE";
const compareValue = $INPUT_2_VALUE;

of(...values)
  .pipe(
    filter(v => {
      if (filterType === 'even') return v % 2 === 0;
      if (filterType === 'odd') return v % 2 !== 0;
      if (filterType === 'greaterThan') return v > compareValue;
      if (filterType === 'lessThan') return v < compareValue;
      return true;
    })
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
      {
        label: 'Filter Type',
        defaultValue: ['even'], // even | odd | greaterThan | lessThan
        options: [
          { label: 'Odd Numbers', value: 'odd' },
          { label: 'Even Numbers', value: 'even' },
          { label: 'Greater Than', value: 'greaterThan' },
          { label: 'Less Than', value: 'lessThan' },
        ],
        type: 'select',
      },
      {
        label: 'Compare Value (for greaterThan or lessThan)',
        defaultValue: [3],
      },
    ],

    run: (inputs) => {
      const [values, filterTypeArr, compareArr] = inputs;

      const filterType = filterTypeArr[0];
      const compareValue = compareArr[0];

      let predicate: (v: number) => boolean;

      if (filterType === 'even') {
        predicate = (v: number) => v % 2 === 0;
      } else if (filterType === 'odd') {
        predicate = (v: number) => v % 2 !== 0;
      } else if (filterType === 'greaterThan') {
        predicate = (v: number) => v > compareValue;
      } else if (filterType === 'lessThan') {
        predicate = (v: number) => v < compareValue;
      } else {
        predicate = () => true;
      }

      return of(...values).pipe(
        filter(predicate),
        map((v) => String(v)),
        catchError((err) => of('❌ Invalid filter type')),
      );
    },
  },
  find: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits the FIRST value that satisfies a predicate, then immediately completes — like Array.find() for streams.',
      mentalModel:
        'Looking for your keys — stop searching the moment you find them.',
      stepByStep: [
        'Receive a value from the source',
        'Apply the predicate function',
        'If true, emit the value and complete immediately',
        'If false, continue to the next value',
        'If source completes without a match, emit undefined',
      ],
      keyDifferences: [
        'vs filter → filter emits ALL matching values and continues; find emits only the first match',
        'vs first → first errors (EmptyError) if no match; find emits undefined on no match',
        'vs single → single errors if more than one match; find just takes the first match',
      ],
      useCases: [
        'Finding the first matching item in a stream',
        'Early-exit search on condition met',
        'Locating a specific event in an event stream',
      ],
      gotchas: [
        'Completes immediately after the first match',
        'Emits undefined if no match is found (does not error)',
        'Unsubscribes from source after finding a match',
      ],
      categoryNote: 'Filtering operator → first-match value selection.',
    }),

    comparisons: ['filter', 'first'],

    syntax: `
const values = $INPUT_0_ARRAY;
const valueToFind = $INPUT_1_VALUE;

of(...values)
  .pipe(
    find(v => v === valueToFind)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Value to Find', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, findArr] = inputs;

      const valueToFind = Number(findArr[0]);

      return of(...values).pipe(
        find((v) => v === valueToFind),
        map((v) => (v !== undefined ? String(v) : 'Not found')),
      );
    },
  },
  findIndex: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits the zero-based INDEX of the first value satisfying a predicate, then completes — like Array.findIndex() for streams.',
      mentalModel:
        'Array.findIndex() for streams — tells you WHERE the match is, not what it is.',
      stepByStep: [
        'Count emissions starting from index 0',
        'Apply the predicate to each value',
        'If true, emit the current index and complete immediately',
        'If false, increment the index and continue',
        'If no match found, emit -1 on source completion',
      ],
      keyDifferences: [
        'vs find → find emits the value itself; findIndex emits the numeric position',
        'vs elementAt → elementAt picks a value at a known index; findIndex finds the index of a match',
        'vs filter → filter emits all matching values; findIndex emits the index of the first match only',
      ],
      useCases: [
        'Finding the position of the first error in a sequence',
        'Locating a specific event in a stream by position',
        'Index-based processing decisions',
      ],
      gotchas: [
        'Uses zero-based indexing',
        'Returns -1 if no match is found',
        'Completes immediately after finding a match',
      ],
      categoryNote: 'Filtering operator → first-match index selection.',
    }),

    comparisons: ['find', 'filter'],

    syntax: `
const values = $INPUT_0_ARRAY;
const valueToFind = $INPUT_1_VALUE;

of(...values)
  .pipe(
    findIndex(v => v == valueToFind)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Value to Find', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, findArr] = inputs;

      const valueToFind = findArr[0];

      return of(...values).pipe(
        findIndex((v) => v == valueToFind),
        map((index) =>
          index !== -1 ? `📍 Index: ${index}` : '❌ Not found (-1)',
        ),
      );
    },
  },
  first: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits only the FIRST value from the source (or first matching a predicate), then completes.',
      mentalModel:
        '"Tell me the first one and stop" — grab the first item off the conveyor belt.',
      stepByStep: [
        'Subscribe to the source',
        'If no predicate: emit the very first value and complete',
        'If predicate provided: check each value until one matches',
        'Emit the matching value and complete',
        'If source completes without a match, throw EmptyError',
      ],
      keyDifferences: [
        'vs take(1) → take(1) does not error on empty source; first throws EmptyError',
        'vs find → find returns undefined on no match; first throws an error',
        'vs last → last waits for completion and takes the final value; first takes the first',
      ],
      useCases: [
        'Getting the initial value from a stream',
        'First matching event detection',
        'Quick one-time sampling of a stream',
      ],
      gotchas: [
        'Throws EmptyError if source completes without emitting',
        'With predicate, errors if no value matches',
        'Use the defaultValue parameter to prevent errors on empty',
      ],
      categoryNote: 'Filtering operator → first-value extraction.',
    }),

    comparisons: ['take', 'find'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    first()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        first(),
        map((v) => `🎯 First: ${v}`),
        catchError(() => of('❌ No values (EmptyError)')),
      );
    },
  },
  ignoreElements: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Ignores ALL emitted values from the source, only passing through the completion or error signal.',
      mentalModel:
        'Earplugs — blocks all noise, only tells you when the concert is over or something breaks.',
      stepByStep: [
        'Subscribe to the source observable',
        'Discard every emitted value',
        'Wait for completion or error',
        'Pass through only the completion or error signal',
      ],
      keyDifferences: [
        'vs filter(() => false) → functionally equivalent but ignoreElements is more readable and intentional',
        'vs last → last emits the final value; ignoreElements emits nothing at all',
        'vs tap → tap observes without blocking values; ignoreElements blocks all values',
      ],
      useCases: [
        'Waiting for side-effect-only operations to complete',
        'Error detection without caring about the values',
        'Synchronizing on completion timing',
      ],
      gotchas: [
        'No values are EVER emitted to subscribers',
        'Useful only for completion/error signal handling',
        'Often combined with endWith() to emit a final notification',
      ],
      categoryNote: 'Filtering operator → value suppression.',
    }),

    comparisons: ['filter', 'tap'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    ignoreElements()
  )
  .subscribe({
    next: console.log,
    complete: () => console.log('Completed')
  });
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        ignoreElements(),
        // Since no values come, we emit completion message manually
        map(() => '❌ This will never run'),
        endWith('✅ Completed (no values emitted)'),
      );
    },
  },
  last: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits only the LAST value from the source after it completes (or last matching a predicate).',
      mentalModel:
        '"Wait until the end, then tell me the final one" — check the score after the game ends.',
      stepByStep: [
        'Subscribe to the source',
        'Track the most recent value (or most recent matching predicate)',
        'Wait for the source to complete',
        'Emit the last tracked value',
        'If no values were emitted, throw EmptyError',
      ],
      keyDifferences: [
        'vs first → first takes the first value immediately; last waits for completion',
        'vs takeLast(1) → functionally equivalent but takeLast does not error on empty',
        'vs reduce → reduce requires an accumulator function; last simply takes the final value',
      ],
      useCases: [
        'Getting the final result of a process',
        'Last value before a connection closes',
        'Final state snapshot after a sequence',
      ],
      gotchas: [
        'Throws EmptyError if source completes without emitting',
        'Waits for completion — infinite streams never produce a value',
        'With predicate, errors if no value matches',
      ],
      categoryNote: 'Filtering operator → last-value extraction.',
    }),

    comparisons: ['first', 'takeLast'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    last()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        last(),
        map((v) => `🏁 Last: ${v}`),
        catchError(() => of('❌ No values (EmptyError)')),
      );
    },
  },
  sample: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits the most recent value from the source ONLY when a separate notifier observable emits.',
      mentalModel:
        'A photographer — takes a snapshot of the latest value only when told to shoot.',
      stepByStep: [
        'Subscribe to the source and the notifier',
        'Store the latest source value',
        'When the notifier emits, emit the latest stored value',
        'If no new value exists since the last sample, skip',
      ],
      timeline: `Source:   --1--2--3--------4--5--|
Notifier: --------X--------X-----|
Out:               3        4     (latest value at notifier time)`,
      keyDifferences: [
        'vs sampleTime → sampleTime uses a fixed interval; sample uses an observable trigger',
        'vs withLatestFrom → withLatestFrom combines values; sample just takes the latest source value',
        'vs audit → audit is triggered by source values; sample is triggered by an external notifier',
      ],
      useCases: [
        'Sampling data on user interaction (click to capture current value)',
        'Periodic state snapshots driven by external events',
        'Throttling a fast producer with a slower consumer signal',
      ],
      gotchas: [
        'No emission if source has not emitted since the last sample',
        'Notifier drives the timing completely',
        'Values are discarded if no notifier fires before the next source value',
      ],
      categoryNote: 'Filtering operator → signal-triggered value sampling.',
    }),

    comparisons: ['sampleTime', 'auditTime', 'throttleTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const triggerInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    sample(interval(triggerInterval))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Trigger Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, triggerInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        sample(interval(triggerInterval[0])),
        map((v) => String(v)),
      );
    },
  },
  sampleTime: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits the most recent value from the source at fixed time intervals.',
      mentalModel:
        'A clock reporter — checks and reports the latest value every N milliseconds.',
      stepByStep: [
        'Start a periodic timer based on the specified interval',
        'On each tick, check if a new source value exists',
        'If yes, emit the latest source value',
        'If no new value since the last tick, skip',
      ],
      timeline: `Source: --1--2--3--------4--5--|
sampleTime(500ms):
        |--500ms--|--500ms--|--500ms--|
Out:              3         4     5`,
      keyDifferences: [
        'vs sample → sample uses an observable trigger; sampleTime uses a fixed clock interval',
        'vs auditTime → auditTime is triggered by source values; sampleTime runs on a fixed clock',
        'vs throttleTime → throttleTime emits the first value then blocks; sampleTime emits the latest periodically',
      ],
      useCases: [
        'Regular polling of the latest state value',
        'Dashboard updates at fixed intervals',
        'Display refresh rate limiting',
      ],
      gotchas: [
        'Timer runs independently of source emissions',
        'Skips a tick if no new value arrived since the last tick',
        'More regular output cadence than throttle or debounce',
      ],
      categoryNote: 'Filtering operator → periodic value sampling.',
    }),

    comparisons: ['sample', 'auditTime', 'throttleTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const sampleInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    sampleTime(sampleInterval)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Sample Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, sampleInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        sampleTime(sampleInterval[0]),
        map((v) => String(v)),
      );
    },
  },
  single: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits the one and only value matching a predicate. Errors if zero or more than one value matches.',
      mentalModel:
        'A strict bouncer — exactly one guest expected; too few or too many is an error.',
      stepByStep: [
        'Subscribe to the source',
        'Check each value against the predicate',
        'Track matching values',
        'If exactly one match: emit it and complete',
        'If zero or multiple matches: throw an error',
      ],
      keyDifferences: [
        'vs first → first takes the first match and ignores the rest; single ERRORS if there are multiple',
        'vs find → find takes the first match without error; single enforces uniqueness',
        'vs filter → filter emits ALL matches; single asserts exactly one',
      ],
      useCases: [
        'Asserting exactly one result from a query',
        'Validating a unique item in a stream',
        'Strict single-response expectations',
      ],
      gotchas: [
        'Errors on empty source (no values at all)',
        'Errors if more than one value matches the predicate',
        'Waits for source completion to verify that only one matched',
      ],
      categoryNote: 'Filtering operator → strict single-value assertion.',
    }),

    comparisons: ['find', 'first'],

    syntax: `
const values = $INPUT_0_ARRAY;
const valueToFind = $INPUT_1_VALUE;

of(...values)
  .pipe(
    single(v => v == valueToFind)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Value to Find', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, findArr] = inputs;

      const valueToFind = findArr[0];

      return of(...values).pipe(
        single((v) => v == valueToFind),
        map((v) => `✅ Single: ${v}`),
        catchError(() => of('❌ Must have exactly one matching value')),
      );
    },
  },
  skip: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Skips the first N values from the source, then emits all remaining values.',
      mentalModel: 'Fast-forward — skip the first N tracks on an album.',
      stepByStep: [
        'Count incoming emissions starting from 0',
        'While count < N, discard the value',
        'After N values have been skipped, emit all subsequent values',
        'Continue until source completes',
      ],
      timeline: `Source: --1--2--3--4--5--|
skip(2):
Out:    ----------3--4--5--|  (first 2 skipped)`,
      keyDifferences: [
        'vs skipWhile → skipWhile skips by condition; skip by count',
        'vs skipUntil → skipUntil skips until an external signal; skip by count',
        'vs take → take emits the first N and stops; skip removes the first N and continues',
      ],
      useCases: [
        'Ignoring initial setup/warmup emissions',
        'Skipping stale cached values',
        'Removing header rows from a data stream',
      ],
      gotchas: [
        'If source emits fewer than N values, nothing is emitted',
        'Skipped values are permanently discarded',
        'skip(0) passes everything through unchanged',
      ],
      categoryNote: 'Filtering operator → count-based prefix skipping.',
    }),

    comparisons: ['skipWhile', 'take', 'takeLast'],

    syntax: `
const values = $INPUT_0_ARRAY;
const skipCount = $INPUT_1_VALUE;

of(...values)
  .pipe(
    skip(skipCount)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Skip Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;

      const skipCount = Number(countArr[0]);

      return of(...values).pipe(
        skip(skipCount),
        map((v) => String(v)),
      );
    },
  },
  skipLast: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Omits the last N values from the source, emitting everything except the final N values.',
      mentalModel:
        'A delay buffer — holds N items back, releasing only when new ones push them out.',
      stepByStep: [
        'Buffer each incoming value',
        'Once the buffer exceeds N items, emit the oldest buffered value',
        'Continue buffering new values and releasing old ones',
        'On source completion, discard the remaining N buffered values',
      ],
      timeline: `Source: --1--2--3--4--5--|
skipLast(2):
Out:    ----------1--2--3--|  (last 2 values: 4, 5 are discarded)`,
      keyDifferences: [
        'vs takeLast → takeLast emits only the last N; skipLast excludes the last N',
        'vs skip → skip removes the first N; skipLast removes the last N',
        'vs take → take keeps the first N; skipLast keeps everything except the last N',
      ],
      useCases: [
        'Removing trailing summary values',
        'Ignoring final cleanup emissions',
        'Processing all but the last N items in a sequence',
      ],
      gotchas: [
        'Must buffer N values before any emission starts (adds delay)',
        'Source must complete to know which are the "last" values',
        'All emissions are delayed by N values',
      ],
      categoryNote: 'Filtering operator → count-based suffix skipping.',
    }),

    comparisons: ['skip', 'takeLast'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    skipLast(count)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Skip Last Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;
      const count = Number(countArr[0]);

      return of(...values).pipe(
        skipLast(count),
        map((v) => String(v)),
      );
    },
  },
  skipUntil: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Skips all values from the source until a notifier observable emits, then emits all subsequent values.',
      mentalModel:
        'A traffic light — nothing passes until the green light (notifier) turns on.',
      stepByStep: [
        'Subscribe to the source and the notifier',
        'Discard all source values until the notifier emits',
        'After notifier emits, start passing through all source values',
        'Continue until source completes',
      ],
      timeline: `Source:   --1--2--3--4--5--|
Notifier: ---------X-------|
Out:      ------------4--5--|  (values before notifier are skipped)`,
      keyDifferences: [
        'vs skipWhile → skipWhile uses a predicate condition; skipUntil uses a signal',
        'vs takeUntil → takeUntil STOPS on signal; skipUntil STARTS on signal',
        'vs skip → skip uses a fixed count; skipUntil uses a signal',
      ],
      useCases: [
        'Waiting for initialization before processing events',
        'Gating data until user authentication completes',
        'Synchronizing stream start with an external event',
      ],
      gotchas: [
        'All values before the notifier signal are permanently lost',
        'Notifier only needs to emit once — subsequent emissions are ignored',
        'If notifier never emits, no values pass through ever',
      ],
      categoryNote: 'Filtering operator → signal-gated value passing.',
    }),

    comparisons: ['skipWhile', 'takeUntil'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const triggerInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    skipUntil(interval(triggerInterval))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Trigger Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, triggerInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        skipUntil(interval(triggerInterval[0])),
        map((v) => String(v)),
      );
    },
  },
  skipWhile: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Skips values while a predicate returns true, then emits ALL subsequent values regardless of the predicate.',
      mentalModel:
        'A gate that opens permanently — stays closed while the condition holds, opens forever once it fails.',
      stepByStep: [
        'Receive a value and check the predicate',
        'While predicate returns true, skip the value',
        'On the first false, start emitting',
        'All subsequent values pass through WITHOUT re-checking the predicate',
      ],
      timeline: `Source: --1--2--3--4--1--2--|
skipWhile(x => x < 3):
Out:    --------3--4--1--2--|  (after 3 passes, ALL values emitted even 1 and 2)`,
      keyDifferences: [
        'vs filter → filter checks EVERY value; skipWhile only checks until the first failure',
        'vs skipUntil → skipUntil uses an external signal; skipWhile uses a predicate',
        'vs takeWhile → takeWhile STOPS on failure; skipWhile STARTS on failure',
      ],
      useCases: [
        'Skipping initial zero or null values',
        'Waiting for a stream to reach a valid state',
        'Ignoring warmup emissions',
      ],
      gotchas: [
        'Once the predicate fails, ALL subsequent values pass unchecked',
        'Predicate is NEVER re-evaluated after the first failure',
        'If predicate never fails, the entire stream is empty',
      ],
      categoryNote: 'Filtering operator → predicate-gated prefix skipping.',
    }),

    comparisons: ['filter', 'skip', 'takeWhile'],

    syntax: `
const values = $INPUT_0_ARRAY;
const threshold = $INPUT_1_VALUE;

of(...values)
  .pipe(
    skipWhile(v => v < threshold)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 1, 2] },
      { label: 'Threshold Value', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, thresholdArr] = inputs;
      const threshold = thresholdArr[0];

      return of(...values).pipe(
        skipWhile((v) => v < threshold),
        map((v) => String(v)),
      );
    },
  },
  take: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits only the first N values from the source, then completes immediately.',
      mentalModel:
        '"Give me the first N and stop" — take items off the top of a stack.',
      stepByStep: [
        'Count emissions starting from 0',
        'Emit each value',
        'When count reaches N, complete and unsubscribe from source',
      ],
      timeline: `Source: --1--2--3--4--5--|
take(3):
Out:    --1--2--3|  (complete after 3)`,
      keyDifferences: [
        'vs first → first emits one value and errors on empty; take(1) does not error',
        'vs takeLast → takeLast emits the last N after completion; take emits the first N immediately',
        'vs takeWhile → takeWhile uses a condition; take uses a fixed count',
      ],
      useCases: [
        'Limiting infinite streams to a specific count',
        'Taking the first N API results',
        'Quick sampling of a stream',
      ],
      gotchas: [
        'Completes and unsubscribes after N values',
        'Does NOT error if source has fewer than N values',
        'take(0) completes immediately without subscribing',
      ],
      categoryNote: 'Filtering operator → count-based prefix selection.',
    }),

    comparisons: ['skip', 'first', 'takeWhile'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    take(count)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Take Count', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;

      const count = Number(countArr[0]);

      return of(...values).pipe(
        take(count),
        map((v) => String(v)),
      );
    },
  },
  takeLast: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits only the last N values from the source after it completes.',
      mentalModel:
        '"Tell me the final N results after everything is done" — last few frames of a movie.',
      stepByStep: [
        'Subscribe to the source',
        'Buffer values, keeping only the most recent N',
        'Wait for the source to complete',
        'Emit all N buffered values in order',
        'Complete',
      ],
      timeline: `Source: --1--2--3--4--5--|
takeLast(2):
Out:    -----------------4--5|  (emits last 2 after completion)`,
      keyDifferences: [
        'vs last → last emits only the very last value; takeLast emits the last N',
        'vs skipLast → skipLast removes the last N; takeLast keeps only the last N',
        'vs take → take emits the first N immediately; takeLast waits for completion',
      ],
      useCases: [
        'Getting the most recent N items from a completed stream',
        'Processing final results of a computation',
        'Last N log entries',
      ],
      gotchas: [
        'Nothing emits until the source completes',
        'Must buffer N values in memory while waiting',
        'Not suitable for infinite streams — they never complete',
      ],
      categoryNote: 'Filtering operator → completion-based suffix selection.',
    }),

    comparisons: ['take', 'skipLast'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    takeLast(count)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Take Last Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;
      const count = Number(countArr[0]);

      return of(...values).pipe(
        takeLast(count),
        map((v) => String(v)),
      );
    },
  },
  takeUntil: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits values from the source until a notifier observable emits, then completes immediately.',
      mentalModel:
        'A countdown timer — everything runs until the alarm goes off, then it stops.',
      stepByStep: [
        'Subscribe to the source and the notifier',
        'Emit source values normally',
        'When the notifier emits, complete immediately',
        'Unsubscribe from the source',
      ],
      timeline: `Source:   --1--2--3--4--5--|
Notifier: -----------X------|
Out:      --1--2--3|  (complete when notifier fires)`,
      keyDifferences: [
        'vs takeWhile → takeWhile uses a predicate condition; takeUntil uses an external signal',
        'vs skipUntil → skipUntil STARTS on signal; takeUntil STOPS on signal',
        'vs take → take uses a fixed count; takeUntil uses a signal',
      ],
      useCases: [
        'Component destruction cleanup (ngOnDestroy pattern)',
        'Canceling operations on user action',
        'Time-based or event-based stream termination',
      ],
      gotchas: [
        'Should be the LAST operator in pipe to properly unsubscribe from upstream',
        'The notifier emission value does not matter — only the timing',
        'Source is unsubscribed immediately when notifier fires',
      ],
      categoryNote: 'Filtering operator → signal-based stream termination.',
    }),

    comparisons: ['skipUntil', 'takeWhile'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const triggerInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    takeUntil(interval(triggerInterval))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Trigger Interval (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, triggerInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        takeUntil(interval(triggerInterval[0])),
        map((v) => String(v)),
      );
    },
  },
  takeWhile: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits values while a predicate returns true, then completes on the first false value.',
      mentalModel:
        'A conveyor belt that stops the moment a defective item appears.',
      stepByStep: [
        'Receive a value from the source',
        'Apply the predicate function',
        'If true, emit the value',
        'If false, complete immediately and unsubscribe',
      ],
      timeline: `Source: --1--2--3--4--1--|
takeWhile(x => x < 3):
Out:    --1--2|  (stops at first x >= 3, stream ends)`,
      keyDifferences: [
        'vs filter → filter skips non-matching but continues; takeWhile stops entirely',
        'vs skipWhile → skipWhile starts on first failure; takeWhile stops on first failure',
        'vs takeUntil → takeUntil uses an external signal; takeWhile uses a predicate',
      ],
      useCases: [
        'Reading values until a threshold is exceeded',
        'Processing a stream while data is valid',
        'Consuming values until an end-of-sequence marker',
      ],
      gotchas: [
        'Optional inclusive parameter includes the failing value in the output',
        'Once stopped, the stream cannot resume',
        'Predicate failure causes immediate completion and unsubscribe',
      ],
      categoryNote: 'Filtering operator → predicate-based stream termination.',
    }),

    comparisons: ['skipWhile', 'take'],

    syntax: `
const values = $INPUT_0_ARRAY;
const threshold = $INPUT_1_VALUE;

of(...values)
  .pipe(
    takeWhile(v => v < threshold)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 1] },
      { label: 'Threshold Value', defaultValue: [3] },
    ],

    run: (inputs) => {
      const [values, thresholdArr] = inputs;
      const threshold = thresholdArr[0];

      return of(...values).pipe(
        takeWhile((v) => v < threshold),
        map((v) => String(v)),
      );
    },
  },
  throttle: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits a value immediately, then ignores subsequent source values for a duration determined by another observable.',
      mentalModel:
        'A bouncer with a cooldown — lets one person in, then blocks the door until the cooldown ends.',
      stepByStep: [
        'Receive a source value and emit it immediately',
        'Start the duration observable',
        'Ignore all source values while the duration is active',
        'When the duration completes, accept the next source value',
        'Repeat the cycle',
      ],
      timeline: `Source: --1--2--3--------4--5--|
throttle(durationOf(400ms)):
Out:    --1--------------4-----|  (2,3 ignored during cooldown, 5 ignored)`,
      keyDifferences: [
        'vs throttleTime → throttleTime uses fixed duration; throttle uses an observable',
        'vs debounce → debounce waits for silence and emits last; throttle emits first immediately',
        'vs audit → audit emits the LAST value after duration; throttle emits the FIRST',
      ],
      useCases: [
        'Rate-limiting with dynamic cooldown intervals',
        'Scroll handling with variable throttle duration',
        'Adaptive throttling based on system load',
      ],
      gotchas: [
        'Emits the FIRST value of each cycle (leading edge by default)',
        'Subsequent values during the cooldown are permanently lost',
        'Duration observable is recreated for each cycle',
        'Configurable leading/trailing edge behavior via config object (default: leading=true, trailing=false)',
      ],
      categoryNote: 'Filtering operator → observable-based rate limiting.',
    }),

    comparisons: ['throttleTime', 'auditTime', 'debounceTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const duration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    throttle(() => interval(duration))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Throttle Duration (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, duration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        throttle(() => interval(duration[0])),
        map((v) => String(v)),
      );
    },
  },
  throttleTime: {
    category: 'Filtering',

    description: createOperatorDescription({
      definition:
        'Emits a value immediately, then ignores subsequent source values for a fixed time duration.',
      mentalModel:
        'A rate limiter — allow one action per N milliseconds, ignore the rest.',
      stepByStep: [
        'Receive a source value and emit it immediately',
        'Start a timer for the specified duration',
        'Ignore all source values during the timer',
        'When the timer expires, accept the next source value',
        'Repeat the cycle',
      ],
      timeline: `Source: --1--2--3--------4--5--|
throttleTime(400ms):
         |--400ms--|      |--400ms--|
Out:    --1--------------4--------|  (2,3,5 throttled)`,
      keyDifferences: [
        'vs throttle → throttle uses an observable for duration; throttleTime uses fixed time',
        'vs debounceTime → debounceTime waits for silence; throttleTime emits immediately',
        'vs auditTime → auditTime emits the last value after duration; throttleTime emits the first',
      ],
      useCases: [
        'Button click rate limiting',
        'Scroll and resize event throttling',
        'API call rate limiting',
      ],
      gotchas: [
        'Leading edge by default (emits the first value immediately)',
        'Configurable leading/trailing edge behavior via config object',
        'Fixed interval regardless of emission frequency',
      ],
      categoryNote: 'Filtering operator → fixed-time rate limiting.',
    }),

    comparisons: ['throttle', 'auditTime', 'debounceTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const duration = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    throttleTime(duration)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Throttle Time (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, duration] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        throttleTime(duration[0]),
        map((v) => String(v)),
      );
    },
  },
  tap: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Performs side effects for each emission without modifying the values passing through.',
      mentalModel:
        'A security camera — observes everything passing by without touching or changing anything.',
      stepByStep: [
        'Receive a value from the source',
        'Execute the side-effect function (e.g., logging)',
        'Pass the original value through unchanged',
        'Continue for all emissions',
      ],
      keyDifferences: [
        'vs map → map transforms values and emits new ones; tap passes values unchanged',
        'vs finalize → finalize runs once on completion/error; tap runs for every emission',
        'vs subscribe → subscribe is the terminal handler; tap is used mid-pipe for side effects',
      ],
      useCases: [
        'Logging and debugging emissions',
        'DOM manipulation side effects',
        'Analytics event tracking',
        'Setting loading flags in a pipe chain',
      ],
      gotchas: [
        'Should NOT modify values — keep side effects pure',
        'Errors thrown inside tap propagate to the stream',
        'Can accept next/error/complete handlers like subscribe',
      ],
      categoryNote: 'Utility operator → transparent side-effect execution.',
    }),

    comparisons: ['map', 'filter'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    tap(v => console.log('Value:', v))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        tap((v) => console.log('🔍 Tap:', v)),
        map((v) => String(v)), // pass unchanged
      );
    },
  },
  delay: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Delays each emitted value from the source by a fixed amount of time.',
      mentalModel:
        'A conveyor belt with a fixed-length tunnel — everything enters and exits in the same order, just later.',
      stepByStep: [
        'Receive a value from the source',
        'Hold it for the specified delay duration',
        'After the delay, emit the value',
        'Repeat for each value, preserving original emission order',
      ],
      timeline: `Source: --1--2--3--|
delay(300ms):
Out:    -----1--2--3--|  (each value shifted by 300ms)`,
      keyDifferences: [
        'vs delayWhen → delayWhen uses a per-value observable for dynamic delays; delay uses fixed time',
        'vs debounceTime → debounceTime can suppress values; delay emits everything',
        'vs timer → timer delays the subscription start; delay delays each value individually',
      ],
      useCases: [
        'Simulating network latency in development',
        'Staggering UI animations',
        'Adding intentional pauses between operations',
      ],
      gotchas: [
        'ALL values are delayed by the same fixed amount',
        'Order is always preserved',
        'Delay does not skip or filter any values',
      ],
      categoryNote: 'Utility operator → fixed-time value delay.',
    }),

    comparisons: ['delayWhen', 'debounceTime'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const delayTime = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    delay(delayTime)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Delay Time (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, delayTime] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        delay(delayTime[0]),
        map((v) => String(v)),
      );
    },
  },
  delayWhen: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Delays each value emission by a duration determined by a per-value observable.',
      mentalModel:
        'An airport runway — each plane gets its own clearance time before takeoff.',
      stepByStep: [
        'Receive a value from the source',
        'Call the delay duration selector function with the value',
        'Subscribe to the returned duration observable',
        'When the duration observable emits, emit the original value',
        'Repeat for each source value',
      ],
      timeline: `Source: --A--B--C--|
delayWhen(v => timer(v.delay)):
A.delay=100, B.delay=500, C.delay=200
Out:    ---A----C--------B--|  (order may change based on per-value delays)`,
      keyDifferences: [
        'vs delay → delay uses a fixed time for all values; delayWhen is per-value and dynamic',
        'vs concatMap → concatMap transforms values; delayWhen only delays without transforming',
        'vs debounce → debounce can suppress values; delayWhen emits all values',
      ],
      useCases: [
        'Variable-latency simulation',
        'Priority-based emission ordering',
        'Per-item conditional delays based on value',
      ],
      gotchas: [
        'Duration observables are created per value',
        'Only the FIRST emission from the duration observable triggers the delay',
        'Values can arrive out of order if their delays differ',
      ],
      categoryNote: 'Utility operator → dynamic per-value delay.',
    }),

    comparisons: ['delay', 'sample', 'throttle'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    delayWhen(v => interval(v * 200))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [values, sourceInterval] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        delayWhen((v) => interval(v * 200)),
        map((v) => String(v)),
      );
    },
  },
  finalize: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Executes a callback function when the observable completes, errors, or is unsubscribed — like a finally block.',
      mentalModel:
        'A finally block in try/catch — cleanup code that runs no matter what happens.',
      stepByStep: [
        'Subscribe to the source',
        'Pass all values through normally',
        'On complete, error, or unsubscribe, execute the finalize callback',
        'Propagate the original signal (completion or error)',
      ],
      keyDifferences: [
        'vs tap → tap runs per emission; finalize runs once at the end',
        'vs catchError → catchError handles errors by replacing the stream; finalize just runs cleanup',
        'vs endWith → endWith emits a value at completion; finalize runs a side effect',
      ],
      useCases: [
        'Closing connections and releasing resources',
        'Resetting a loading spinner after async operation',
        'Releasing locks or authentication tokens',
        'Logging completion/error events',
      ],
      gotchas: [
        'Runs on complete, error, AND unsubscribe',
        'Does NOT modify the stream or swallow errors',
        'Cannot change completion or error behavior — purely for side effects',
      ],
      categoryNote: 'Utility operator → lifecycle cleanup handler.',
    }),

    comparisons: ['tap', 'catchError'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    finalize(() => console.log('✅ Finalize: Stream ended'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return new Observable((observer) => {
        of(...values)
          .pipe(
            map((v) => String(v)),
            finalize(() => {
              observer.next('✅ Finalize: Stream ended');
              observer.complete();
            }),
          )
          .subscribe({
            next: (v) => observer.next(v),
            error: (err) => observer.error(err),
          });
      });
    },
  },
  repeat: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Re-subscribes to the source observable a specified number of times after it completes.',
      mentalModel:
        'A playlist on repeat — when the last song ends, start from the first song again.',
      stepByStep: [
        'Subscribe to the source observable',
        'Emit all values',
        'On completion, re-subscribe to the source',
        'Repeat the specified number of times',
        'After all repeats, complete',
      ],
      timeline: `Source: --1--2--3--| (repeat(2))
Out:    --1--2--3--1--2--3--|  (replayed 2 times total)`,
      keyDifferences: [
        'vs retry → retry re-subscribes on ERROR; repeat re-subscribes on COMPLETION',
        'vs expand → expand feeds values back recursively; repeat replays the entire source',
        'vs interval → interval emits continuously; repeat replays finite sources',
      ],
      useCases: [
        'Polling APIs at intervals (combined with delay)',
        'Repeating animations in a loop',
        'Cycling through a known sequence',
      ],
      gotchas: [
        'Only re-subscribes on completion, NOT on error',
        'Infinite repeat if no count is specified',
        'Often combined with delay to add pauses between repeats',
      ],
      categoryNote: 'Utility operator → completion-based re-subscription.',
    }),

    comparisons: ['repeatWhen', 'retry'],

    syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    repeat(count)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Repeat Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;
      const count = Number(countArr[0]);

      return of(...values).pipe(
        repeat(count),
        map((v) => String(v)),
      );
    },
  },
  timeout: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Throws a TimeoutError if the source does not emit a value within a specified time.',
      mentalModel:
        'A deadline — if nothing happens before the clock runs out, you get an error.',
      stepByStep: [
        'Start a timer upon subscription',
        'If a value is emitted before the timer expires, emit it and restart the timer',
        'If the timer expires before the next value, throw TimeoutError',
        'Unsubscribe from the source',
      ],
      timeline: `Source: --1-----------X (no value for 500ms)
timeout(500ms):
Out:    --1-----------#  (TimeoutError thrown)`,
      keyDifferences: [
        'vs timeoutWith → timeoutWith switches to a fallback observable; timeout throws an error',
        'vs race → race picks the fastest from initial subscription; timeout monitors ongoing silence',
        'vs debounceTime → debounceTime filters values; timeout errors on slow source',
      ],
      useCases: [
        'API call timeout enforcement',
        'User activity / inactivity detection',
        'Ensuring responsive data streams',
      ],
      gotchas: [
        'TimeoutError kills the stream unless caught with catchError',
        'Timer resets on each emission',
        'Can configure separate first-value timeout and between-value timeout',
      ],
      categoryNote: 'Utility operator → time-based error enforcement.',
    }),

    comparisons: ['timeoutWith', 'delay'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const timeoutLimit = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    timeout(timeoutLimit)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
      { label: 'Timeout (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, timeoutArr] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        timeout(timeoutArr[0]),
        map((v) => String(v)),
        catchError(() => of('❌ Timeout Error')),
      );
    },
  },
  timeoutWith: {
    category: 'Utility & Side Effects',
    deprecated: 'Use timeout({ each: ms, with: () => fallback$ }) instead.',

    description: createOperatorDescription({
      definition:
        'Switches to a fallback observable if the source does not emit within a specified time, instead of throwing an error.',
      mentalModel:
        'A backup plan — if the main source is too slow, switch to plan B seamlessly.',
      stepByStep: [
        'Start a timer upon subscription',
        'If a value is emitted before the timer expires, emit it and restart',
        'If the timer expires, unsubscribe from the source',
        'Subscribe to the fallback observable and emit its values',
      ],
      timeline: `Source:   --1-----------X (timeout after 500ms)
Fallback: default_value
Out:      --1-----------default_value|  (switched to fallback)`,
      keyDifferences: [
        'vs timeout → timeout throws an error; timeoutWith provides a graceful fallback',
        'vs race → race picks the fastest from the start; timeoutWith switches after a timeout',
        'vs catchError → catchError handles errors; timeoutWith handles silence',
      ],
      useCases: [
        'Fallback data source when primary API is slow',
        'Default values when network is unreliable',
        'Graceful degradation on connection issues',
      ],
      gotchas: [
        'Switches permanently to the fallback (no return to the original source)',
        'Fallback observable should provide meaningful default data',
        'Timer resets on each source emission before switch',
        'Deprecated in RxJS 7+ — use timeout({ each: duration, with: () => fallback$ }) instead',
      ],
      categoryNote: 'Utility operator → time-based fallback switching.',
    }),

    comparisons: ['timeout', 'catchError'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const timeoutLimit = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    timeoutWith(timeoutLimit, of('Fallback A', 'Fallback B'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
      { label: 'Timeout (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [values, sourceInterval, timeoutArr] = inputs;

      return interval(sourceInterval[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        timeoutWith(timeoutArr[0], of('Fallback A', 'Fallback B')),
        map((v) => String(v)),
      );
    },
  },
  toArray: {
    category: 'Utility & Side Effects',

    description: createOperatorDescription({
      definition:
        'Collects ALL emitted values and emits them as a single array when the source completes.',
      mentalModel:
        'A shopping bag — collect all items first, then hand over the full bag at checkout.',
      stepByStep: [
        'Subscribe to the source',
        'Accumulate all emitted values in an internal array',
        'Wait for the source to complete',
        'Emit the entire array as a single value',
        'Complete',
      ],
      keyDifferences: [
        'vs reduce → reduce applies a custom accumulator function; toArray simply collects',
        'vs buffer → buffer emits multiple arrays based on signals; toArray emits one array at the end',
        'vs scan → scan emits running accumulation; toArray emits only the final complete array',
      ],
      useCases: [
        'Converting a stream to an array for batch processing',
        'Collecting all results before rendering',
        'Converting an observable to a Promise-friendly single emission',
      ],
      gotchas: [
        'Source MUST complete or the array is never emitted',
        'Entire stream is buffered in memory',
        'Not suitable for infinite streams',
      ],
      categoryNote: 'Utility operator → stream-to-array collection.',
    }),

    comparisons: ['reduce', 'scan'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    toArray()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        toArray(),
        map((arr) => JSON.stringify(arr)),
      );
    },
  },
  catchError: {
    category: 'Error Handling',

    description: createOperatorDescription({
      definition:
        'Catches errors from the source observable and replaces the errored stream with a fallback observable or value.',
      mentalModel:
        'A safety net — if the trapeze artist falls, catch them and put on a backup act.',
      stepByStep: [
        'Subscribe to the source',
        'Pass values through normally',
        'If an error occurs, intercept it',
        'Call the error handler function to get a fallback observable',
        'Subscribe to the fallback and emit its values',
      ],
      keyDifferences: [
        'vs retry → retry re-subscribes to the same source on error; catchError switches to a fallback',
        'vs throwIfEmpty → throwIfEmpty creates errors; catchError handles them',
        'vs finalize → finalize runs cleanup code; catchError provides recovery logic',
      ],
      useCases: [
        'HTTP error recovery with default/cached data',
        'Showing graceful error messages to users',
        'Fallback to cache when network fails',
        'Logging errors while providing default values',
      ],
      gotchas: [
        'The original source stream is terminated on error',
        'Returning the source observable inside catchError retries (can cause infinite loops)',
        'Can re-throw the error to propagate it downstream',
      ],
      categoryNote: 'Error Handling operator → error recovery with fallback.',
    }),

    comparisons: ['retry', 'timeoutWith'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    map(v => {
      if (v === 'error') throw new Error('Error');
      return v;
    }),
    catchError(() => of('Fallback'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      {
        label: 'Source Values (use "error")',
        defaultValue: [1, 2, 'error', 3],
      },
    ],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        map((v) => {
          if (v === 'error') throw new Error('Error');
          return String(v);
        }),
        catchError(() => of('⚠️ Fallback value')),
      );
    },
  },
  retry: {
    category: 'Error Handling',

    description: createOperatorDescription({
      definition:
        'Re-subscribes to the source observable when an error occurs, retrying the failed operation.',
      mentalModel:
        '"Try again" — if something fails, automatically retry from scratch.',
      stepByStep: [
        'Subscribe to the source',
        'Emit values normally',
        'If an error occurs, re-subscribe from the beginning',
        'Repeat up to the configured retry count',
        'After the final attempt fails, propagate the error',
      ],
      timeline: `Source: --1--2--#(error)  retry(2)
Initial:   --1--2--#
Retry 1:   --1--2--#
Retry 2:   --1--2--#
Out:       --1--2--1--2--1--2--❌ Final Error  (3 attempts total: 1 initial + 2 retries)`,
      keyDifferences: [
        'vs catchError → catchError switches to a fallback; retry re-attempts the same source',
        'vs repeat → repeat re-subscribes on success; retry re-subscribes on error',
        'vs retryWhen → retryWhen provides custom retry logic with delays; retry is simpler',
      ],
      useCases: [
        'Retrying failed HTTP requests',
        'Network resilience for flaky connections',
        'Transient error recovery',
      ],
      gotchas: [
        'Each retry starts from scratch (full re-subscription)',
        'Infinite retries without a count can loop forever',
        'Side effects in the source execute again on each retry',
      ],
      categoryNote: 'Error Handling operator → automatic error retry.',
    }),

    comparisons: ['retryWhen', 'repeat'],

    syntax: `
const values = $INPUT_0_ARRAY;
const retryCount = $INPUT_1_VALUE;

of(...values)
  .pipe(
    map(v => {
      if (v === 'error') throw new Error('Error');
      return v;
    }),
    retry(retryCount),
    catchError(() => of('❌ Final Error after retries'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      {
        label: 'Source Values (use "error" to simulate)',
        defaultValue: [1, 2, 'error'],
      },
      { label: 'Retry Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, retryArr] = inputs;
      const retryCount = Number(retryArr[0]);

      return of(...values).pipe(
        map((v) => {
          if (v === 'error') throw new Error('Error');
          return String(v);
        }),
        retry(retryCount),
        catchError(() => of('❌ Final Error after retries')),
      );
    },
  },
  throwIfEmpty: {
    category: 'Error Handling',

    description: createOperatorDescription({
      definition:
        'Throws an error if the source observable completes without emitting any values.',
      mentalModel:
        'A strict validator — if the box is empty, raise an alarm; otherwise pass through.',
      stepByStep: [
        'Subscribe to the source',
        'Track whether any value has been emitted',
        'If the source completes and no values were emitted, throw an error',
        'If at least one value was emitted, complete normally',
      ],
      keyDifferences: [
        'vs defaultIfEmpty → defaultIfEmpty provides a fallback value; throwIfEmpty throws an error',
        'vs first → first errors on empty but also extracts the first value; throwIfEmpty only guards emptiness',
        'vs isEmpty → isEmpty checks and reports emptiness as boolean; throwIfEmpty enforces non-emptiness with error',
      ],
      useCases: [
        'Validating required data exists in a query',
        'Asserting API returns at least one result',
        'Guarding against empty filter results',
      ],
      gotchas: [
        'Only errors on completely empty source (zero emissions)',
        'Custom error factory function is optional (defaults to EmptyError)',
        'All values pass through unchanged if at least one exists',
      ],
      categoryNote: 'Error Handling operator → empty-stream error enforcement.',
    }),

    comparisons: ['defaultIfEmpty', 'first'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    throwIfEmpty(() => new Error('Empty stream'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        throwIfEmpty(() => new Error('Empty stream')),
        map((v) => String(v)),
        catchError(() => of('❌ Error: Empty stream')),
      );
    },
  },
  share: {
    category: 'Multicasting & Sharing',

    description: createOperatorDescription({
      definition:
        'Shares a single execution of the source observable among multiple subscribers, multicasting values in real-time.',
      mentalModel:
        'A live TV broadcast — one signal, many viewers, all seeing the same thing simultaneously.',
      stepByStep: [
        'First subscriber triggers the source subscription',
        'Emit values to all current subscribers',
        'Late subscribers miss past emissions',
        'When all subscribers leave, unsubscribe from the source',
        'Next new subscriber triggers a fresh source subscription',
      ],
      keyDifferences: [
        'vs shareReplay → shareReplay replays past values to late subscribers; share does not',
        'vs connectable → connectable requires manual connect(); share auto-connects',
        'vs Subject → share wraps source with a refCounted Subject automatically',
      ],
      useCases: [
        'Sharing expensive HTTP calls among multiple consumers',
        'Multicasting WebSocket messages',
        'Preventing duplicate side effects from multiple subscriptions',
      ],
      gotchas: [
        'Late subscribers miss all past values',
        'Source re-subscribes when a new subscriber appears after all others left',
        'Not suitable when replay of past values is needed',
      ],
      categoryNote: 'Multicasting operator → live shared execution.',
    }),

    comparisons: ['shareReplay'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;

const source$ = interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    share()
  );

source$.subscribe(a => console.log('A:', a));

setTimeout(() => {
  source$.subscribe(b => console.log('B:', b));
}, intervalTime * 2);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, intervalArr] = inputs;
      const intervalTime = intervalArr[0];

      const source$ = interval(intervalTime).pipe(
        take(values.length),
        map((i) => values[i]),
        share(),
      );

      return new Observable((observer) => {
        // Subscriber A (starts immediately)
        source$.subscribe((v) => observer.next(`A → ${v}`));

        // Subscriber B (joins late)
        setTimeout(() => {
          source$.subscribe((v) => observer.next(`B → ${v}`));
        }, intervalTime * 2);
      });
    },
  },
  shareReplay: {
    category: 'Multicasting & Sharing',

    description: createOperatorDescription({
      definition:
        'Shares a single source execution AND replays a specified number of previous emissions to new subscribers.',
      mentalModel:
        'A DVR recording — live viewers and late arrivals can both watch from a buffer.',
      stepByStep: [
        'First subscriber triggers the source subscription',
        'Emit values to all subscribers',
        'Buffer the last N values',
        'Late subscribers immediately receive the buffered values',
        'Then continue receiving live values',
      ],
      keyDifferences: [
        'vs share → share does not replay past values; shareReplay provides a replay buffer',
        'vs ReplaySubject → shareReplay wraps with a ReplaySubject internally',
        'vs connectable → connectable needs manual connect; shareReplay is automatic',
      ],
      useCases: [
        'Caching HTTP responses for multiple components',
        'Sharing and replaying latest app state',
        'Config/settings that multiple parts of the app need',
      ],
      gotchas: [
        'Replay buffer persists in memory even after all subscribers leave',
        'refCount option controls whether source resets or persists',
        'Large buffer size means large memory usage',
      ],
      categoryNote:
        'Multicasting operator → cached shared execution with replay.',
    }),

    comparisons: ['share'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;
const bufferSize = $INPUT_2_VALUE;
const subscriberDelay = $INPUT_3_VALUE;

const source$ = interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    shareReplay(bufferSize)
  );

source$.subscribe(a => console.log('A:', a));

setTimeout(() => {
  source$.subscribe(b => console.log('B:', b));
}, subscriberDelay);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Interval (ms)', defaultValue: [500] },
      { label: 'Replay Buffer Size', defaultValue: [2] },
      { label: 'Subscriber Delay (ms)', defaultValue: [1000] },
    ],

    run: (inputs) => {
      const [values, intervalArr, bufferArr, delayArr] = inputs;

      const intervalTime = intervalArr[0];
      const bufferSize = bufferArr[0];
      const delayTime = delayArr[0];

      const source$ = interval(intervalTime).pipe(
        take(values.length),
        map((i) => values[i]),
        shareReplay(bufferSize),
      );

      return new Observable((observer) => {
        // Subscriber A (immediate)
        source$.subscribe((v) => observer.next(`A → ${v}`));

        // Subscriber B (late)
        setTimeout(() => {
          source$.subscribe((v) => observer.next(`B → ${v}`));
        }, delayTime);
      });
    },
  },
  connect: {
    category: 'Multicasting & Sharing',

    description: createOperatorDescription({
      definition:
        'Creates a shared observable with custom control over how the source is multicast, using a connector function.',
      mentalModel:
        'A mixing board — you control exactly how the shared signal is split and processed.',
      stepByStep: [
        'Call the connector function with the shared source observable',
        'Inside the connector, apply custom operators or splitting logic',
        'Return the shaped observable from the connector',
        'Sharing and subscription management is handled automatically',
      ],
      keyDifferences: [
        'vs share → share has no customization; connect allows custom multicast logic',
        'vs connectable → connectable needs manual connect(); connect uses a selector function',
        'vs shareReplay → shareReplay only adds replay; connect allows arbitrary custom logic',
      ],
      useCases: [
        'Custom multicast with different operator chains per consumer',
        'Combining a shared source in complex ways',
        'Advanced multicasting patterns',
      ],
      gotchas: [
        'Connector function receives the shared source observable',
        'Must return an observable from the connector function',
        'More advanced than share/shareReplay — use only when needed',
      ],
      categoryNote: 'Multicasting operator → custom multicast control.',
    }),

    comparisons: ['connectable', 'share'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;

interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    connect(shared$ => merge(
      shared$.pipe(map(v => 'A: ' + v)),
      shared$.pipe(map(v => 'B: ' + v))
    ))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, intervalArr] = inputs;
      const intervalTime = intervalArr[0];

      return interval(intervalTime).pipe(
        take(values.length),
        map((i) => values[i]),
        connect((shared$) =>
          merge(
            shared$.pipe(map((v) => `A → ${v}`)),
            shared$.pipe(map((v) => `B → ${v}`)),
          ),
        ),
      );
    },
  },
  connectable: {
    category: 'Multicasting & Sharing',

    description: createOperatorDescription({
      definition:
        'Creates a connectable observable that does NOT emit until connect() is manually called.',
      mentalModel:
        'A stage play — actors wait in position until the director says "action!".',
      stepByStep: [
        'Create a connectable observable from the source',
        'Subscribers attach (but no emissions yet)',
        'Call connect() to start the source subscription',
        'All attached subscribers begin receiving values',
        'Manage the connection lifecycle manually',
      ],
      keyDifferences: [
        'vs share → share auto-connects on first subscription; connectable requires manual connect()',
        'vs connect → connect uses a selector function; connectable uses manual control',
        'vs Subject → Subject is a simpler manual multicast; connectable wraps a source',
      ],
      useCases: [
        'Synchronizing multiple subscribers before starting emissions',
        'Manual control over expensive operation timing',
        'Hot observable creation with controlled start',
      ],
      gotchas: [
        'Must call connect() manually or nothing happens',
        'Subscribers attached before connect() are valid and will receive values',
        'Connection must be managed manually (unsubscribe from the connect() return)',
      ],
      categoryNote:
        'Multicasting operator → manually controlled shared execution.',
    }),

    comparisons: ['connect', 'share'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;

const source$ = connectable(
  interval(intervalTime).pipe(
    take(values.length),
    map(i => values[i])
  )
);

source$.subscribe(a => console.log('A:', a));
source$.subscribe(b => console.log('B:', b));

source$.connect();
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
      { label: 'Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, intervalArr] = inputs;
      const intervalTime = intervalArr[0];

      const source$ = connectable(
        interval(intervalTime).pipe(
          take(values.length),
          map((i) => values[i]),
        ),
      );

      return new Observable((observer) => {
        source$.subscribe((v) => observer.next(`A → ${v}`));
        source$.subscribe((v) => observer.next(`B → ${v}`));

        setTimeout(() => {
          source$.connect();
        }, intervalTime);
      });
    },
  },
  count: {
    category: 'Aggregation',

    description: createOperatorDescription({
      definition:
        'Counts how many values the source emits (optionally matching a predicate) and emits the total after completion.',
      mentalModel:
        'A turnstile counter — counts everyone who passes through and reports the total when done.',
      stepByStep: [
        'Subscribe to the source',
        'Increment a counter on each value (or each matching the predicate)',
        'Wait for the source to complete',
        'Emit the total count as a single value',
        'Complete',
      ],
      keyDifferences: [
        'vs reduce → reduce applies a custom accumulator; count is a specialized counter',
        'vs toArray → toArray collects values; count just counts them (more memory efficient)',
        'vs scan → scan emits running count; count emits only the final total',
      ],
      useCases: [
        'Counting total events or matches',
        'Measuring stream length',
        'Validating expected emission count',
      ],
      gotchas: [
        'Source must complete for the count to be emitted',
        'Returns 0 for empty source or no predicate matches',
        'Predicate is optional — counts all emissions if omitted',
      ],
      categoryNote: 'Aggregate operator → emission counting.',
    }),

    comparisons: ['toArray', 'reduce'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    count()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        count(),
        map((v) => `🔢 Count: ${v}`),
      );
    },
  },
  max: {
    category: 'Aggregation',

    description: createOperatorDescription({
      definition:
        'Emits the maximum (largest) value from the source after it completes.',
      mentalModel:
        'A high score board — tracks all scores and announces the winner at the end.',
      stepByStep: [
        'Subscribe to the source',
        'Track the maximum value seen so far',
        'When the source completes, emit the maximum value',
        'Complete',
      ],
      keyDifferences: [
        'vs min → min finds the smallest value; max finds the largest',
        'vs reduce → reduce is a general-purpose accumulator; max is specialized for maximum',
        'vs last → last takes the final value regardless of magnitude; max takes the largest',
      ],
      useCases: [
        'Finding the highest value in a dataset',
        'Peak detection in sensor readings',
        'Maximum price/score calculation',
      ],
      gotchas: [
        'Source must complete before the max is emitted',
        'Optional comparer function for custom comparison logic',
        'Works with numbers by default',
      ],
      categoryNote: 'Aggregate operator → maximum value selection.',
    }),

    comparisons: ['min', 'reduce'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    max()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 5, 3, 9, 2] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        max(),
        map((v) => `🔝 Max: ${v}`),
        defaultIfEmpty('No values'),
      );
    },
  },
  min: {
    category: 'Aggregation',

    description: createOperatorDescription({
      definition:
        'Emits the minimum (smallest) value from the source after it completes.',
      mentalModel:
        'A bargain finder — tracks all prices and announces the cheapest at the end.',
      stepByStep: [
        'Subscribe to the source',
        'Track the minimum value seen so far',
        'When the source completes, emit the minimum value',
        'Complete',
      ],
      keyDifferences: [
        'vs max → max finds the largest value; min finds the smallest',
        'vs reduce → reduce is a general-purpose accumulator; min is specialized for minimum',
        'vs first → first takes the first value regardless; min takes the smallest',
      ],
      useCases: [
        'Finding the lowest value in a dataset',
        'Minimum latency detection',
        'Cheapest price calculation',
      ],
      gotchas: [
        'Source must complete before the min is emitted',
        'Optional comparer function for custom comparison logic',
        'Works with numbers by default',
      ],
      categoryNote: 'Aggregate operator → minimum value selection.',
    }),

    comparisons: ['max', 'reduce'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    min()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [7, 2, 5, 1, 9] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        min(),
        map((v) => `🔽 Min: ${v}`),
        defaultIfEmpty('No values'),
      );
    },
  },
  reduce: {
    category: 'Aggregation',

    description: createOperatorDescription({
      definition:
        'Applies an accumulator function to all source values and emits only the single final accumulated result after completion.',
      mentalModel:
        'Array.reduce() for streams — process everything and give me one final answer.',
      stepByStep: [
        'Initialize with the seed value (if provided)',
        'Receive each value from the source',
        'Apply the accumulator function: accumulator(currentValue, sourceValue)',
        'Store the result',
        'On source completion, emit the final accumulated result',
      ],
      keyDifferences: [
        'vs scan → scan emits every intermediate result; reduce emits only the final value',
        'vs count → count is a specialized reducer for counting; reduce is general-purpose',
        'vs toArray → toArray collects values; reduce transforms them with a custom accumulator',
      ],
      useCases: [
        'Summing all values in a stream',
        'Computing final statistics from data',
        'Accumulating complex final state',
      ],
      gotchas: [
        'Source must complete for the result to be emitted',
        'Without a seed, uses the first value as the initial accumulator',
        'Only ONE value is ever emitted',
      ],
      categoryNote: 'Aggregate operator → final accumulated result.',
    }),

    comparisons: ['scan', 'count', 'toArray'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    reduce((acc, curr) => acc + curr, 0)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3, 4] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        reduce((acc, curr) => acc + Number(curr), 0),
        map((v) => `🧮 Result: ${v}`),
      );
    },
  },
  every: {
    category: 'Conditional & Boolean',

    description: createOperatorDescription({
      definition:
        'Checks whether ALL values from the source satisfy a predicate, emitting true or false.',
      mentalModel:
        'A quality inspector — checks every item on the line and reports pass/fail for the whole batch.',
      stepByStep: [
        'Receive each value from the source',
        'Apply the predicate',
        'If any value fails (false): emit false immediately and complete',
        'If all values pass: wait for completion, then emit true',
      ],
      keyDifferences: [
        'vs filter → filter selects matching values; every tests ALL values and returns a boolean',
        'vs find → find locates the first match; every checks if all match',
        'vs isEmpty → isEmpty checks for any values at all; every checks a condition on all values',
      ],
      useCases: [
        'Validating that all items meet criteria',
        'Form-wide validation checks',
        'Data quality assertion',
      ],
      gotchas: [
        'Short-circuits on the first failure (emits false immediately)',
        'Empty source emits true (vacuous truth)',
        'Source must complete for a true result',
      ],
      categoryNote:
        'Conditional & Boolean operator → universal predicate check.',
    }),

    comparisons: ['find', 'filter'],

    syntax: `
const values = $INPUT_0_ARRAY;
const threshold = $INPUT_1_VALUE;

of(...values)
  .pipe(
    every(v => v > threshold)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [2, 4, 6, 8] },
      { label: 'Threshold Value', defaultValue: [1] },
    ],

    run: (inputs) => {
      const [values, thresholdArr] = inputs;
      const threshold = Number(thresholdArr[0]);

      return of(...values).pipe(
        every((v) => v > threshold),
        map((v) => `✅ All match: ${v}`),
      );
    },
  },
  isEmpty: {
    category: 'Conditional & Boolean',

    description: createOperatorDescription({
      definition:
        'Emits true if the source completes without emitting any value, or false if any value is emitted.',
      mentalModel: '"Is the box empty?" — peek inside and report.',
      stepByStep: [
        'Subscribe to the source',
        'If any value is emitted, emit false and complete immediately',
        'If the source completes without any values, emit true',
      ],
      keyDifferences: [
        'vs throwIfEmpty → throwIfEmpty errors on empty; isEmpty reports a boolean',
        'vs defaultIfEmpty → defaultIfEmpty provides a fallback value; isEmpty reports emptiness',
        'vs count → count returns 0 for empty; isEmpty returns a boolean true/false',
      ],
      useCases: [
        'Checking if a query returned results',
        'Conditional logic based on stream emptiness',
        'API response validation',
      ],
      gotchas: [
        'Emits false immediately on the first value (short-circuits)',
        'Source must complete for a true result',
        'Does not pass through any source values',
      ],
      categoryNote: 'Conditional & Boolean operator → emptiness check.',
    }),

    comparisons: ['defaultIfEmpty', 'every'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    isEmpty()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        isEmpty(),
        map((v) => `📭 Is Empty: ${v}`),
      );
    },
  },
  defaultIfEmpty: {
    category: 'Conditional & Boolean',

    description: createOperatorDescription({
      definition:
        'Emits a specified default value if the source completes without emitting any values.',
      mentalModel:
        'A backup plan — if the cupboard is bare, use the emergency supplies.',
      stepByStep: [
        'Subscribe to the source',
        'If any value is emitted, pass it through normally',
        'If the source completes without emitting any values, emit the default value',
        'Complete',
      ],
      keyDifferences: [
        'vs throwIfEmpty → throwIfEmpty errors on empty; defaultIfEmpty provides a fallback',
        'vs startWith → startWith ALWAYS prepends values; defaultIfEmpty only emits if source is empty',
        'vs isEmpty → isEmpty reports emptiness as boolean; defaultIfEmpty provides a substitute value',
      ],
      useCases: [
        'Default API response when no data is returned',
        'Placeholder values for empty streams',
        'Fallback configuration when no overrides exist',
      ],
      gotchas: [
        'Only emits default if source was COMPLETELY empty (zero emissions)',
        'If source emits even one value, the default is never used',
        'Default is a single value, not a stream',
      ],
      categoryNote:
        'Conditional & Boolean operator → empty-stream fallback value.',
    }),

    comparisons: ['isEmpty', 'throwIfEmpty'],

    syntax: `
const values = $INPUT_0_ARRAY;
const defaultValue = $INPUT_1_VALUE;

of(...values)
  .pipe(
    defaultIfEmpty(defaultValue)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [] },
      { label: 'Default Value', defaultValue: ['Fallback'] },
    ],

    run: (inputs) => {
      const [values, defaultArr] = inputs;
      const defaultValue = defaultArr[0];

      return of(...values).pipe(
        defaultIfEmpty(defaultValue),
        map((v) => String(v)),
      );
    },
  },
  sequenceEqual: {
    category: 'Conditional & Boolean',

    description: createOperatorDescription({
      definition:
        'Compares two observable sequences value-by-value and emits true only if they produce the exact same values in the same order.',
      mentalModel:
        'Comparing two playlists song by song — both must match exactly.',
      stepByStep: [
        'Subscribe to the source and the compareTo observable',
        'Compare values at each emission position',
        'If any pair differs, emit false and complete',
        'If both complete with all pairs matching, emit true',
      ],
      keyDifferences: [
        'vs every → every checks a predicate; sequenceEqual compares two entire sequences',
        'vs combineLatest → combineLatest combines values; sequenceEqual compares for equality',
        'vs zip → zip pairs values for processing; sequenceEqual pairs them for comparison',
      ],
      useCases: [
        'Testing observable output against expected values',
        'Validating data consistency between two sources',
        'Comparing expected vs actual event sequences',
      ],
      gotchas: [
        'Both sequences must be finite for a definitive result',
        'Order matters — same values in a different order produces false',
        'Length matters — different lengths always produce false',
      ],
      categoryNote: 'Conditional & Boolean operator → sequence comparison.',
    }),

    comparisons: ['every', 'zip'],

    syntax: `
const valuesA = $INPUT_0_ARRAY;
const valuesB = $INPUT_1_ARRAY;

of(...valuesA)
  .pipe(
    sequenceEqual(of(...valuesB))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Sequence A', defaultValue: [1, 2, 3] },
      { label: 'Sequence B', defaultValue: [1, 2, 3] },
    ],

    run: (inputs) => {
      const [valuesA, valuesB] = inputs;

      return of(...valuesA).pipe(
        sequenceEqual(of(...valuesB)),
        map((v) => `🔁 Equal: ${v}`),
      );
    },
  },
  timeInterval: {
    category: 'Time-based',

    description: createOperatorDescription({
      definition:
        'Emits each source value along with the time elapsed since the previous emission.',
      mentalModel: 'A lap timer — records the split time between each event.',
      stepByStep: [
        'Track the time of subscription (or last emission)',
        'On each new value, compute the interval since the previous',
        'Emit an object: { value, interval }',
        'Use the current time as the reference for the next interval',
      ],
      keyDifferences: [
        'vs timestamp → timestamp adds absolute time; timeInterval adds relative time gap',
        'vs pairwise → pairwise gives previous value; timeInterval gives time gap between values',
        'vs scan → scan can compute intervals manually; timeInterval is purpose-built',
      ],
      useCases: [
        'Measuring typing speed between keystrokes',
        'Monitoring event frequency',
        'Performance gap analysis between emissions',
      ],
      gotchas: [
        'First interval is the time since subscription, not since first value',
        'Returns { value, interval } objects (wraps original values)',
        'Interval is measured in milliseconds',
      ],
      categoryNote: 'Time-based operator → inter-emission timing.',
    }),

    comparisons: ['timestamp', 'delay'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;

interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    timeInterval(),
    map(obj => "⏱ " + obj.value + " after " + obj.interval + "ms")
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [values, intervalArr] = inputs;
      const intervalTime = intervalArr[0];

      return interval(intervalTime).pipe(
        take(values.length),
        map((i) => values[i]),
        timeInterval(),
        map((obj) => `⏱ ${obj.value} after ${obj.interval}ms`),
      );
    },
  },
  timestamp: {
    category: 'Time-based',

    description: createOperatorDescription({
      definition: 'Attaches the current timestamp to each emitted value.',
      mentalModel:
        'A postmark — stamps each letter with the exact time it was processed.',
      stepByStep: [
        'Receive a value from the source',
        'Get the current timestamp (Date.now())',
        'Emit an object: { value, timestamp }',
        'Repeat for each value',
      ],
      keyDifferences: [
        'vs timeInterval → timeInterval measures gaps between emissions; timestamp records absolute time',
        'vs map → could add timestamps via map, but timestamp is purpose-built and more readable',
        'vs tap → tap runs side effects; timestamp transforms the output by wrapping values',
      ],
      useCases: [
        'Event logging with precise timestamps',
        'Audit trail creation',
        'Debugging emission timing',
      ],
      gotchas: [
        'Timestamp uses Date.now() (milliseconds since epoch)',
        'Returns { value, timestamp } objects — original values are wrapped',
        'Does not affect timing of emissions, only adds metadata',
      ],
      categoryNote: 'Time-based operator → absolute emission timestamping.',
    }),

    comparisons: ['timeInterval', 'delay'],

    syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;

interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    timestamp()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [values, intervalArr] = inputs;
      const intervalTime = intervalArr[0];

      return interval(intervalTime).pipe(
        take(values.length),
        map((i) => values[i]),
        timestamp(),
        map((obj) => `🕒 ${obj.value} at ${obj.timestamp}`),
      );
    },
  },

  // ────────────────────────────────────────────────────────────
  // MISSING ACTIVE OPERATORS
  // ────────────────────────────────────────────────────────────

  endWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Appends specified values to the end of the source observable when it completes.',
      mentalModel:
        'Like a "PS" at the end of a letter — after the main message, append a final note.',
      stepByStep: [
        'Mirror all source emissions as they arrive',
        'When source completes, emit each "endWith" value in order',
        'Complete after all appended values are emitted',
      ],
      timeline: `Source: --1--2--3--|
endWith(99)
Output: --1--2--3--99--|`,
      keyDifferences: [
        'vs startWith → startWith prepends before source; endWith appends after completion',
        'vs concat → concat chains an observable; endWith appends raw values',
        'vs finalize → finalize runs a side effect; endWith emits values',
      ],
      useCases: [
        'Adding a sentinel/terminator value',
        'Appending a default or summary value after a stream ends',
        'Testing — ensuring a known final value',
      ],
      gotchas: [
        'Only emits after the source completes — if source never completes, endWith values never appear',
        'Values are emitted synchronously after completion',
        'Counterpart to startWith — they can be combined',
      ],
      categoryNote: 'Combination operator → appends values at completion.',
    }),

    comparisons: ['startWith', 'concat'],

    syntax: `
const values = $INPUT_0_ARRAY;
const endValue = $INPUT_1_VALUE;

of(...values)
  .pipe(
    endWith(endValue)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'End Value', defaultValue: [99] },
    ],

    run: (inputs) => {
      const [values, endArr] = inputs;

      return of(...values).pipe(
        endWith(endArr[0]),
        map((v) => String(v)),
      );
    },
  },

  combineLatestWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Pipeable version of combineLatest. Combines the source with other observables, emitting an array of latest values whenever any input emits.',
      mentalModel:
        'Like a team dashboard — whenever any team member updates their status, you see the latest status of everyone.',
      stepByStep: [
        'Subscribe to source and all provided observables',
        'Wait until every observable has emitted at least once',
        'On each new emission from any observable, emit an array of the latest value from each',
        'Complete when all observables complete',
      ],
      timeline: `Source: --1-----3-----|
Other:  ----A-----B--|
Output: --[1,A]-[3,A]-[3,B]--|`,
      keyDifferences: [
        'vs combineLatest (deprecated creation) → combineLatestWith is pipeable, combineLatest is standalone',
        'vs zipWith → zip waits for paired emissions; combineLatestWith uses latest values',
        'vs withLatestFrom → withLatestFrom only emits when source emits; combineLatestWith emits when any emits',
      ],
      useCases: [
        'Combining multiple form fields reactively',
        'Merging independent state streams',
        'Dashboard data from multiple sources',
      ],
      gotchas: [
        'Replaces deprecated combineLatest operator (the operator form, not the creation function)',
        'No emissions until every observable has emitted at least once',
        'Can produce many emissions if sources emit frequently',
      ],
      categoryNote: 'Combination operator → modern pipeable replacement for combineLatest operator.',
    }),

    comparisons: ['combineLatest', 'withLatestFrom', 'zipWith'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const source$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const other$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

source$.pipe(
  combineLatestWith(other$)
).subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
      { label: 'Other Values', defaultValue: [10, 20, 30] },
      { label: 'Other Interval (ms)', defaultValue: [700] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const source$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );
      const other$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return source$.pipe(
        combineLatestWith(other$),
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },

  concatWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Pipeable version of concat. Subscribes to observables sequentially — waits for the source to complete, then subscribes to the next.',
      mentalModel:
        'Like a playlist — each song plays in order, the next starts only when the previous finishes.',
      stepByStep: [
        'Subscribe to the source observable',
        'Mirror all source emissions',
        'When source completes, subscribe to the first provided observable',
        'Continue until all observables complete in sequence',
      ],
      timeline: `Source: --1--2--|
Other:  --A--B--|
Output: --1--2--A--B--|`,
      keyDifferences: [
        'vs concat (deprecated operator) → concatWith is the modern pipeable replacement',
        'vs mergeWith → mergeWith subscribes to all simultaneously; concatWith waits for each to complete',
        'vs startWith/endWith → those prepend/append values; concatWith chains full observables',
      ],
      useCases: [
        'Sequential HTTP requests',
        'Playing animations in order',
        'Chaining dependent data streams',
      ],
      gotchas: [
        'If the source never completes, subsequent observables never start',
        'Cold observables are subscribed lazily (only when the previous completes)',
        'Order matters — first argument follows source, then second, etc.',
      ],
      categoryNote: 'Combination operator → modern pipeable replacement for concat operator.',
    }),

    comparisons: ['concat', 'mergeWith', 'startWith'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_1_ARRAY;

of(...aValues).pipe(
  concatWith(of(...bValues))
).subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Other Values', defaultValue: [10, 20, 30] },
    ],

    run: (inputs) => {
      const [aValues, bValues] = inputs;

      return of(...aValues).pipe(
        concatWith(of(...bValues)),
        map((v) => String(v)),
      );
    },
  },

  mergeWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Pipeable version of merge. Subscribes to the source and all provided observables simultaneously, interleaving their emissions.',
      mentalModel:
        'Like merging highway lanes — all traffic flows together in arrival order.',
      stepByStep: [
        'Subscribe to source and all provided observables at the same time',
        'Emit values from any observable as they arrive (interleaved)',
        'Complete only when ALL observables have completed',
      ],
      timeline: `Source: --1-----3--|
Other:  ----A-----B--|
Output: --1--A--3--B--|`,
      keyDifferences: [
        'vs merge (deprecated operator) → mergeWith is the modern pipeable replacement',
        'vs concatWith → concatWith is sequential; mergeWith is concurrent',
        'vs combineLatestWith → combineLatestWith emits arrays of combined values; mergeWith emits individual values',
      ],
      useCases: [
        'Merging multiple event streams (clicks, keyboard, touch)',
        'Combining independent data sources',
        'Running parallel operations',
      ],
      gotchas: [
        'Output order depends on emission timing, not argument order',
        'Does not combine values — emits each value individually',
        'Completes only when all sources complete',
      ],
      categoryNote: 'Combination operator → modern pipeable replacement for merge operator.',
    }),

    comparisons: ['merge', 'concatWith', 'combineLatestWith'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const source$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const other$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

source$.pipe(
  mergeWith(other$)
).subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
      { label: 'Other Values', defaultValue: [10, 20, 30] },
      { label: 'Other Interval (ms)', defaultValue: [300] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const source$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );
      const other$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return source$.pipe(
        mergeWith(other$),
        map((v) => String(v)),
      );
    },
  },

  zipWith: {
    category: 'Creation & Combination',
    description: createOperatorDescription({
      definition:
        'Pipeable version of zip. Pairs corresponding emissions from the source and other observables into arrays.',
      mentalModel:
        'Like a zipper — teeth from each side must meet in exact pairs before moving forward.',
      stepByStep: [
        'Subscribe to source and all provided observables',
        'Buffer values from each until all have emitted the Nth value',
        'Emit an array combining the Nth value from each observable',
        'Complete when any observable completes (after emitting its pair)',
      ],
      timeline: `Source: --1-----3--|
Other:  ----A--B----|
Output: ----[1,A]--[3,B]--|`,
      keyDifferences: [
        'vs zip (deprecated operator) → zipWith is the modern pipeable replacement',
        'vs combineLatestWith → combineLatestWith uses latest values; zipWith uses positional pairing',
        'vs withLatestFrom → withLatestFrom takes latest; zipWith waits for corresponding pair',
      ],
      useCases: [
        'Pairing request/response data',
        'Combining ordered parallel results',
        'Synchronizing step-by-step data',
      ],
      gotchas: [
        'Buffers values if one observable is faster than others — potential memory concern',
        'Completes when any source completes (unpaired values are lost)',
        'Slower observable dictates output rate',
      ],
      categoryNote: 'Combination operator → modern pipeable replacement for zip operator.',
    }),

    comparisons: ['zip', 'combineLatestWith', 'withLatestFrom'],

    syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const source$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const other$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

source$.pipe(
  zipWith(other$)
).subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [300] },
      { label: 'Other Values', defaultValue: [10, 20, 30] },
      { label: 'Other Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const source$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );
      const other$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return source$.pipe(
        zipWith(other$),
        map(([a, b]) => `[${a}, ${b}]`),
      );
    },
  },

  switchScan: {
    category: 'Transformation',
    description: createOperatorDescription({
      definition:
        'Like mergeScan but uses switchMap semantics — each new source emission cancels the previous inner observable before starting a new one with the accumulated value.',
      mentalModel:
        'Like an autocomplete that accumulates context — each keystroke cancels the previous search but carries forward the accumulated state.',
      stepByStep: [
        'Source emits a value',
        'Pass current accumulator and new value to the accumulator function',
        'Subscribe to the returned inner observable',
        'If source emits again before inner completes, unsubscribe from the previous inner',
        'Use the last accumulated value for the next iteration',
      ],
      timeline: `Source: --1--2--3--|
switchScan((acc, v) => of(acc + v).pipe(delay(200)), 0)
Output: --1--?--6--|  (2nd may be cancelled if 3 arrives quickly)`,
      keyDifferences: [
        'vs mergeScan → mergeScan keeps all inner observables alive; switchScan cancels previous',
        'vs switchMap → switchMap has no accumulator; switchScan accumulates state',
        'vs scan → scan is synchronous; switchScan works with inner observables',
      ],
      useCases: [
        'Paginated API calls with running totals',
        'Autocomplete with accumulated context',
        'Stateful switchMap patterns',
      ],
      gotchas: [
        'Previous inner observable is cancelled on new emission — may lose intermediate results',
        'Accumulator may not update if inner observable gets cancelled before emitting',
        'Seed value is required (like reduce/scan)',
      ],
      categoryNote: 'Transformation operator → stateful switching of inner observables.',
    }),

    comparisons: ['mergeScan', 'switchMap', 'scan'],

    syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    switchScan((acc, v) => of(acc + v), 0)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Source Interval (ms)', defaultValue: [500] },
    ],

    run: (inputs) => {
      const [values, intervalMs] = inputs;

      return interval(intervalMs[0]).pipe(
        take(values.length),
        map((i) => values[i]),
        switchScan((acc, v) => of(acc + v), 0),
        map((v) => String(v)),
      );
    },
  },

  materialize: {
    category: 'Utility & Side Effects',
    description: createOperatorDescription({
      definition:
        'Wraps each source emission, error, and completion into Notification objects, converting events into data.',
      mentalModel:
        'Like a flight recorder — instead of experiencing the events, you get a log of every event as metadata.',
      stepByStep: [
        'Source emits a value → emit Notification of kind "N" with the value',
        'Source errors → emit Notification of kind "E" with the error, then complete',
        'Source completes → emit Notification of kind "C", then complete',
      ],
      timeline: `Source: --1--2--|
materialize()
Output: --N(1)--N(2)--C()|`,
      keyDifferences: [
        'vs tap → tap observes side-effects; materialize converts events to Notification objects',
        'vs dematerialize → dematerialize reverses materialization, unwrapping Notifications back to events',
        'vs catchError → catchError handles errors; materialize wraps them as data',
      ],
      useCases: [
        'Logging all events (values, errors, completions) uniformly',
        'Transporting observable events through channels that only support values',
        'Testing — asserting exact event sequences',
      ],
      gotchas: [
        'Materialized stream always completes (even if source errored) because errors become values',
        'Must dematerialize to restore original event semantics',
        'Notification kind is "N" for next, "E" for error, "C" for complete',
      ],
      categoryNote: 'Utility operator → event-to-data conversion.',
    }),

    comparisons: ['dematerialize', 'tap'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    materialize()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        materialize(),
        map((n) => `${n.kind === 'N' ? '📦' : n.kind === 'C' ? '✅' : '❌'} kind=${n.kind}${n.kind === 'N' ? ' value=' + n.value : ''}`),
      );
    },
  },

  dematerialize: {
    category: 'Utility & Side Effects',
    description: createOperatorDescription({
      definition:
        'Converts a stream of Notification objects back into normal observable events (next, error, complete).',
      mentalModel:
        'Like replaying a flight recorder log — converting metadata records back into real events.',
      stepByStep: [
        'Source emits a Notification of kind "N" → re-emit the value as a normal next()',
        'Source emits a Notification of kind "E" → throw the error',
        'Source emits a Notification of kind "C" → complete the stream',
      ],
      timeline: `Source: --N(1)--N(2)--C()|
dematerialize()
Output: --1--2--|`,
      keyDifferences: [
        'vs materialize → materialize wraps events as data; dematerialize unwraps them back',
        'vs map → map transforms values; dematerialize reconstructs the full event stream',
      ],
      useCases: [
        'Restoring events after transporting through a value-only channel',
        'Replaying recorded event sequences',
        'Working with serialized observable event logs',
      ],
      gotchas: [
        'Source must emit Notification objects — runtime error otherwise',
        'A Notification of kind "E" will cause the output to error',
        'Always pair with materialize for round-trip usage',
      ],
      categoryNote: 'Utility operator → data-to-event conversion (reverse of materialize).',
    }),

    comparisons: ['materialize'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    materialize(),
    dematerialize()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        materialize(),
        dematerialize(),
        map((v) => String(v)),
      );
    },
  },

  observeOn: {
    category: 'Utility & Side Effects',
    description: createOperatorDescription({
      definition:
        'Re-emits all source notifications on a specified scheduler, controlling the execution context of downstream operators.',
      mentalModel:
        'Like routing mail through a specific post office — the letters are the same, but they pass through a different delivery system.',
      stepByStep: [
        'Source emits a value',
        'Schedule the emission on the specified scheduler (e.g., asyncScheduler)',
        'Downstream operators receive the value in the new execution context',
        'Applies to next, error, and complete notifications',
      ],
      timeline: `Source (sync): 1-2-3-|
observeOn(asyncScheduler)
Output (async): --1--2--3--|  (each emission is delayed to next microtask)`,
      keyDifferences: [
        'vs subscribeOn → subscribeOn affects when subscription happens; observeOn affects when emissions arrive downstream',
        'vs delay → delay adds fixed time; observeOn changes execution context/scheduler',
        'vs tap → tap adds side effects; observeOn changes scheduling',
      ],
      useCases: [
        'Moving heavy computation off the main thread',
        'Ensuring UI updates happen in the correct zone (Angular)',
        'Converting synchronous streams to asynchronous',
      ],
      gotchas: [
        'Makes synchronous sources async — changes timing behavior',
        'Affects ALL downstream operators, not just the next one',
        'Can cause subtle ordering issues if used carelessly',
        'In browser environments, asyncScheduler uses setTimeout(0)',
      ],
      categoryNote: 'Utility operator → scheduler-based emission routing.',
    }),

    comparisons: ['subscribeOn', 'delay'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    observeOn(asyncScheduler)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        observeOn(asyncScheduler),
        map((v) => `⏱️ ${v} (async)`),
      );
    },
  },

  subscribeOn: {
    category: 'Utility & Side Effects',
    description: createOperatorDescription({
      definition:
        'Schedules the subscription (and unsubscription) to the source observable on a specified scheduler.',
      mentalModel:
        'Like choosing which day to open your mail — it controls WHEN you start listening, not how the mail arrives.',
      stepByStep: [
        'When subscribe() is called, defer the actual subscription to the specified scheduler',
        'The scheduler determines when the source is actually subscribed to',
        'All emissions then follow normally from the source',
        'Unsubscription is also scheduled on the same scheduler',
      ],
      timeline: `subscribe() called at T=0
subscribeOn(asyncScheduler)
Actual subscription happens at T=1 (next microtask)
Source: --1--2--3--|  (starts slightly later)`,
      keyDifferences: [
        'vs observeOn → observeOn affects emission delivery; subscribeOn affects when subscription starts',
        'vs delay → delay postpones each value; subscribeOn postpones the subscription itself',
        'Position in pipe does not matter — subscribeOn always affects the source subscription',
      ],
      useCases: [
        'Deferring expensive subscriptions',
        'Ensuring subscriptions happen outside Angular zone',
        'Controlling subscription timing in schedulers',
      ],
      gotchas: [
        'Position in the pipe chain does NOT matter — always affects the root subscription',
        'Only affects the subscription side, not emission delivery (use observeOn for that)',
        'Rarely needed in typical application code',
      ],
      categoryNote: 'Utility operator → scheduler-based subscription timing.',
    }),

    comparisons: ['observeOn', 'delay'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    subscribeOn(asyncScheduler)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        subscribeOn(asyncScheduler),
        map((v) => `⏱️ ${v} (deferred sub)`),
      );
    },
  },

  // ────────────────────────────────────────────────────────────
  // DEPRECATED OPERATORS (full playgrounds for learning)
  // ────────────────────────────────────────────────────────────

  mapTo: {
    category: 'Transformation',
    deprecated: 'Use map(() => value) instead.',
    description: createOperatorDescription({
      definition:
        'Maps every source emission to the same constant value, ignoring the actual emitted value.',
      mentalModel:
        'Like a stamp machine — no matter what goes in, the same stamp comes out.',
      stepByStep: [
        'Source emits any value',
        'Ignore the emitted value',
        'Emit the constant value instead',
      ],
      timeline: `Source: --1--2--3--|
mapTo('X')
Output: --X--X--X--|`,
      keyDifferences: [
        'vs map → map transforms each value; mapTo always emits the same constant',
        'Deprecated because map(() => value) is just as clear',
      ],
      useCases: [
        'Converting click events to a constant action',
        'Replacing values with a flag (true/false)',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use map(() => value) instead',
        'The constant is captured when mapTo is called, not when source emits',
      ],
      categoryNote: 'Deprecated → use map(() => value).',
    }),

    comparisons: ['map'],

    syntax: `
const values = $INPUT_0_ARRAY;
const constant = $INPUT_1_VALUE;

of(...values)
  .pipe(
    mapTo(constant)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Constant Value', defaultValue: [42] },
    ],

    run: (inputs) => {
      const [values, constantArr] = inputs;

      return of(...values).pipe(
        mapTo(constantArr[0]),
        map((v) => String(v)),
      );
    },
  },

  pluck: {
    category: 'Transformation',
    deprecated: 'Use map(x => x.prop) instead.',
    description: createOperatorDescription({
      definition:
        'Extracts a nested property from each emitted object by property name.',
      mentalModel:
        'Like a label reader on a conveyor belt — it reads one specific field from each passing object.',
      stepByStep: [
        'Source emits an object',
        'Navigate to the specified property path',
        'Emit just that property value',
      ],
      timeline: `Source: --{name:'A'}--{name:'B'}--|
pluck('name')
Output: --A--B--|`,
      keyDifferences: [
        'vs map → map is more flexible; pluck only reads properties',
        'Deprecated because map(x => x.prop) is type-safe and equally readable',
      ],
      useCases: [
        'Extracting a single property from API responses',
        'Getting event target values',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use map(x => x.prop) instead',
        'Returns undefined for missing properties (no runtime error)',
        'No type inference — not type-safe',
      ],
      categoryNote: 'Deprecated → use map(x => x.prop).',
    }),

    comparisons: ['map'],

    syntax: `
const items = [$INPUT_0_ARRAY];

of(...items)
  .pipe(
    pluck('name')
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      {
        label: 'Source Objects',
        defaultValue: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
        type: 'object' as const,
      },
    ],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        pluck('name'),
        map((v) => String(v)),
      );
    },
  },

  exhaust: {
    category: 'Creation & Combination',
    deprecated: 'Use exhaustAll() instead.',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by dropping inner observables that arrive while a current inner is still active. Renamed to exhaustAll.',
      mentalModel:
        'Same as exhaustAll — like a busy phone line. If a call is in progress, new incoming calls are ignored.',
      stepByStep: [
        'Outer emits an inner observable',
        'If no inner is active → subscribe to it',
        'If an inner IS active → ignore/drop the new inner',
        'When active inner completes → ready for the next',
      ],
      timeline: `Outer: --A$------B$------C$--|
A$:    --1--2--|
B$:         (dropped, A$ still active)
C$:               --7--8--|
Output: --1--2--------7--8--|`,
      keyDifferences: [
        'Identical to exhaustAll — just the old name',
        'vs mergeAll → mergeAll subscribes to all; exhaust ignores while busy',
      ],
      useCases: [
        'Preventing duplicate form submissions',
        'Ignoring rapid-fire trigger events while processing',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use exhaustAll() instead — identical behavior',
        'Dropped inner observables are silently ignored (no error)',
      ],
      categoryNote: 'Deprecated → renamed to exhaustAll().',
    }),

    comparisons: ['exhaustAll', 'mergeAll', 'concatAll'],

    syntax: `
const inner1$ = interval(300).pipe(take(3), map(i => [1,2,3][i]));
const inner2$ = interval(100).pipe(take(3), map(i => [10,20,30][i]));

of(inner1$, inner2$)
  .pipe(
    exhaust()
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
      { label: 'Inner Observable A Interval (ms)', defaultValue: [300] },
      { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
      { label: 'Inner Observable B Interval (ms)', defaultValue: [100] },
    ],

    run: (inputs) => {
      const [aValues, aInterval, bValues, bInterval] = inputs;

      const inner1$ = interval(aInterval[0]).pipe(
        take(aValues.length),
        map((i) => aValues[i]),
      );
      const inner2$ = interval(bInterval[0]).pipe(
        take(bValues.length),
        map((i) => bValues[i]),
      );

      return of(inner1$, inner2$).pipe(
        exhaustAll(),
        map((v) => String(v)),
      );
    },
  },

  concatMapTo: {
    category: 'Transformation',
    deprecated: 'Use concatMap(() => inner$) instead.',
    description: createOperatorDescription({
      definition:
        'Maps every source emission to the same inner observable, subscribing sequentially (waits for each inner to complete).',
      mentalModel:
        'Like a jukebox that plays the same song after each coin — each coin triggers the same song, played one at a time.',
      stepByStep: [
        'Source emits a value (value is ignored)',
        'Subscribe to the fixed inner observable',
        'Wait for inner to complete before processing next source emission',
      ],
      timeline: `Source: --1--2--|
concatMapTo(of('A','B'))
Output: --A--B--A--B--|`,
      keyDifferences: [
        'vs concatMap → concatMap uses the source value to create inner; concatMapTo always uses the same inner',
        'Deprecated because concatMap(() => inner$) is equally clear',
      ],
      useCases: [
        'Triggering the same sequence on repeated events',
        'Polling — each tick triggers the same HTTP call sequentially',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use concatMap(() => inner$) instead',
        'The inner observable is the same instance — if it is a cold observable, it restarts each time',
      ],
      categoryNote: 'Deprecated → use concatMap(() => inner$).',
    }),

    comparisons: ['concatMap', 'mergeMapTo', 'switchMapTo'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const innerValues = $INPUT_1_ARRAY;

of(...sourceValues)
  .pipe(
    concatMap(() => of(...innerValues))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2] },
      { label: 'Inner Values', defaultValue: ['A', 'B'] },
    ],

    run: (inputs) => {
      const [sourceValues, innerValues] = inputs;

      return of(...sourceValues).pipe(
        concatMap(() => of(...innerValues)),
        map((v) => String(v)),
      );
    },
  },

  mergeMapTo: {
    category: 'Transformation',
    deprecated: 'Use mergeMap(() => inner$) instead.',
    description: createOperatorDescription({
      definition:
        'Maps every source emission to the same inner observable, subscribing concurrently to all.',
      mentalModel:
        'Like a factory with parallel assembly lines — each trigger starts the same process, all running simultaneously.',
      stepByStep: [
        'Source emits a value (value is ignored)',
        'Subscribe to the fixed inner observable immediately',
        'All inner subscriptions run concurrently',
        'Emissions interleave based on timing',
      ],
      timeline: `Source: --1--2--|
mergeMapTo(of('A','B'))
Output: --A--B--A--B--|  (concurrent, interleaved)`,
      keyDifferences: [
        'vs mergeMap → mergeMap uses source value; mergeMapTo ignores it',
        'vs concatMapTo → concatMapTo is sequential; mergeMapTo is concurrent',
        'Deprecated because mergeMap(() => inner$) is equally clear',
      ],
      useCases: [
        'Firing parallel requests on each event',
        'Starting identical background tasks concurrently',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use mergeMap(() => inner$) instead',
        'All inner observables run simultaneously — may cause backpressure',
      ],
      categoryNote: 'Deprecated → use mergeMap(() => inner$).',
    }),

    comparisons: ['mergeMap', 'concatMapTo', 'switchMapTo'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const innerValues = $INPUT_1_ARRAY;

of(...sourceValues)
  .pipe(
    mergeMap(() => of(...innerValues))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2] },
      { label: 'Inner Values', defaultValue: ['A', 'B'] },
    ],

    run: (inputs) => {
      const [sourceValues, innerValues] = inputs;

      return of(...sourceValues).pipe(
        mergeMap(() => of(...innerValues)),
        map((v) => String(v)),
      );
    },
  },

  switchMapTo: {
    category: 'Transformation',
    deprecated: 'Use switchMap(() => inner$) instead.',
    description: createOperatorDescription({
      definition:
        'Maps every source emission to the same inner observable, cancelling the previous inner subscription on each new emission.',
      mentalModel:
        'Like changing TV channels with a fixed channel list — each button press switches to the same channel, cancelling what was playing.',
      stepByStep: [
        'Source emits a value (value is ignored)',
        'Cancel any active inner subscription',
        'Subscribe to the fixed inner observable',
        'Mirror its emissions until source emits again',
      ],
      timeline: `Source: --1-----2--|
switchMapTo(interval(200).pipe(take(3)))
Output: --0--1--0--1--2--|  (first inner cancelled by second)`,
      keyDifferences: [
        'vs switchMap → switchMap uses source value; switchMapTo ignores it',
        'vs mergeMapTo → mergeMapTo keeps all inner alive; switchMapTo cancels previous',
        'Deprecated because switchMap(() => inner$) is equally clear',
      ],
      useCases: [
        'Restarting a fixed timer/animation on each trigger',
        'Refreshing the same data on each user action',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use switchMap(() => inner$) instead',
        'Previous inner observable is always cancelled — may lose data',
      ],
      categoryNote: 'Deprecated → use switchMap(() => inner$).',
    }),

    comparisons: ['switchMap', 'mergeMapTo', 'concatMapTo'],

    syntax: `
const sourceValues = $INPUT_0_ARRAY;
const innerValues = $INPUT_1_ARRAY;

of(...sourceValues)
  .pipe(
    switchMap(() => of(...innerValues))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2] },
      { label: 'Inner Values', defaultValue: ['A', 'B', 'C'] },
    ],

    run: (inputs) => {
      const [sourceValues, innerValues] = inputs;

      return of(...sourceValues).pipe(
        switchMap(() => of(...innerValues)),
        map((v) => String(v)),
      );
    },
  },

  repeatWhen: {
    category: 'Error Handling',
    deprecated: 'Use repeat() with config { delay: () => notifier$ } instead.',
    description: createOperatorDescription({
      definition:
        'Re-subscribes to the source when a notifier observable emits, allowing custom repeat logic.',
      mentalModel:
        'Like a coach deciding when to replay a play — after each completion, the notifier decides if and when to repeat.',
      stepByStep: [
        'Source completes',
        'Notifier function receives an observable of completions',
        'When notifier emits → re-subscribe to source',
        'When notifier completes → output completes',
        'When notifier errors → output errors',
      ],
      timeline: `Source: --1--2--|  (completes)
notifier: ----emit--|
Output: --1--2------1--2--|`,
      keyDifferences: [
        'vs repeat → repeat uses a count; repeatWhen uses a notifier for full control',
        'vs retryWhen → retryWhen triggers on errors; repeatWhen triggers on completions',
      ],
      useCases: [
        'Custom polling with dynamic intervals',
        'Repeating based on user interaction',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use repeat({ delay: () => notifier$ }) instead',
        'Notifier receives an observable of completions, not values',
        'If notifier completes synchronously, no repeat happens',
      ],
      categoryNote: 'Deprecated → use repeat() with config.',
    }),

    comparisons: ['repeat', 'retryWhen'],

    syntax: `
const values = $INPUT_0_ARRAY;
const repeatCount = $INPUT_1_VALUE;

of(...values)
  .pipe(
    repeat(repeatCount)
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Repeat Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, countArr] = inputs;
      const count = Number(countArr[0]);

      return of(...values).pipe(
        repeat(count),
        map((v) => String(v)),
      );
    },
  },

  retryWhen: {
    category: 'Error Handling',
    deprecated: 'Use retry() with config { delay: (error, count) => notifier$ } instead.',
    description: createOperatorDescription({
      definition:
        'Re-subscribes to the source when a notifier observable emits after an error, allowing custom retry logic.',
      mentalModel:
        'Like a doctor deciding when to retry treatment — after each failure, a specialist decides if and when to try again.',
      stepByStep: [
        'Source errors',
        'Notifier function receives an observable of errors',
        'When notifier emits → re-subscribe to source',
        'When notifier completes → output completes',
        'When notifier errors → output errors with that error',
      ],
      timeline: `Source: --1--✗  (errors)
notifier: --emit--|
Output: --1------1--✗--|  (retried once, then error or complete)`,
      keyDifferences: [
        'vs retry → retry uses a count; retryWhen uses a notifier for full control',
        'vs repeatWhen → repeatWhen triggers on completions; retryWhen triggers on errors',
        'vs catchError → catchError handles the error once; retryWhen can retry multiple times',
      ],
      useCases: [
        'Exponential backoff retry strategies',
        'Retry with user confirmation',
        'Retry with progressive delay',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use retry({ delay: (error, retryCount) => timer(1000) }) instead',
        'Notifier receives an observable of errors, not values',
        'If notifier completes, output completes (even if source errored)',
      ],
      categoryNote: 'Deprecated → use retry() with config.',
    }),

    comparisons: ['retry', 'repeatWhen', 'catchError'],

    syntax: `
const values = $INPUT_0_ARRAY;
const retryCount = $INPUT_1_VALUE;

of(...values)
  .pipe(
    map(v => {
      if (v === 'error') throw new Error('Error');
      return v;
    }),
    retry(retryCount),
    catchError(() => of('❌ Final Error after retries'))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values (use "error" to simulate)', defaultValue: [1, 2, 'error'] },
      { label: 'Retry Count', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, retryArr] = inputs;
      const retryCount = Number(retryArr[0]);

      return of(...values).pipe(
        map((v) => {
          if (v === 'error') throw new Error('Error');
          return String(v);
        }),
        retry(retryCount),
        catchError(() => of('❌ Final Error after retries')),
      );
    },
  },

  publish: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use share(), connectable(), or connect() instead.',
    description: createOperatorDescription({
      definition:
        'Makes a source observable "hot" by multicasting through a Subject. Returns a ConnectableObservable that starts emitting when connect() is called.',
      mentalModel:
        'Like a radio station — it broadcasts to all listeners, but only starts when the station goes live (connect).',
      stepByStep: [
        'publish() wraps the source with a Subject',
        'Returns a ConnectableObservable',
        'Subscribers register but receive nothing yet',
        'Calling connect() starts the source and multicasts to all subscribers',
        'All subscribers share the same execution',
      ],
      timeline: `Source: --1--2--3--|
Subscriber A subscribes, Subscriber B subscribes
connect()
A: --1--2--3--|
B: --1--2--3--|  (same values, same timing)`,
      keyDifferences: [
        'vs share → share auto-connects on first subscriber; publish requires manual connect()',
        'vs connectable → connectable is the modern replacement',
        'vs multicast → publish is multicast with a plain Subject',
      ],
      useCases: [
        'Manual control over when multicasting starts',
        'Coordinating multiple subscribers before starting a stream',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use connectable() or share() instead',
        'Forgetting to call connect() means no emissions ever',
        'Must manage the connection subscription to avoid leaks',
      ],
      categoryNote: 'Deprecated → use connectable() or share().',
    }),

    comparisons: ['share', 'connectable', 'multicast'],

    syntax: `
const values = $INPUT_0_ARRAY;

const source$ = of(...values);
const published$ = source$.pipe(share());

published$.subscribe(v => console.log('A:', v));
published$.subscribe(v => console.log('B:', v));
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return new Observable((subscriber) => {
        const source$ = of(...values).pipe(share());

        source$.subscribe((v) => subscriber.next(`A: ${v}`));
        source$.subscribe({
          next: (v) => subscriber.next(`B: ${v}`),
          complete: () => subscriber.complete(),
        });
      });
    },
  },

  publishBehavior: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use connectable() with a BehaviorSubject or shareReplay(1) instead.',
    description: createOperatorDescription({
      definition:
        'Like publish but uses a BehaviorSubject, which replays the last value (or initial value) to new subscribers.',
      mentalModel:
        'Like a TV channel with a "last frame" buffer — tune in late and you still see the most recent frame.',
      stepByStep: [
        'Wraps source with a BehaviorSubject (with initial value)',
        'New subscribers immediately receive the latest value',
        'All subscribers share the same execution after connect()',
      ],
      timeline: `Initial: 0
Source: --1--2--3--|
Late subscriber after 2:
Output: 0--1--2... (late) → 2--3--|`,
      keyDifferences: [
        'vs publish → publish has no replay; publishBehavior replays last value',
        'vs publishReplay → publishReplay replays N values; publishBehavior replays exactly 1',
        'vs shareReplay(1) → shareReplay(1) is the modern equivalent',
      ],
      useCases: [
        'State management where new subscribers need current state',
        'Caching the latest value for late subscribers',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use connectable() with BehaviorSubject or shareReplay(1)',
        'Requires an initial/seed value',
        'Must call connect() manually',
      ],
      categoryNote: 'Deprecated → use shareReplay(1) or connectable with BehaviorSubject.',
    }),

    comparisons: ['shareReplay', 'publish', 'publishReplay'],

    syntax: `
const values = $INPUT_0_ARRAY;

const source$ = of(...values).pipe(shareReplay(1));

source$.subscribe(v => console.log('A:', v));
source$.subscribe(v => console.log('B:', v));
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return new Observable((subscriber) => {
        const source$ = of(...values).pipe(shareReplay(1));

        source$.subscribe((v) => subscriber.next(`A: ${v}`));
        source$.subscribe({
          next: (v) => subscriber.next(`B: ${v}`),
          complete: () => subscriber.complete(),
        });
      });
    },
  },

  publishReplay: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use shareReplay(bufferSize) instead.',
    description: createOperatorDescription({
      definition:
        'Like publish but uses a ReplaySubject. Replays the last N values to new subscribers.',
      mentalModel:
        'Like a DVR — new viewers can rewind and watch the last N recorded segments.',
      stepByStep: [
        'Wraps source with a ReplaySubject(bufferSize)',
        'New subscribers receive up to N most recent values immediately',
        'All subscribers share the same execution after connect()',
      ],
      timeline: `bufferSize: 2
Source: --1--2--3--|
Late subscriber after 3:
Late output: 2, 3 (replayed), then continues`,
      keyDifferences: [
        'vs publish → publish has no replay; publishReplay replays N values',
        'vs publishBehavior → publishBehavior replays 1 with initial; publishReplay replays N without initial',
        'vs shareReplay → shareReplay is the modern replacement',
      ],
      useCases: [
        'Caching API responses for late subscribers',
        'Replaying recent events to new listeners',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use shareReplay(bufferSize) instead',
        'Large buffer sizes consume memory',
        'Must call connect() manually',
      ],
      categoryNote: 'Deprecated → use shareReplay(bufferSize).',
    }),

    comparisons: ['shareReplay', 'publish', 'publishBehavior'],

    syntax: `
const values = $INPUT_0_ARRAY;
const bufferSize = $INPUT_1_VALUE;

const source$ = of(...values).pipe(shareReplay(bufferSize));

source$.subscribe(v => console.log('A:', v));
source$.subscribe(v => console.log('B:', v));
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3] },
      { label: 'Replay Buffer Size', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, bufferArr] = inputs;

      return new Observable((subscriber) => {
        const source$ = of(...values).pipe(shareReplay(bufferArr[0]));

        source$.subscribe((v) => subscriber.next(`A: ${v}`));
        source$.subscribe({
          next: (v) => subscriber.next(`B: ${v}`),
          complete: () => subscriber.complete(),
        });
      });
    },
  },

  publishLast: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use share() with connector: () => new AsyncSubject() or shareReplay(1) instead.',
    description: createOperatorDescription({
      definition:
        'Like publish but uses an AsyncSubject. Only emits the LAST value from the source, and only after the source completes.',
      mentalModel:
        'Like waiting for the final exam score — you only get the result after all grading is done.',
      stepByStep: [
        'Wraps source with an AsyncSubject',
        'No emissions until source completes',
        'When source completes, emits only the last value to all subscribers',
        'Late subscribers also receive the last value',
      ],
      timeline: `Source: --1--2--3--|
publishLast + connect
All subscribers: 3 (after completion)`,
      keyDifferences: [
        'vs publish → publish emits all values; publishLast only emits the last',
        'vs last() → last() is a filtering operator; publishLast is multicasting',
        'vs shareReplay(1) → shareReplay(1) replays last value but emits all values first',
      ],
      useCases: [
        'Sharing a result that is only meaningful once complete',
        'API calls where only the final response matters',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use share with AsyncSubject connector or shareReplay(1)',
        'Nothing emits until source completes',
        'If source errors, error is forwarded and no value emits',
      ],
      categoryNote: 'Deprecated → use share or shareReplay.',
    }),

    comparisons: ['publish', 'shareReplay', 'last'],

    syntax: `
const values = $INPUT_0_ARRAY;

const source$ = of(...values).pipe(
  last(),
  shareReplay(1)
);

source$.subscribe(v => console.log('Result:', v));
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        last(),
        shareReplay(1),
        map((v) => `🏁 Last: ${v}`),
        catchError(() => of('❌ No values')),
      );
    },
  },

  refCount: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use share() instead, which handles reference counting automatically.',
    description: createOperatorDescription({
      definition:
        'Automatically connects a ConnectableObservable when the first subscriber arrives and disconnects when all subscribers leave.',
      mentalModel:
        'Like an automatic light — turns on when someone enters the room, turns off when everyone leaves.',
      stepByStep: [
        'First subscriber arrives → automatically call connect()',
        'Subsequent subscribers share the same execution',
        'Last subscriber unsubscribes → disconnect',
        'Next subscriber → reconnect',
      ],
      timeline: `Sub A arrives → connect, emissions start
Sub B arrives → shares same stream
Sub A leaves → still connected (B is here)
Sub B leaves → disconnect`,
      keyDifferences: [
        'vs manual connect() → refCount auto-manages the lifecycle',
        'vs share → share() = multicast + refCount in one operator',
      ],
      useCases: [
        'Used with publish/multicast for automatic lifecycle management',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use share() which includes refCount behavior',
        'Only works on ConnectableObservables',
        'Reconnects from scratch when all leave and a new subscriber arrives',
      ],
      categoryNote: 'Deprecated → use share() directly.',
    }),

    comparisons: ['share', 'publish'],

    syntax: `
const values = $INPUT_0_ARRAY;

const source$ = of(...values).pipe(share());

source$.subscribe(v => console.log('A:', v));
source$.subscribe(v => console.log('B:', v));
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return new Observable((subscriber) => {
        const source$ = of(...values).pipe(share());

        source$.subscribe((v) => subscriber.next(`A: ${v}`));
        source$.subscribe({
          next: (v) => subscriber.next(`B: ${v}`),
          complete: () => subscriber.complete(),
        });
      });
    },
  },

  multicast: {
    category: 'Multicasting & Sharing',
    deprecated: 'Use connectable() or share() instead.',
    description: createOperatorDescription({
      definition:
        'Returns a ConnectableObservable that multicasts through the provided Subject. The foundation behind publish, publishReplay, etc.',
      mentalModel:
        'Like a TV splitter box — one signal source is split to many TVs through a central hub (Subject).',
      stepByStep: [
        'Takes a Subject (or Subject factory)',
        'Returns a ConnectableObservable',
        'All subscribers receive values through the shared Subject',
        'Must call connect() to start',
      ],
      timeline: `Source: --1--2--3--|
multicast(new Subject()) + connect
A: --1--2--3--|
B: --1--2--3--|  (shared)`,
      keyDifferences: [
        'vs publish → publish is multicast(new Subject())',
        'vs publishReplay → publishReplay is multicast(new ReplaySubject(n))',
        'vs share → share = multicast(() => new Subject()) + refCount',
        'vs connectable → connectable is the modern replacement',
      ],
      useCases: [
        'Custom multicasting with specific Subject types',
        'Advanced sharing patterns (mostly internal/library use)',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use connectable() or share() instead',
        'Must manage connect() manually unless paired with refCount',
        'Using a single Subject instance (not factory) only works once — use factory for reconnectable streams',
      ],
      categoryNote: 'Deprecated → use connectable() or share().',
    }),

    comparisons: ['publish', 'share', 'connectable'],

    syntax: `
const values = $INPUT_0_ARRAY;

const source$ = of(...values).pipe(share());

source$.subscribe(v => console.log('A:', v));
source$.subscribe(v => console.log('B:', v));
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return new Observable((subscriber) => {
        const source$ = of(...values).pipe(share());

        source$.subscribe((v) => subscriber.next(`A: ${v}`));
        source$.subscribe({
          next: (v) => subscriber.next(`B: ${v}`),
          complete: () => subscriber.complete(),
        });
      });
    },
  },

  onErrorResumeNext: {
    category: 'Error Handling',
    deprecated: 'Handle errors explicitly with catchError() and concat/concatWith instead.',
    description: createOperatorDescription({
      definition:
        'When the source errors or completes, subscribes to the next observable in the list, ignoring errors silently.',
      mentalModel:
        'Like a resilient playlist — if a song fails to play, skip it and move to the next one without interrupting the experience.',
      stepByStep: [
        'Subscribe to the source',
        'If source errors or completes → subscribe to next provided observable',
        'Continue through each observable in order',
        'Complete after the last observable finishes (errors are swallowed)',
      ],
      timeline: `Source1: --1--✗ (error)
Source2: --A--B--| (complete)
Source3: --X--|
Output: --1--A--B--X--|  (errors silently skipped)`,
      keyDifferences: [
        'vs catchError → catchError lets you handle the error; onErrorResumeNext swallows it',
        'vs concat → concat stops on error; onErrorResumeNext continues regardless',
      ],
      useCases: [
        'Fallback chains where errors should be ignored',
        'Resilient data loading from multiple sources',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use catchError + concatWith for explicit error handling',
        'Errors are silently swallowed — makes debugging very hard',
        'Also moves to next on normal completion (not just errors)',
      ],
      categoryNote: 'Deprecated → use catchError with explicit fallback logic.',
    }),

    comparisons: ['catchError', 'concat'],

    syntax: `
const values = $INPUT_0_ARRAY;
const fallbackValues = $INPUT_1_ARRAY;

of(...values)
  .pipe(
    map(v => { if (v === 'error') throw new Error(); return v; }),
    catchError(() => of(...fallbackValues))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [
      { label: 'Source Values (use "error")', defaultValue: [1, 'error', 3] },
      { label: 'Fallback Values', defaultValue: ['A', 'B'] },
    ],

    run: (inputs) => {
      const [values, fallback] = inputs;

      return of(...values).pipe(
        map((v) => {
          if (v === 'error') throw new Error('failed');
          return v;
        }),
        catchError(() => of(...fallback)),
        map((v) => String(v)),
      );
    },
  },

  combineAll: {
    category: 'Creation & Combination',
    deprecated: 'Use combineLatestAll() instead — identical behavior, just renamed.',
    description: createOperatorDescription({
      definition:
        'Flattens a higher-order observable by applying combineLatest when the outer completes. Renamed to combineLatestAll.',
      mentalModel:
        'Same as combineLatestAll — waits for all inner observables, then combines their latest values.',
      stepByStep: [
        'Outer observable emits inner observables and completes',
        'Apply combineLatest to all collected inner observables',
        'Emit combined arrays of latest values from each inner',
      ],
      timeline: `Outer: --A$--B$--|
A$: --1-----3--|
B$: ----2-----4--|
Output: [1,2], [3,2], [3,4]`,
      keyDifferences: [
        'Identical to combineLatestAll — just the old name',
        'vs zipAll → zipAll pairs by position; combineAll uses latest values',
      ],
      useCases: [
        'Combining dynamic inner observables',
        'Dashboard-style merging of multiple data streams',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use combineLatestAll() instead — identical behavior',
        'Outer must complete before combination starts',
      ],
      categoryNote: 'Deprecated → renamed to combineLatestAll().',
    }),

    comparisons: ['combineLatestAll', 'zipAll'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(
  of(...values),
  of(...values.map(v => v * 10))
)
  .pipe(combineLatestAll())
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(
        of(...values),
        of(...values.map((v: number) => v * 10)),
      ).pipe(
        combineLatestAll(),
        map((arr: any[]) => `[${arr.join(', ')}]`),
      );
    },
  },

  flatMap: {
    category: 'Transformation',
    deprecated: 'Use mergeMap() instead — identical behavior, just renamed.',
    description: createOperatorDescription({
      definition:
        'Alias for mergeMap. Maps each value to an inner observable and flattens all concurrently.',
      mentalModel:
        'Identical to mergeMap — like a warehouse where each package triggers a parallel delivery route.',
      stepByStep: [
        'Source emits a value',
        'Map it to an inner observable',
        'Subscribe to the inner immediately (concurrent)',
        'Merge all inner emissions into the output',
      ],
      timeline: `Source: --1--2--|
flatMap(v => of(v * 10))
Output: --10--20--|`,
      keyDifferences: [
        'Identical to mergeMap — flatMap is just an alias',
        'Name comes from "flatten + map" pattern in functional programming',
      ],
      useCases: [
        'Same as mergeMap — parallel inner subscriptions',
      ],
      gotchas: [
        '⚠️ DEPRECATED: Use mergeMap() instead — identical behavior',
        'The name flatMap may cause confusion with Array.prototype.flatMap',
      ],
      categoryNote: 'Deprecated → renamed to mergeMap().',
    }),

    comparisons: ['mergeMap', 'concatMap', 'switchMap'],

    syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    mergeMap(v => of(v * 10))
  )
  .subscribe(console.log);
`.trim(),

    inputs: [{ label: 'Source Values', defaultValue: [1, 2, 3] }],

    run: (inputs) => {
      const [values] = inputs;

      return of(...values).pipe(
        mergeMap((v: number) => of(v * 10)),
        map((v) => String(v)),
      );
    },
  },

  partition: {
    category: 'Transformation',
    deprecated: 'Use filter() for each branch instead.',
    description: createOperatorDescription({
      definition:
        'Splits a source observable into two: one with values that pass the predicate, one with values that don\'t. Returns a tuple of [matches$, nonMatches$].',
      mentalModel:
        'Like a coin sorter — each coin goes into one of two bins based on its value.',
      stepByStep: [
        'Takes a source and a predicate function',
        'Returns [trueStream$, falseStream$]',
        'Values passing the predicate go to trueStream$',
        'Values failing the predicate go to falseStream$',
      ],
      timeline: `Source: --1--2--3--4--5--|
partition(v => v % 2 === 0)
Even$: ----2-----4-----|
Odd$:  --1-----3-----5--|`,
      keyDifferences: [
        'vs filter → filter only gives matching values; partition gives both matching and non-matching',
        'Returns two observables, not one',
      ],
      useCases: [
        'Splitting events into success/failure streams',
        'Routing values to different handlers',
      ],
      gotchas: [
        '⚠️ DEPRECATED as operator: Use filter() with and without negation instead',
        'Was changed from operator to creation function, then deprecated entirely',
        'Both output streams share the same source subscription',
      ],
      categoryNote: 'Deprecated → use two filter() calls.',
    }),

    comparisons: ['filter'],

    syntax: `
const values = $INPUT_0_ARRAY;
const threshold = $INPUT_1_VALUE;

const even$ = of(...values).pipe(filter(v => v % 2 === 0));
const odd$ = of(...values).pipe(filter(v => v % 2 !== 0));

even$.subscribe(v => console.log('Even:', v));
odd$.subscribe(v => console.log('Odd:', v));
`.trim(),

    inputs: [
      { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
      { label: 'Divider (even/odd)', defaultValue: [2] },
    ],

    run: (inputs) => {
      const [values, divArr] = inputs;
      const div = divArr[0];

      return new Observable((subscriber) => {
        of(...values)
          .pipe(filter((v: number) => v % div === 0))
          .subscribe((v) => subscriber.next(`✅ Pass: ${v}`));

        of(...values)
          .pipe(filter((v: number) => v % div !== 0))
          .subscribe({
            next: (v) => subscriber.next(`❌ Fail: ${v}`),
            complete: () => subscriber.complete(),
          });
      });
    },
  },
};

// Auto-populate name from registry key
export const OPERATOR_REGISTRY: Record<string, OperatorDemo> = {};
for (const [key, entry] of Object.entries(_REGISTRY)) {
  OPERATOR_REGISTRY[key] = { ...entry, name: key };
}

/**
 * Creates a composite operator that runs multiple operators simultaneously
 * and displays their outputs side-by-side
 */
export function createCompositeOperator(operatorNames: string[]): OperatorDemo {
  const validOperators = operatorNames.filter(
    (name) => OPERATOR_REGISTRY[name],
  );

  if (validOperators.length === 0) {
    throw new Error('No valid operators provided for composite comparison');
  }

  // Determine maximum input count among operators
  const maxInputCount = Math.max(
    ...validOperators.map((name) => OPERATOR_REGISTRY[name].inputs.length),
  );

  // Build merged input contract
  const mergedInputs: {
    label: string;
    defaultValue: any[];
    type?: 'number' | 'text' | 'object' | 'radio' | 'select';
    hide?: boolean;
  }[] = [];

  for (let i = 0; i < maxInputCount; i++) {
    for (const opName of validOperators) {
      const op = OPERATOR_REGISTRY[opName];
      if (op.inputs[i] && !op.inputs[i].hide) {
        mergedInputs[i] = op.inputs[i];
        break;
      }
    }
  }

  return {
    name: operatorNames.join(' vs '),
    category: 'Comparison',
    description: `Side - by - side comparison of: ${operatorNames.join(', ')}`,
    syntax: 'Compare operators with identical inputs to see the differences',

    inputs: mergedInputs,

    run: (inputs: number[][]) => {
      return new Observable((subscriber) => {
        const subscriptions: Subscription[] = [];
        let completedCount = 0;

        // Emit headers
        validOperators.forEach((opName) => {
          subscriber.next({
            type: 'composite-header',
            operator: opName,
          } as PlaygroundEvent);
        });

        // Execute operators
        validOperators.forEach((opName) => {
          const operator = OPERATOR_REGISTRY[opName];
          if (!operator) return;

          const sub = operator.run(inputs).subscribe({
            next: (event: PlaygroundEvent) => {
              if (typeof event === 'string') {
                subscriber.next(`[${opName}]${event}`);
              } else if (event.type === 'inner') {
                subscriber.next({
                  type: 'inner',
                  label: `[${opName}]${event.label}`,
                } as PlaygroundEvent);
              } else if (event.type === 'value') {
                subscriber.next({
                  type: 'value',
                  value: `[${opName}]${event.value}`,
                } as PlaygroundEvent);
              }
            },
            error: (err) => subscriber.error(err),
            complete: () => {
              completedCount++;
              if (completedCount === validOperators.length) {
                subscriber.complete();
              }
            },
          });

          subscriptions.push(sub);
        });

        return () => subscriptions.forEach((s) => s.unsubscribe());
      });
    },
  };
}
