import { combineLatest, combineLatestAll, concat, delay, interval, map, Observable, of, switchMap, take, tap, Subscription, zip, zipAll, forkJoin, withLatestFrom, merge, concatAll, concatMap, mergeAll, mergeMap, exhaustMap, exhaustAll, mergeScan, pairwise, race, raceWith, startWith, switchAll, buffer, bufferCount, bufferTime, bufferToggle, bufferWhen, expand, groupBy, scan, window, windowTime, windowToggle, windowWhen, windowCount, audit, auditTime, debounce, debounceTime, distinct, distinctUntilChanged, distinctUntilKeyChanged, elementAt, catchError, filter, find, findIndex, first, ignoreElements, endWith, last, sample, sampleTime, single, skip, skipLast, skipUntil, skipWhile, takeLast, takeUntil, takeWhile, throttle, throttleTime, delayWhen, finalize, repeat, repeatWhen, retry, retryWhen, timeout, timeoutWith, toArray, throwIfEmpty, share, shareReplay, connectable, connect, count, max, min, defaultIfEmpty, reduce, every, isEmpty, sequenceEqual, timeInterval, timestamp } from 'rxjs';

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

export const OPERATOR_REGISTRY: Record<string, OperatorDemo> = {
    combineLatest: {
        name: 'combineLatest',
        category: 'Combination',
        description: `Combines the latest values from multiple observables and emits whenever ANY observable emits (only after all have emitted at least once).

How the output behaves depends on:

• emission timing of each observable
• when each observable produces its first value

Example timeline  
(Observable A Interval = 500ms → [1,2,3])  
(Observable B Interval = 500ms → [10,20,30])

Observable A emissions

500   1000   1500
 |      |      |
 1      2      3

Observable B emissions

500   1000   1500
 |      |      |
10     20     30

combineLatest output

(Waits until BOTH emit at least once)

500ms → [1,10]   ← first combined emission

Then emits whenever ANY observable updates:

1000ms → [2,10]  ← A emitted
1000ms → [2,20]  ← B emitted
1500ms → [3,20]  ← A emitted
1500ms → [3,30]  ← B emitted

Final sequence:

[1,10] → [2,10] → [2,20] → [3,20] → [3,30]

Important idea:
combineLatest always emits using the MOST RECENT value from each observable.

This means:
• It waits for all observables to emit at least once
• After that, any new emission triggers an output
• It reuses the last known values from other observables`,
        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

// Combines latest values whenever EITHER observable emits
// Pattern: [1,10] → [2,10] → [3,10] → [3,20] → [3,30]
combineLatest([obs1$, obs2$])
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),
        comparisons: ['combineLatestAll', 'zip', 'zipAll', 'forkJoin', 'withLatestFrom'],

        inputs: [
            { label: 'Observable A', defaultValue: [1, 2, 3] },
            { label: 'Observable A Interval (ms)', defaultValue: [500] },
            { label: 'Observable B', defaultValue: [10, 20, 30] },
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return combineLatest([obs1$, obs2$]).pipe(
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    combineLatestAll: {
        name: 'combineLatestAll',
        category: 'Combination',
        description: `Combines the latest values from multiple INNER observables emitted by a source observable.

⚠️ Important:
combineLatestAll works only after the source observable completes.
It then applies combineLatest on all collected inner observables.

How the output behaves depends on:

• when inner observables are emitted by the source
• when the source completes
• emissions inside each inner observable

Example timeline  
(Source Interval = 1000ms → emits 2 inner observables)

Source emissions (outer observable)

1000        2000
  |            |
 innerA$    innerB$

(innerA$ → [1,2,3])  
(innerB$ → [10,20,30])

⚠️ combineLatestAll waits until source COMPLETES (after 2000ms)

After completion → combineLatest starts on collected inner observables

Inner observable emissions (conceptual)

A: 1   2   3  
   |   |   |

B: 10  20  30  
   |   |   |

combineLatest behavior begins

[1,10] → [2,10] → [3,10] → [3,20] → [3,30]

Important idea:
combineLatestAll first COLLECTS all inner observables, then behaves exactly like combineLatest.

This means:
• No output until the outer observable completes
• After that, it combines latest values from all inner observables
• Emits whenever any inner observable emits (like combineLatest)`,
        comparisons: ['combineLatest', 'zipAll', 'mergeAll', 'concatAll', 'switchAll'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

interval(1000)
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
            { label: 'Inner Observable B', defaultValue: [10, 20, 30] }
        ],

        run: (inputs) => {
            const [aValues, intervalMs, bValues] = inputs;

            const innerA$ = of(...aValues);
            const innerB$ = of(...bValues);

            return interval(intervalMs[0]).pipe(
                take(2),
                map(i => (i === 0 ? innerA$ : innerB$)),
                combineLatestAll(),
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    concat: {
        name: 'concat',
        category: 'Combination',
        description: 'Subscribes to observables one after another sequentially. Waits for EACH observable to complete before subscribing to the next. Great for scenarios like: step 1 finish → step 2 → step 3 or: fetch data → save to cache → show results.',
        comparisons: ['merge', 'switchMap'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;

// First observable emits all, then second comes next
// Output: 1, 2, 3, 10, 20, 30 (in order, never mixed)
concat(of(...aValues), of(...bValues))
  .subscribe(value => console.log(value));
`.trim(),

        inputs: [
            { label: 'Observable A', defaultValue: [1, 2, 3] },
            { label: 'Observable A Interval (ms)', defaultValue: [0], hide: true },
            { label: 'Observable B', defaultValue: [10, 20, 30] },
            { label: 'Observable B Interval (ms)', defaultValue: [0], hide: true }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            return concat(
                of(...aValues),
                of(...bValues)
            ).pipe(
                map(value => String(value))
            );
        }
    },
    concatAll: {
        name: 'concatAll',
        category: 'Combination',
        description: 'Flattens an observable-of-observables by subscribing to each inner observable sequentially. It waits for the CURRENT inner observable to complete before subscribing to the NEXT one. Useful when observables are created dynamically and order must be preserved.',
        comparisons: ['mergeAll', 'switchAll', 'concat'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;

// Outer observable emits inner observables
// concatAll subscribes to them ONE BY ONE
// Output: 1, 2, 3, 10, 20, 30 (never mixed)
of(
  of(...aValues),
  of(...bValues)
)
.pipe(concatAll())
.subscribe(value => console.log(value));
`.trim(),

        inputs: [
            { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
            { label: 'Inner Observable A Interval (ms)', defaultValue: [0], hide: true },
            { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
            { label: 'Inner Observable B Interval (ms)', defaultValue: [0], hide: true }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            return of(
                of(...aValues),
                of(...bValues)
            ).pipe(
                concatAll(),
                map(value => String(value))
            );
        }
    },
    concatMap: {
        name: 'concatMap',
        category: 'Combination',
        description: 'Maps each source value to an inner observable and subscribes to them SEQUENTIALLY.',
        comparisons: ['mergeMap', 'switchMap', 'exhaustMap', 'concatAll'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

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
            { label: 'Inner Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [
                sourceValues,
                sourceIntervalArr,
                innerValues,
                innerIntervalArr
            ] = inputs;

            const sourceInterval = sourceIntervalArr[0];
            const innerInterval = innerIntervalArr[0];

            return interval(sourceInterval).pipe(
                take(sourceValues.length),
                concatMap((_, index) =>
                    interval(innerInterval).pipe(
                        take(innerValues.length),
                        map(i => `inner-${index + 1}: ${innerValues[i]}`)
                    )
                ),
                map(String)
            );
        }
    },
    exhaustAll: {
        name: 'exhaustAll',
        category: 'Combination',
        description: 'Flattens an observable-of-observables while ignoring new inner observables until the current one completes.',
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
            { label: 'Inner Observable B Interval (ms)', defaultValue: [100] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const inner1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const inner2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return of(inner1$, inner2$).pipe(
                exhaustAll(),
                map(v => String(v))
            );
        }
    },
    exhaustMap: {
        name: 'exhaustMap',
        category: 'Transformation',
        description: 'Ignores new source emissions while an inner observable is active.',
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
            { label: 'Inner Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [
                sourceValues,
                sourceIntervalArr,
                innerValues,
                innerIntervalArr
            ] = inputs;

            const sourceInterval = sourceIntervalArr[0];
            const innerInterval = innerIntervalArr[0];

            return interval(sourceInterval).pipe(
                take(sourceValues.length),
                exhaustMap((_, index) =>
                    interval(innerInterval).pipe(
                        take(innerValues.length),
                        map(i => `inner-${index + 1}: ${innerValues[i]}`)
                    )
                ),
                map(String)
            );
        }
    },
    forkJoin: {
        name: 'forkJoin',
        category: 'Combination',
        description: '⚠️ EMITS ONLY ONCE! Waits for ALL observables to COMPLETE, then emits the LAST value from each. Perfect for: parallel API requests that all need to finish before proceeding. Unlike combineLatest, it never re-emits even if values change.',
        comparisons: ['combineLatest', 'zip'],
        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

// Waits for BOTH to complete, then emits ONCE: [3, 30]
// obs1$ completes first with value 3
// obs2$ completes last with value 30
// Result: only one emission with the final values
forkJoin([obs1$, obs2$])
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),

        inputs: [
            { label: 'Observable A', defaultValue: [1, 2, 3] },
            { label: 'Observable A Interval (ms)', defaultValue: [300] },
            { label: 'Observable B', defaultValue: [10, 20, 30] },
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return forkJoin([obs1$, obs2$]).pipe(
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    merge: {
        name: 'merge',
        category: 'Combination',
        description: 'Subscribes to all provided observables IMMEDIATELY and merges their emissions into a single stream. Values can interleave and order is NOT guaranteed. Best for parallel, independent tasks.',
        comparisons: ['concat', 'mergeAll', 'switchMap'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

// Both observables run in parallel
// Output may interleave depending on timing
merge(
  interval(aInterval).pipe(take(aValues.length), map(i => aValues[i])),
  interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]))
)
.subscribe(value => console.log(value));
`.trim(),

        inputs: [
            { label: 'Observable A', defaultValue: [1, 2, 3] },
            { label: 'Observable A Interval (ms)', defaultValue: [300] },
            { label: 'Observable B', defaultValue: [10, 20, 30] },
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return merge(obs1$, obs2$).pipe(
                map(value => String(value))
            );
        }
    },
    mergeAll: {
        name: 'mergeAll',
        category: 'Combination',
        description: 'Flattens an observable-of-observables by subscribing to ALL inner observables immediately. Emissions from inner observables can interleave. Use when order does not matter and maximum concurrency is desired.',
        comparisons: ['concatAll', 'switchAll', 'merge', 'concatMap'],

        syntax: `
const aValues = $INPUT_0_ARRAY;
const bValues = $INPUT_2_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bInterval = $INPUT_3_VALUE;

// Outer observable emits inner observables
// mergeAll subscribes to ALL inner observables immediately
of(
  interval(aInterval).pipe(take(aValues.length), map(i => aValues[i])),
  interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]))
)
.pipe(mergeAll())
.subscribe(value => console.log(value));
`.trim(),

        inputs: [
            { label: 'Inner Observable A', defaultValue: [1, 2, 3] },
            { label: 'Inner Observable A Interval (ms)', defaultValue: [300] },
            { label: 'Inner Observable B', defaultValue: [10, 20, 30] },
            { label: 'Inner Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            return of(
                interval(aInterval[0]).pipe(
                    take(aValues.length),
                    map(i => aValues[i])
                ),
                interval(bInterval[0]).pipe(
                    take(bValues.length),
                    map(i => bValues[i])
                )
            ).pipe(
                mergeAll(),
                map(value => String(value))
            );
        }
    },
    mergeMap: {
        name: 'mergeMap',
        category: 'Transformation',
        description: 'Maps each source value to an inner observable and subscribes to ALL inner observables immediately. Inner observables run in PARALLEL and their emissions may interleave. Order is NOT guaranteed.',
        comparisons: ['concatMap', 'switchMap', 'exhaustMap', 'mergeAll'],

        syntax: `
const sourceValues = $INPUT_0_ARRAY;
const innerValues = $INPUT_2_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const innerInterval = $INPUT_3_VALUE;

// Each source value creates an inner observable
// mergeMap runs ALL inner observables in parallel
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
  .subscribe(value => console.log(value));

// Output (interleaved):
// 10, 10, 10, 20, 20, 20, 30, 30, 30 (order may vary)
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3] },
            { label: 'Source Interval (ms)', defaultValue: [200] },
            { label: 'Inner Values', defaultValue: [10, 20, 30] },
            { label: 'Inner Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [
                sourceValues,
                sourceIntervalArr,
                innerValues,
                innerIntervalArr
            ] = inputs;

            const sourceInterval = sourceIntervalArr[0];
            const innerInterval = innerIntervalArr[0];

            return interval(sourceInterval).pipe(
                take(sourceValues.length),
                mergeMap((_, index) =>
                    interval(innerInterval).pipe(
                        take(innerValues.length),
                        map(i => `inner-${index + 1}: ${innerValues[i]}`)
                    )
                ),
                map(String)
            );
        }
    },
    mergeScan: {
        name: 'mergeScan',
        category: 'Combination',
        description: 'Accumulates values asynchronously by merging inner observables.',
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
            { label: 'Source Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, intervalMs] = inputs;

            return interval(intervalMs[0]).pipe(
                take(values.length),
                map(i => values[i]),
                mergeScan((acc, v) => of(acc + v), 0),
                map(v => String(v))
            );
        }
    },
    pairwise: {
        name: 'pairwise',
        category: 'Combination',
        description: 'Emits the previous and current values together as a pair.',
        comparisons: ['scan'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
.pipe(pairwise())
.subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4] },
            { label: 'Source Interval (ms)', defaultValue: [0], hide: true }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                pairwise(),
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    race: {
        name: 'race',
        category: 'Combination',
        description: 'Subscribes to multiple observables but mirrors only the first one that emits.',
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
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return race(obs1$, obs2$).pipe(
                map(v => String(v))
            );
        }
    },
    raceWith: {
        name: 'raceWith',
        category: 'Combination',
        description: `Competes with other observables and mirrors the one that emits first.

⚠️ Why does raceWith exist when we already have race?

RxJS provides two API styles:

1️⃣ Creation function
race(obs1$, obs2$)

2️⃣ Pipeable operator
obs1$.pipe(raceWith(obs2$))

Both behave the same — the observable that emits first wins.  
The difference is only **where the operator is used**.

race() is used when creating a new observable from multiple sources.  
raceWith() is used inside an existing pipe chain.

Example:

race(obs1$, obs2$)

vs

obs1$.pipe(raceWith(obs2$))

This design keeps RxJS operators consistent with others like:
merge / mergeWith
concat / concatWith`,
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
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return obs1$.pipe(
                raceWith(obs2$),
                map(v => String(v))
            );
        }
    },
    startWith: {
        name: 'startWith',
        category: 'Combination',
        description: 'Emits the specified values before the source observable starts emitting.',
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
            { label: 'Source Interval (ms)', defaultValue: [0], hide: true }
        ],

        run: (inputs) => {
            const [startValues, , sourceValues] = inputs;

            return of(...sourceValues).pipe(
                startWith(...startValues),
                map(v => String(v))
            );
        }
    },
    switchAll: {
        name: 'switchAll',
        category: 'Combination',
        description: 'Flattens an observable-of-observables by switching to the latest inner observable.',
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
            { label: 'Inner Observable B Interval (ms)', defaultValue: [200] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const inner1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const inner2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return interval(1000).pipe(
                take(2),
                map(i => i === 0 ? inner1$ : inner2$),
                switchAll(),
                map(v => String(v))
            );
        }
    },
    switchMap: {
        name: 'switchMap',
        category: 'Transformation',
        description: 'Maps each source value to an inner observable and CANCELS the previous one.',
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
            { label: 'Inner Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [
                sourceValues,
                sourceIntervalArr,
                innerValues,
                innerIntervalArr
            ] = inputs;

            const sourceInterval = sourceIntervalArr[0];
            const innerInterval = innerIntervalArr[0];

            return interval(sourceInterval).pipe(
                take(sourceValues.length),
                switchMap((_, index) =>
                    interval(innerInterval).pipe(
                        take(innerValues.length),
                        map(i => `inner-${index + 1}: ${innerValues[i]}`)
                    )
                ),
                map(String)
            );
        }
    },
    withLatestFrom: {
        name: 'withLatestFrom',
        category: 'Combination',
        description: 'Emits ONLY when the SOURCE observable emits, but always includes the latest values from other observables. ⚠️ Key difference from combineLatest: It doesn\'t emit when other observables emit - ONLY when SOURCE emits. Unlike zip, it doesn\'t wait for both to emit together.',
        comparisons: ['combineLatest', 'zip'],
        syntax: `
const sourceValues = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const otherValues = $INPUT_2_ARRAY;
const otherInterval = $INPUT_3_VALUE;

// SOURCE observable: Drives WHEN emissions happen
const source$ = interval(sourceInterval).pipe(take(sourceValues.length), map(i => sourceValues[i]));

// OTHER observable: Provides values, but doesn't control emission timing
const other$ = interval(otherInterval).pipe(take(otherValues.length), map(i => otherValues[i]));

// withLatestFrom emits ONLY when source$ emits
// At that moment, it grabs the most recent value from other$
source$.pipe(
  withLatestFrom(other$),
  map(([s, o]) => console.log(s, o))  // Always pairs: [source value, latest other value]
).subscribe();

// Behavior:
// - When source emits → output happens (using latest from other)
// - When other emits alone → NO output (source didn't emit!)
// - Emission frequency follows source, not other
`.trim(),

        inputs: [
            { label: 'Source Observable', defaultValue: [1, 2, 3] },
            { label: 'Source Interval (ms)', defaultValue: [500] },
            { label: 'Other Observable', defaultValue: [100, 200, 300] },
            { label: 'Other Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [sourceValues, sourceInterval, otherValues, otherInterval] = inputs;

            const source$ = interval(sourceInterval[0]).pipe(
                take(sourceValues.length),
                map(i => sourceValues[i])
            );

            const other$ = interval(otherInterval[0]).pipe(
                take(otherValues.length),
                map(i => otherValues[i])
            );

            return source$.pipe(
                withLatestFrom(other$),
                map(([s, o]) => `[${s}, ${o}]`)
            );
        }
    },
    zip: {
        name: 'zip',
        category: 'Combination',
        description: 'Takes multiple observables as direct arguments and combines values. Waits for each observable to emit before combining. ⚠️ The key insight: zip emits at the pace of the SLOWEST observable. Notice obs2$ (500ms) is slower than obs1$ (300ms), so zip waits for obs2$ every time.',
        comparisons: ['zipAll', 'combineLatest', 'combineLatestAll', 'forkJoin'],
        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

const obs1$ = interval(aInterval).pipe(take(aValues.length), map(i => aValues[i]));
const obs2$ = interval(bInterval).pipe(take(bValues.length), map(i => bValues[i]));

// zip waits for BOTH observables before emitting
// Result: emissions happen at 500ms pace (the slower one)
zip(obs1$, obs2$)
  .subscribe(([a, b]) => console.log(a, b));
`.trim(),

        inputs: [
            { label: 'Observable A', defaultValue: [1, 2, 3] },
            { label: 'Observable A Interval (ms)', defaultValue: [300] },
            { label: 'Observable B', defaultValue: [10, 20, 30] },
            { label: 'Observable B Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [aValues, aInterval, bValues, bInterval] = inputs;

            const obs1$ = interval(aInterval[0]).pipe(
                take(aValues.length),
                map(i => aValues[i])
            );

            const obs2$ = interval(bInterval[0]).pipe(
                take(bValues.length),
                map(i => bValues[i])
            );

            return zip(obs1$, obs2$).pipe(
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    zipAll: {
        name: 'zipAll',
        category: 'Combination',
        description: 'Works with observables-of-observables. Use when you have a source that emits observables dynamically (unknown count at compile time). ⚠️ Key difference from zip: The observables themselves are emitted over time (1500ms intervals), whereas zip expects observables upfront. This shows a realistic scenario: async tasks are created dynamically.',
        comparisons: ['zip', 'combineLatestAll', 'mergeAll'],
        syntax: `
const aValues = $INPUT_0_ARRAY;
const aInterval = $INPUT_1_VALUE;
const bValues = $INPUT_2_ARRAY;
const bInterval = $INPUT_3_VALUE;

// OUTER SOURCE: Emits observables at 1500ms intervals (dynamically)
// This simulates tasks being created over time
const taskStream$ = interval(aInterval).pipe(
  take(2),
  map(i =>
    // INNER OBSERVABLE: Each emits values at 300ms intervals
    interval(bInterval).pipe(
      take(i === 0 ? aValues.length : bValues.length),
      map(j => i === 0 ? aValues[j] : bValues[j])
    )
  )
);

// zipAll combines inner observables using zip logic
// Notice timing is different from zip - observables arrive dynamically!
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
                map(i =>
                    interval(bInterval[0]).pipe(
                        take(i === 0 ? aValues.length : bValues.length),
                        map(j => i === 0 ? aValues[j] : bValues[j])
                    )
                ),
                zipAll(),
                map(([a, b]) => `[${a}, ${b}]`)
            );
        }
    },
    buffer: {
        name: 'buffer',
        category: 'Transformation',
        description: 'Collects values emitted by the source until another observable emits, then emits them as an array.',

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
            { label: 'Buffer Close Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, closeInterval] = inputs;

            const source$ = interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i])
            );

            const closing$ = interval(closeInterval[0]);

            return source$.pipe(
                buffer(closing$),
                map(v => `[${v.join(', ')}]`)
            );
        }
    },
    bufferCount: {
        name: 'bufferCount',
        category: 'Transformation',
        description: 'Collects values in fixed-size arrays before emitting them.',
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
            { label: 'Buffer Size', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, count] = inputs;

            return of(...values).pipe(
                bufferCount(count[0]),
                map(v => `[${v.join(', ')}]`)
            );
        }
    },
    bufferTime: {
        name: 'bufferTime',
        category: 'Transformation',
        description: `Collects values emitted during a fixed time window and emits them together as an array.

How the output behaves depends on the relationship between:

• source emission interval
• bufferTime duration

Example timeline (Source Interval = 300ms, Buffer Time = 600ms)

Source emissions

300   600   900   1200   1500
 |     |     |      |      |
 1     2     3      4      5

Buffer windows

0---------600
          600---------1200
                      1200---------1800

Values collected in each window

[1]
[2,3,4]
[5]

Important idea:
bufferTime closes buffers based purely on time, not on the number of values.

This means buffers can contain:
• many values
• few values
• sometimes even be empty.`,
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
            { label: 'Buffer Time (ms)', defaultValue: [600] }
        ],

        run: (inputs) => {
            const [values, intervalMs, bufferMs] = inputs;

            return interval(intervalMs[0]).pipe(
                take(values.length),
                map(i => values[i]),
                bufferTime(bufferMs[0]),
                map(v => `[${v.join(', ')}]`)
            );
        }
    },
    bufferToggle: {
        name: 'bufferToggle',
        category: 'Transformation',
        description: `Creates buffers that open and close based on two separate observables.

• When the "opening observable" emits → a new buffer starts collecting values.
• The closing selector creates another observable that decides when that buffer closes.

Important idea:
Each time an opening event occurs, a new buffer starts collecting values.
That buffer closes when the closing observable emits.

Example timeline (with default inputs):

Source emits every 300ms

300   600   900   1200   1500   1800
 |     |     |      |      |      |
 1     2     3      4      5      6

Buffer opens at 1000ms
Buffer closes 500ms later

          open
           ↓
300   600   900   1000   1200   1500
 |     |     |      |      |      |
 1     2     3      |      4      5
                    |------buffer------|
                           close

Result:
[4,5]

This operator is useful when buffers need to start and stop dynamically based on events.`,

        comparisons: ['buffer', 'bufferWhen'],

        syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const openInterval = $INPUT_2_VALUE;
const closeInterval = $INPUT_3_VALUE;

// SOURCE emits actual values
const source$ = interval(sourceInterval).pipe(
  take(values.length),
  map(i => values[i])
);

// OPENING observable decides when buffers start
const openings$ = interval(openInterval);

// Each opening creates a new buffer
// That buffer will close after closeInterval
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
            { label: 'Buffer Close Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, openInterval, closeInterval] = inputs;

            const source$ = interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i])
            );

            const openings$ = interval(openInterval[0]);

            return source$.pipe(
                bufferToggle(openings$, () => interval(closeInterval[0])),
                map(v => `[${v.join(', ')}]`)
            );
        }
    },
    bufferWhen: {
        name: 'bufferWhen',
        category: 'Transformation',
        description: `Collects values into a buffer and closes the buffer when a dynamically created closing observable emits.

How it works:

• A new buffer starts immediately.
• The closingSelector function returns an observable.
• When that observable emits → the current buffer closes and its values are emitted.
• After closing, a new buffer automatically starts.

Important idea:
bufferWhen controls *when buffers close*, not when they open.

Example timeline (Source Interval = 300ms, Buffer Close Interval = 1000ms)

Source emissions

300   600   900   1200  1500
 |     |     |     |     |
 1     2     3     4     5

Buffer lifecycle

0-----------1000
1000-----------2000

Values collected

[1,2,3]
[4,5]

bufferWhen is useful when you want buffers to close based on events such as timers, clicks, or other observable signals.`,
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
            { label: 'Buffer Close Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, closeInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                bufferWhen(() => interval(closeInterval[0])),
                map(v => `[${v.join(', ')}]`)
            );
        }
    },
    expand: {
        name: 'expand',
        category: 'Transformation',

        description: `Recursively projects each emitted value into a new observable.

expand works by feeding every emitted value back into the projection function.

Example rule

value → value + 2

Expansion process

Start value
1

Projection generates next values

1 → 3
3 → 5
5 → 7

Because each emitted value is processed again, the stream keeps expanding.

Result (with take)

1, 3, 5, 7, 9

Common real-world uses

• Fetch paginated API data (load page → load next page)
• Traverse hierarchical structures like folder trees
• Repeat asynchronous tasks until a condition is met

expand continues indefinitely unless limited with operators like take() or takeWhile().`,

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
            { label: 'Take Count', defaultValue: [5] }
        ],

        run: (inputs) => {
            const [start, increment, takeCount] = inputs;

            return of(start[0]).pipe(
                expand(v => of(v + increment[0])),
                take(takeCount[0]),
                map(v => String(v))
            );
        }
    },
    groupBy: {
        name: 'groupBy',
        category: 'Transformation',
        description: `Splits a single observable into multiple grouped observables based on a key.

groupBy works like the SQL "GROUP BY" operation but for streams.

Each emitted value is assigned to a group using a key selector function.
Values with the same key are emitted through the same grouped observable.

Important idea:
Instead of transforming values, groupBy splits one stream into many smaller streams.

Example

Source values

1, 2, 3, 4, 5

Grouping rule

value % 2 === 0 ? 'even' : 'odd'

Groups created

odd  → 1, 3, 5  
even → 2, 4

Each group is a separate observable that emits values belonging to that key.

Common real-world uses

• Processing logs grouped by log level (INFO, ERROR, WARN)
• Handling chat messages grouped by room or user
• Processing orders grouped by customer
• Analyzing IoT sensor data grouped by device ID

groupBy is useful when different categories of events need to be processed independently.`,
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

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                groupBy(v => v % 2 === 0 ? 'even' : 'odd'),
                mergeMap(group => group.pipe(
                    map(v => group.key + ": " + v)
                ))
            );
        }
    },
    map: {
        name: 'map',
        category: 'Transformation',
        description: 'Transforms each value emitted by the source observable into a new value. Unlike concatMap / mergeMap / switchMap, map does NOT create inner observables — it performs a simple synchronous transformation.',
        comparisons: ['concatMap', 'mergeMap', 'switchMap', 'exhaustMap'],

        syntax: `
const sourceValues = $INPUT_0_ARRAY;
const mapValues = $INPUT_2_ARRAY;

// map transforms values directly
// No inner observables, no concurrency, no cancellation
of(...sourceValues)
  .pipe(
    map((_, index) => mapValues[index])
  )
  .subscribe(value => console.log(value));

// Output:
// 10 → 20 → 30
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3] },
            { label: 'Source Interval (ms)', defaultValue: [0], hide: true },
            { label: 'Mapped Values', defaultValue: [10, 20, 30] },
            { label: 'Inner Interval (ms)', defaultValue: [0], hide: true }
        ],

        run: (inputs) => {
            const [sourceValues, sourceInterval, mapValues] = inputs;

            return of(...sourceValues).pipe(
                map((_, index) =>
                    mapValues[index % mapValues.length]
                ),
                map(value => String(value))
            );
        }
    },
    scan: {
        name: 'scan',
        category: 'Transformation',
        description: `Accumulates values over time and emits each intermediate result.

scan works like a running total. Every new value is combined with the previous
accumulated result to produce the next value.

Example

Source values
1, 2, 3, 4

Running accumulation
1
1 + 2 = 3
3 + 3 = 6
6 + 4 = 10

Emitted values
1, 3, 6, 10

Important difference from mergeScan

scan → accumulator returns a value
mergeScan → accumulator returns an observable

scan is used for synchronous state accumulation,
while mergeScan is used when the accumulation involves asynchronous work
(like HTTP requests or delayed operations).`,
        comparisons: ['reduce'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
.pipe(
scan((acc, v) => acc + v, 0)
)
.subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                scan((acc, v) => acc + v, 0),
                map(v => String(v))
            );
        }
    },
    window: {
        name: 'window',
        category: 'Transformation',
        description: `Splits the source stream into multiple smaller observables called windows.

Each window collects values for a period of time and emits them as a separate observable.

Important idea:
window does NOT emit arrays like buffer.
Instead, it emits new observables that contain the grouped values.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Windows created every 1000ms

Window 1 (0–1000ms) → 1, 2, 3  
Window 2 (1000–2000ms) → 4, 5

Each window is its own observable stream.

Difference from buffer

buffer → emits arrays
[1,2,3]

window → emits observables
window1$: 1,2,3

window is useful when each group of events needs to be processed as a separate stream.`,
        comparisons: ['buffer'],

        syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const windowInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    window(interval(windowInterval))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Source Interval (ms)', defaultValue: [300] },
            { label: 'Window Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, windowInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                window(interval(windowInterval[0])),
                mergeMap((win$, i) =>
                    win$.pipe(
                        map(v => `Window ${i + 1}: ${v}`)
                    )
                )
            );
        }
    },
    windowCount: {
        name: 'windowCount',
        category: 'Transformation',
        description: `Splits the source stream into windows containing a fixed number of values.

Each window collects a specified number of emitted values from the source
and then completes. A new window immediately starts collecting the next values.

Example

Source values
1, 2, 3, 4, 5

Window size
2

Windows created

Window 1 → 1, 2  
Window 2 → 3, 4  
Window 3 → 5

Each window is emitted as its own observable stream.

Difference from bufferCount

bufferCount → emits arrays
[1,2]

windowCount → emits observables
window1$: 1,2

windowCount is useful when events need to be processed in groups of
a fixed size as independent streams.`,
        comparisons: ['bufferCount'],

        syntax: `
const values = $INPUT_0_ARRAY;
const count = $INPUT_1_VALUE;

of(...values)
  .pipe(
    windowCount(count)
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Window Size', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, count] = inputs;

            return of(...values).pipe(
                windowCount(count[0]),
                mergeMap((win$, i) =>
                    win$.pipe(
                        map(v => `Window ${i + 1}: ${v}`)
                    )
                )
            );
        }
    },
    windowTime: {
        name: 'windowTime',
        category: 'Transformation',
        description: `Splits the source stream into multiple time-based windows.

Each window collects values emitted during a fixed time duration and emits them
as a separate observable.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Window duration
1000ms

Windows created

Window 1 (0–1000ms) → 1, 2, 3  
Window 2 (1000–2000ms) → 4, 5

Each window is its own observable stream.

Difference from similar operators

window → windows are controlled by another observable
Example: window(click$) or window(interval(1000))

windowTime → windows are controlled by time
Example: windowTime(1000)

bufferTime → similar to windowTime but emits arrays instead of observables

bufferTime output
[1,2,3]

windowTime output
window1$: 1,2,3

windowTime is useful when events need to be processed in fixed time intervals
like clicks per second, logs per minute, or sensor readings per time window.`,
        comparisons: ['bufferTime'],

        syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const windowTimeMs = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    windowTime(windowTimeMs)
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Source Interval (ms)', defaultValue: [300] },
            { label: 'Window Time (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, windowTimeMs] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                windowTime(windowTimeMs[0]),
                mergeMap((win$, i) =>
                    win$.pipe(map(v => `Window ${i + 1}: ${v}`))
                )
            );
        }
    },
    windowToggle: {
        name: 'windowToggle',
        category: 'Transformation',
        description: `Creates windows that open and close based on signals from other observables.

When the "opening observable" emits, a new window starts collecting values
from the source stream.

Each window remains open until the "closing observable" emits, after which
the window completes and a new one can open later.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5, 6

Window opens every 1000ms  
Each window stays open for 500ms

Timeline

1000ms → window opens  
1500ms → window closes

Values emitted during this period

Window 1 → 4, 5

Each window is emitted as its own observable stream.

Difference from bufferToggle

bufferToggle → emits arrays of collected values
Example output
[2,3]

windowToggle → emits observables containing the values
Example output
window1$: 2,3

windowToggle is useful when each collected group of events needs to be
processed as its own stream rather than as a simple array.`,
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
    windowToggle(interval(openInterval), () => interval(closeInterval))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5, 6] },
            { label: 'Source Interval (ms)', defaultValue: [300] },
            { label: 'Window Open Interval (ms)', defaultValue: [1000] },
            { label: 'Window Close Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, openInterval, closeInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                windowToggle(interval(openInterval[0]), () => interval(closeInterval[0])),
                mergeMap((win$, i) =>
                    win$.pipe(map(v => `Window ${i + 1}: ${v}`))
                )
            );
        }
    },
    windowWhen: {
        name: 'windowWhen',
        category: 'Transformation',
        description: `Splits the source stream into sequential windows that close
whenever the closing observable emits.

A new window starts immediately after the previous one closes.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Closing signal every 1000ms

Timeline

Window 1 (0–1000ms) → 1, 2, 3  
Window 2 (1000–2000ms) → 4, 5

Each window is emitted as its own observable stream.

Difference from bufferWhen

bufferWhen → emits arrays
[1,2,3]

windowWhen → emits observables
window1$: 1,2,3

windowWhen is useful when each group of events needs to be processed
as its own stream instead of being collected into arrays.`,
        comparisons: ['bufferWhen'],

        syntax: `
const values = $INPUT_0_ARRAY;
const sourceInterval = $INPUT_1_VALUE;
const closeInterval = $INPUT_2_VALUE;

interval(sourceInterval)
  .pipe(
    take(values.length),
    map(i => values[i]),
    windowWhen(() => interval(closeInterval))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Source Interval (ms)', defaultValue: [300] },
            { label: 'Window Close Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, closeInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                windowWhen(() => interval(closeInterval[0])),
                mergeMap((win$, i) =>
                    win$.pipe(map(v => `Window ${i + 1}: ${v}`))
                )
            );
        }
    },
    audit: {
        name: 'audit',
        category: 'Filtering',
        description: `Ignores source values for a duration, then emits the most recent value
when the duration observable completes.

When the source emits a value, audit starts a duration timer.
While the timer is running, all incoming values are ignored.
When the timer ends, the latest value received during that time is emitted.

Source values emitted every 300ms
1, 2, 3, 4, 5

Audit duration
1000ms

Timeline

300ms → 1 arrives → start audit timer

Values during the next 1000ms
2, 3, 4

1300ms → emit latest value → 4

Next cycle

1200ms → 4 arrives → start new timer
Values during the next 1000ms
5

Emit latest value → 5

Output
4, 5

Difference from similar operators

debounceTime → waits for silence before emitting  
throttleTime → emits first value and ignores the rest  
audit → waits, then emits the latest value at the end of the duration

audit is useful when you want periodic updates with the most recent value.`,
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
            { label: 'Audit Duration (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, auditDuration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                audit(() => interval(auditDuration[0])),
                map(v => String(v))
            );
        }
    },
    auditTime: {
        name: 'auditTime',
        category: 'Filtering',
        description: `Ignores source values for a fixed duration, then emits the most
recent value once the duration ends.

When a value arrives, auditTime starts a timer. While the timer is running,
incoming values are ignored. When the timer completes, the latest value seen
during that period is emitted.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Audit duration
1000ms

Timeline

300ms → 1 arrives → start timer

Values during the next 1000ms
2, 3, 4

1300ms → emit latest value → 4

Next cycle

1200ms → 4 arrives → start timer
Values during the next 1000ms
5

Emit latest value → 5

Output
4, 5

Difference from audit

audit → duration controlled by another observable  
auditTime → duration controlled directly by time

Example

audit(() => interval(1000))  
auditTime(1000)

auditTime is useful when you want periodic updates using the latest value.`,
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
            { label: 'Audit Duration (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, auditDuration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                auditTime(auditDuration[0]),
                map(v => String(v))
            );
        }
    },
    debounce: {
        name: 'debounce',
        category: 'Filtering',
        description: `Delays emitting a value until a duration observable completes.
If a new value arrives before the duration ends, the previous value is discarded.

Each time the source emits, debounce starts a duration observable.
If another value arrives before that duration finishes, the previous value is ignored.
Only the latest value that survives the duration is emitted.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Debounce duration
1000ms

Timeline

300ms → 1 arrives → start timer  
600ms → 2 arrives → reset timer  
900ms → 3 arrives → reset timer  
1200ms → 4 arrives → reset timer  
1500ms → 5 arrives → reset timer  

The source completes immediately after emitting 5.
When the source completes, debounce emits the last pending value immediately.

Output
5

Difference from similar operators

debounce → duration controlled by another observable  
debounceTime → duration controlled directly by time

Example

debounce(() => interval(1000))  
debounceTime(1000)

debounce is commonly used for scenarios like search input where
you only want to process the latest value after the user stops typing.

Note:
If the source observable completes while a value is waiting to be emitted,
debounce immediately emits the last pending value instead of waiting
for the full duration.

Special behavior:
If the source completes while a value is waiting for the debounce
duration to finish, the last value is emitted immediately.`,
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
            { label: 'Debounce Duration (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, debounceDuration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                debounce(() => interval(debounceDuration[0])),
                map(v => String(v))
            );
        }
    },
    debounceTime: {
        name: 'debounceTime',
        category: 'Filtering',
        description: `Delays emitting a value until a specified time has passed without any new values.

Each time the source emits, debounceTime starts a timer. If another value arrives
before the timer finishes, the previous value is discarded and the timer resets.
Only the latest value that survives the full time duration is emitted.

Example

Source values emitted every 300ms
1, 2, 3, 4, 5

Debounce duration
1000ms

Timeline

300ms → 1 arrives → start timer  
600ms → 2 arrives → reset timer  
900ms → 3 arrives → reset timer  
1200ms → 4 arrives → reset timer  
1500ms → 5 arrives → reset timer  

If no new value arrives after 5, debounceTime would normally wait 1000ms
before emitting the latest value.

However, in this demo the source completes immediately after emitting 5.
When the source completes, debounceTime emits the last pending value immediately.

Output
5

Difference from debounce

debounce → duration controlled by another observable  
Example: debounce(() => interval(1000))

debounceTime → duration controlled directly by time  
Example: debounceTime(1000)

Both operators wait for a pause in the source stream before emitting the latest value.`,
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
            { label: 'Debounce Duration (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, debounceDuration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                debounceTime(debounceDuration[0]),
                map(v => String(v))
            );
        }
    },
    distinct: {
        name: 'distinct',
        category: 'Filtering',
        description: `Emits only values that have not been emitted before.

When a value appears for the first time, it is emitted.
If the same value appears again later in the stream, it is ignored.

Example

Source values
1, 2, 2, 3, 1, 4

Processing

1 → first time → emit  
2 → first time → emit  
2 → already seen → ignore  
3 → first time → emit  
1 → already seen → ignore  
4 → first time → emit  

Output
1, 2, 3, 4

Difference from distinctUntilChanged

distinct → removes duplicates across the entire stream  
distinctUntilChanged → removes only consecutive duplicates

Example

Source
1,2,2,3,1

distinct output
1,2,3

distinctUntilChanged output
1,2,3,1`,
        comparisons: ['distinctUntilChanged'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    distinct()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 2, 3, 1, 4] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                distinct(),
                map(v => String(v))
            );
        }
    },
    distinctUntilChanged: {
        name: 'distinctUntilChanged',
        category: 'Filtering',
        description: `Emits values only when they are different from the previous value.

If the current value is the same as the last emitted value, it is ignored.
Only changes in value are allowed through.

Example

Source values
1, 1, 2, 2, 3, 1

Processing

1 → first value → emit  
1 → same as previous → ignore  
2 → changed → emit  
2 → same as previous → ignore  
3 → changed → emit  
1 → changed → emit  

Output
1, 2, 3, 1

Difference from distinct

distinct → removes duplicates across the entire stream  
distinctUntilChanged → removes only consecutive duplicates

Example

Source
1,2,2,3,1

distinct output
1,2,3

distinctUntilChanged output
1,2,3,1`,
        comparisons: ['distinct'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    distinctUntilChanged()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 1, 2, 2, 3, 1] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                distinctUntilChanged(),
                map(v => String(v))
            );
        }
    },
    distinctUntilKeyChanged: {
        name: 'distinctUntilKeyChanged',
        category: 'Filtering',
        description: `Emits values only when the specified key changes compared to the previous value.

This operator is useful when working with objects and you only want to check
changes for a specific property.

If two consecutive objects have the same value for the selected key,
the later one is ignored.

Example

Source values
{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }

Using key
"id"

Processing

{ id:1 } → first value → emit  
{ id:1 } → same id as previous → ignore  
{ id:2 } → id changed → emit  
{ id:2 } → same id → ignore  
{ id:3 } → id changed → emit  

Output
{ id:1 }, { id:2 }, { id:3 }

Difference from similar operators

distinct → removes duplicates across the entire stream  
distinctUntilChanged → compares entire values  
distinctUntilKeyChanged → compares only one property (key)`,
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
                label: 'Source Values', defaultValue: [
                    '{"id":1}',
                    '{"id":1}',
                    '{"id":2}',
                    '{"id":2}',
                    '{"id":3}'
                ],
                type: 'object'
            }
        ],

        run: (inputs) => {
            const [values] = inputs;

            const parsed = values.map(v => {
                try {
                    return JSON.parse(v);
                } catch {
                    return { id: v };
                }
            });

            return of(...parsed).pipe(
                distinctUntilKeyChanged('id'),
                map(v => JSON.stringify(v))
            );
        }
    },
    elementAt: {
        name: 'elementAt',
        category: 'Filtering',
        description: `Emits only the value at a specified index from the source observable.

WHEN TO USE:
Use this when you only need a specific position from a stream.

REAL EXAMPLES:
• Get 2nd item from API result
• Pick a specific event from a sequence
• Extract one value from ordered emissions

KEY IDEA:
Zero-based index → elementAt(0) = first value

IMPORTANT:
• Emits only ONE value
• Throws error if index does not exist (unless default provided)`,

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
            { label: 'Index', defaultValue: [1] }
        ],

        run: (inputs) => {
            const [values, indexArr] = inputs;

            const index = Number(indexArr[0]);

            return of(...values).pipe(
                elementAt(index),
                map(v => String(v)),
                catchError(err => of('❌ Index out of range'))
            );
        }
    },
    filter: {
        name: 'filter',
        category: 'Filtering',
        description: `Allows only values that match a condition to pass through.

WHEN TO USE:
Use this when you want to remove unwanted values from a stream.

REAL EXAMPLES:
• Show only even numbers
• Filter successful API responses (status === 200)
• Allow only valid form inputs
• Show only active users

KEY IDEA:
Think of it like an "if condition" for streams.
Only values that return TRUE are emitted.`,

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
                    { label: 'Less Than', value: 'lessThan' }
                ],
                type: 'select'
            },
            {
                label: 'Compare Value (for greaterThan or lessThan)',
                defaultValue: [3]
            }
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
                map(v => String(v)),
                catchError(err => of('❌ Invalid filter type'))
            );
        }
    },
    find: {
        name: 'find',
        category: 'Filtering',

        description: `Emits the FIRST value that matches what you are looking for, then completes.

Think of it like:
👉 "Find this value in the stream"

HOW IT WORKS:
• Goes through values one by one
• If value matches → emit it
• Stops immediately after finding

IMPORTANT:
• Emits only ONE value
• If not found → emits Not found

Example

Source values
1, 2, 3, 4, 5

Find value
3

Processing

1 → not match  
2 → not match  
3 → match → emit and complete  

Output
3`,

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
            { label: 'Value to Find', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, findArr] = inputs;

            const valueToFind = Number(findArr[0]);

            return of(...values).pipe(
                find(v => v === valueToFind),
                map(v => v !== undefined ? String(v) : 'Not found')
            );
        }
    },
    findIndex: {
        name: 'findIndex',
        category: 'Filtering',

        description: `Emits the INDEX of the first value that matches what you are looking for, then completes.

Think of it like:
👉 "Find position of this value in the stream"

HOW IT WORKS:
• Goes through values one by one
• If value matches → emit its index
• Stops immediately after finding

IMPORTANT:
• Emits only ONE value (the index)
• If not found → emits -1

Example

Source values
1, 2, 3, 4, 5

Find value
3

Processing

1 → not match  
2 → not match  
3 → match → emit index (2) and complete  

Output
2`,

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
            { label: 'Value to Find', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, findArr] = inputs;

            const valueToFind = findArr[0];

            return of(...values).pipe(
                findIndex(v => v == valueToFind),
                map(index => index !== -1 ? `📍 Index: ${index}` : '❌ Not found (-1)')
            );
        }
    },
    first: {
        name: 'first',
        category: 'Filtering',

        description: `Emits the FIRST value from the stream, then completes.

Think of it like:
👉 "Just give me the first value and stop"

HOW IT WORKS:
• Takes the very first value
• Emits it immediately
• Completes right after

IMPORTANT:
• Emits only ONE value
• If no value is emitted → throws an error

Example

Source values
1, 2, 3, 4, 5

Processing

1 → first value → emit and complete  

Output
1`,

        comparisons: ['take', 'find'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    first()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                first(),
                map(v => `🎯 First: ${v}`),
                catchError(() => of('❌ No values (EmptyError)'))
            );
        }
    },
    ignoreElements: {
        name: 'ignoreElements',
        category: 'Filtering',

        description: `Ignores ALL values from the source and only lets completion or error pass through.

Think of it like:
👉 "I don't care about values, just tell me when it's done"

HOW IT WORKS:
• All emitted values are ignored
• Nothing is sent to next()
• When source completes → completion is passed

IMPORTANT:
• Emits NO values
• Only completion or error is forwarded

WHEN TO USE:
• When you only care about completion (e.g., task finished)
• When triggering side-effects but not showing data
• When chaining operations where output is irrelevant

Example

Source values
1, 2, 3, 4, 5

Processing

1 → ignored  
2 → ignored  
3 → ignored  
4 → ignored  
5 → ignored  

Output
(no values, only completes)`,

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

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                ignoreElements(),
                // Since no values come, we emit completion message manually
                map(() => '❌ This will never run'),
                endWith('✅ Completed (no values emitted)')
            );
        }
    },
    last: {
        name: 'last',
        category: 'Filtering',

        description: `Emits the LAST value from the stream, after the source completes.

Think of it like:
👉 "Wait till everything is done, then give me the last value"

HOW IT WORKS:
• Collects values as they come
• Waits for the source to complete
• Emits the final (last) value

IMPORTANT:
• Emits only ONE value
• Emits ONLY after completion
• If no value is emitted → throws an error

WHEN TO USE:
• When you need the final result after a process
• When working with streams that complete (like API responses)
• When you care about the last state

Example

Source values
1, 2, 3, 4, 5

Processing

1 → wait  
2 → wait  
3 → wait  
4 → wait  
5 → last value → emit after completion  

Output
5`,

        comparisons: ['first', 'takeLast'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    last()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                last(),
                map(v => `🏁 Last: ${v}`),
                catchError(() => of('❌ No values (EmptyError)'))
            );
        }
    },
    sample: {
        name: 'sample',
        category: 'Filtering',

        description: `Emits the latest value from the source ONLY when another observable (trigger) emits.

Think of it like:
👉 "Whenever trigger happens, give me the latest value"

HOW IT WORKS:
• Source keeps emitting values
• The latest value is stored internally
• When trigger emits → latest value is emitted

IMPORTANT:
• Does NOT emit on every source value
• Emits ONLY when trigger fires
• If source completes early → no further emissions
• If no value has come yet → nothing is emitted

WHEN TO USE:
• When you want snapshots of a stream at specific times
• When syncing data with events (like button clicks)
• When reducing update frequency

KEY DIFFERENCE:
• sample → uses another observable as trigger

Example

Source values (every 300ms)
1, 2, 3, 4, 5

Trigger (every 1000ms)

Timeline

300ms → 1  
600ms → 2  
900ms → 3  

1000ms → trigger → emit latest → 3  

1200ms → 4  
1500ms → 5 → source completes  

(no more trigger after source completes)

Output
3`,

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
            { label: 'Trigger Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, triggerInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                sample(interval(triggerInterval[0])),
                map(v => String(v))
            );
        }
    },
    sampleTime: {
        name: 'sampleTime',
        category: 'Filtering',

        description: `Emits the latest value from the source at a fixed time interval.

Think of it like:
👉 "Every X milliseconds, give me the latest value"

HOW IT WORKS:
• Source keeps emitting values
• The latest value is stored
• At every time interval → latest value is emitted

IMPORTANT:
• Emits at fixed intervals (not based on another observable)
• Does NOT emit on every source value
• If source completes early → no further emissions
• If no value has come yet → nothing is emitted

WHEN TO USE:
• When you want periodic snapshots of a stream
• When reducing frequency of updates
• When displaying live data at intervals

KEY DIFFERENCE:
• sampleTime → uses time interval as trigger
• sample → uses another observable as trigger

Example

Source values (every 300ms)
1, 2, 3, 4, 5

Sample interval
1000ms

Timeline

300ms → 1  
600ms → 2  
900ms → 3  

1000ms → emit latest → 3  

1200ms → 4  
1500ms → 5 → source completes  

(no next interval before completion)

Output
3`,

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
            { label: 'Sample Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, sampleInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                sampleTime(sampleInterval[0]),
                map(v => String(v))
            );
        }
    },
    single: {
        name: 'single',
        category: 'Filtering',

        description: `Emits the ONLY value that matches a condition.

Think of it like:
👉 "There should be exactly ONE matching value"

HOW IT WORKS:
• Checks all values in the stream
• If exactly ONE value matches not more than one then → emit it
• If NONE match → error
• If MORE THAN ONE match → error

IMPORTANT:
• Emits only ONE value
• Throws error if 0 or multiple matches
• Waits for the source to complete

WHEN TO USE:
• When you expect exactly one result
• When validating unique data
• When ensuring only one match exists

Example

Source values
1, 2, 3, 4, 5

Condition
value === 3

Processing

1 → no match  
2 → no match  
3 → match  
4 → no match  
5 → no match  

Only one match → emit 3

Output
3`,

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
            { label: 'Value to Find', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, findArr] = inputs;

            const valueToFind = findArr[0];

            return of(...values).pipe(
                single(v => v == valueToFind),
                map(v => `✅ Single: ${v}`),
                catchError(() => of('❌ Must have exactly one matching value'))
            );
        }
    },
    skip: {
        name: 'skip',
        category: 'Filtering',

        description: `Skips the first N values from the source, then emits the rest.

Think of it like:
👉 "Ignore the first few values"

HOW IT WORKS:
• Counts incoming values
• Ignores first N values
• Starts emitting after that

IMPORTANT:
• Does NOT modify remaining values
• If N ≥ total values → nothing is emitted

WHEN TO USE:
• When you want to ignore initial values
• When skipping default or unwanted first emissions
• When handling streams with initial noise

Example

Source values
1, 2, 3, 4, 5

Skip count
2

Processing

1 → skipped  
2 → skipped  
3 → emit  
4 → emit  
5 → emit  

Output
3, 4, 5`,

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
            { label: 'Skip Count', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, countArr] = inputs;

            const skipCount = Number(countArr[0]);

            return of(...values).pipe(
                skip(skipCount),
                map(v => String(v))
            );
        }
    },
    skipLast: {
        name: 'skipLast',
        category: 'Filtering',

        description: `Skips the last N values from the source.

Think of it like:
👉 "Ignore the last few values"

HOW IT WORKS:
• Collects values as they come
• Holds last N values in buffer
• Emits everything except the last N

IMPORTANT:
• Emits values with delay (needs to know the end)
• If N ≥ total values → nothing is emitted

WHEN TO USE:
• When you want to ignore ending values
• When final emissions are not needed

Example

Source values
1, 2, 3, 4, 5

Skip last
2

Processing

1 → emit  
2 → emit  
3 → emit  
4 → hold  
5 → hold  

Output
1, 2, 3`,

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
            { label: 'Skip Last Count', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, countArr] = inputs;
            const count = Number(countArr[0]);

            return of(...values).pipe(
                skipLast(count),
                map(v => String(v))
            );
        }
    },
    skipUntil: {
        name: 'skipUntil',
        category: 'Filtering',

        description: `Skips values from the source until another observable emits.

Think of it like:
👉 "Ignore values until something happens"

HOW IT WORKS:
• Source emits values
• All values are ignored initially
• When trigger emits → start emitting from source

IMPORTANT:
• Before trigger → nothing is emitted
• After trigger → all values pass through

WHEN TO USE:
• When waiting for an event (click, API ready)
• When starting stream after some condition

Example

Source (every 300ms)
1, 2, 3, 4, 5

Trigger at 1000ms

Timeline

300ms → 1 (ignored)  
600ms → 2 (ignored)  
900ms → 3 (ignored)  

1000ms → trigger → start emitting  

1200ms → 4  
1500ms → 5  

Output
4, 5`,

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
            { label: 'Trigger Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, triggerInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                skipUntil(interval(triggerInterval[0])),
                map(v => String(v))
            );
        }
    },
    skipWhile: {
        name: 'skipWhile',
        category: 'Filtering',

        description: `Skips values while a condition is true, then emits the rest.

Think of it like:
👉 "Skip while condition is true, then allow everything"

HOW IT WORKS:
• Applies condition to each value
• While condition is true → skip
• Once false → start emitting ALL values

IMPORTANT:
• Condition is checked only until first false
• After that → everything passes through

WHEN TO USE:
• When ignoring initial unwanted values
• When waiting for condition to become false

Example

Source values
1, 2, 3, 4, 1, 2

Condition
value < 3

Processing

1 → skip  
2 → skip  
3 → condition false → emit  
4 → emit  
1 → emit  
2 → emit  

Output
3, 4, 1, 2`,

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
            { label: 'Threshold Value', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, thresholdArr] = inputs;
            const threshold = thresholdArr[0];

            return of(...values).pipe(
                skipWhile(v => v < threshold),
                map(v => String(v))
            );
        }
    },
    take: {
        name: 'take',
        category: 'Filtering',

        description: `Emits only the first N values from the source, then completes.

Think of it like:
👉 "Give me first N values and stop"

HOW IT WORKS:
• Starts emitting values
• Counts each emission
• After N values → completes immediately

IMPORTANT:
• Emits only N values
• Automatically unsubscribes after N values
• If N ≥ total values → emits all values

WHEN TO USE:
• When you need only a limited number of values
• When preventing infinite streams
• When taking initial data only

Example

Source values
1, 2, 3, 4, 5

Take count
3

Processing

1 → emit  
2 → emit  
3 → emit → complete  

Output
1, 2, 3`,

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
            { label: 'Take Count', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, countArr] = inputs;

            const count = Number(countArr[0]);

            return of(...values).pipe(
                take(count),
                map(v => String(v))
            );
        }
    },
    takeLast: {
        name: 'takeLast',
        category: 'Filtering',

        description: `Emits the last N values from the source, after it completes.

Think of it like:
👉 "Give me the last few values at the end"

HOW IT WORKS:
• Collects all values internally
• Waits for the source to complete
• Emits the last N values

IMPORTANT:
• Emits only after completion
• If N ≥ total values → emits all values

WHEN TO USE:
• When you need final values from a stream
• When working with completed data sets

Example

Source values
1, 2, 3, 4, 5

Take last
2

Processing

(wait until complete)  
Emit last 2 values → 4, 5  

Output
4, 5`,

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
            { label: 'Take Last Count', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, countArr] = inputs;
            const count = Number(countArr[0]);

            return of(...values).pipe(
                takeLast(count),
                map(v => String(v))
            );
        }
    },
    takeUntil: {
        name: 'takeUntil',
        category: 'Filtering',

        description: `Emits values from the source until another observable (trigger) emits.

Think of it like:
👉 "Keep taking values until something happens"

HOW IT WORKS:
• Source emits values normally
• When trigger emits → stop immediately
• No further values are emitted

IMPORTANT:
• Stops as soon as trigger fires
• Does not emit the value that comes after trigger

WHEN TO USE:
• When stopping a stream based on an event
• When handling component destruction (Angular)
• When canceling ongoing processes

Example

Source (every 300ms)
1, 2, 3, 4, 5

Trigger at 1000ms

Timeline

300ms → 1  
600ms → 2  
900ms → 3  

1000ms → trigger → stop  

Output
1, 2, 3`,

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
            { label: 'Trigger Interval (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, triggerInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                takeUntil(interval(triggerInterval[0])),
                map(v => String(v))
            );
        }
    },
    takeWhile: {
        name: 'takeWhile',
        category: 'Filtering',

        description: `Emits values while a condition is true, then stops.

Think of it like:
👉 "Keep taking values while condition is true"

HOW IT WORKS:
• Applies condition to each value
• While condition is true → emit values
• Once condition becomes false → stop completely

IMPORTANT:
• Stops permanently after first false condition
• Does not emit the value that breaks the condition

WHEN TO USE:
• When processing values until a condition fails
• When working with thresholds or limits

Example

Source values
1, 2, 3, 4, 1

Condition
value < 3

Processing

1 → emit  
2 → emit  
3 → condition false → stop  

Output
1, 2`,

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
            { label: 'Threshold Value', defaultValue: [3] }
        ],

        run: (inputs) => {
            const [values, thresholdArr] = inputs;
            const threshold = thresholdArr[0];

            return of(...values).pipe(
                takeWhile(v => v < threshold),
                map(v => String(v))
            );
        }
    },
    throttle: {
        name: 'throttle',
        category: 'Filtering',

        description: `Emits the first value, then ignores subsequent values for a duration controlled by another observable.

Think of it like:
👉 "Emit → lock → ignore → unlock → repeat"

HOW IT WORKS:
• Emit first value immediately
• Start duration (controlled by another observable)
• Ignore all values during that duration
• After duration ends → next value can be emitted

KEY DIFFERENCE:
• throttle → duration controlled by another observable

Example

Source (every 300ms)
1    2    3    4    5    6    7    8    9
300  600  900 1200 1500 1800 2100 2400 2700

Duration = 1000ms

Timeline

300ms  → 1  ✅ emit → lock till 1300ms  
600ms  → 2  ❌ ignored  
900ms  → 3  ❌ ignored  
1200ms → 4  ❌ ignored  

1500ms → 5  ✅ emit → lock till 2500ms  
1800ms → 6  ❌ ignored  
2100ms → 7  ❌ ignored  
2400ms → 8  ❌ ignored  

2700ms → 9  ✅ emit  

Output
1, 5, 9`,

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
            { label: 'Throttle Duration (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, duration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                throttle(() => interval(duration[0])),
                map(v => String(v))
            );
        }
    },
    throttleTime: {
        name: 'throttleTime',
        category: 'Filtering',

        description: `Emits the first value, then ignores subsequent values for a fixed time duration.

Think of it like:
👉 "Emit → lock → ignore → unlock → repeat"

HOW IT WORKS:
• Emit first value immediately
• Start fixed timer
• Ignore all values during that time
• After time ends → next value can be emitted

KEY DIFFERENCE:
• throttleTime → duration controlled by fixed time
• throttleTime → duration controlled by another observable

Example

Source (every 300ms)
1    2    3    4    5    6    7    8    9
300  600  900 1200 1500 1800 2100 2400 2700

Throttle time = 1000ms

Timeline

300ms  → 1  ✅ emit → lock till 1300ms  
600ms  → 2  ❌ ignored  
900ms  → 3  ❌ ignored  
1200ms → 4  ❌ ignored  

1500ms → 5  ✅ emit → lock till 2500ms  
1800ms → 6  ❌ ignored  
2100ms → 7  ❌ ignored  
2400ms → 8  ❌ ignored  

2700ms → 9  ✅ emit  

Output
1, 5, 9`,

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
            { label: 'Throttle Time (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, duration] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                throttleTime(duration[0]),
                map(v => String(v))
            );
        }
    },
    tap: {
        name: 'tap',
        category: 'Utility',

        description: `Performs a side effect for each value without modifying the stream.

Think of it like:
👉 "Peek at values without changing them"

HOW IT WORKS:
• Receives each value from the source
• Executes a side-effect (like logging)
• Passes the same value forward unchanged

IMPORTANT:
• Does NOT modify values
• Used only for side effects (logging, debugging)
• Output remains exactly the same as input

WHEN TO USE:
• Debugging streams
• Logging values
• Triggering side effects (analytics, tracking)

Example

Source values
1, 2, 3

Processing

1 → tap logs → emit 1  
2 → tap logs → emit 2  
3 → tap logs → emit 3  

Output
1, 2, 3 (unchanged)`,

        comparisons: ['map', 'filter'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    tap(v => console.log('Value:', v))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                tap(v => console.log('🔍 Tap:', v)),
                map(v => String(v)) // pass unchanged
            );
        }
    },
    delay: {
        name: 'delay',
        category: 'Utility',

        description: `Delays each value by a fixed amount of time before emitting it.

Think of it like:
👉 "Shift everything forward in time"

HOW IT WORKS:
• Each value is received immediately
• Emission is delayed by fixed time
• Order remains same

IMPORTANT:
• Does NOT skip or drop values
• Only shifts them in time
• All values are delayed equally

WHEN TO USE:
• Simulating network delay
• Creating timed UI effects
• Testing async behavior

Example

Source (every 300ms)
1    2    3    4    5
300  600  900 1200 1500

Delay = 1000ms

Timeline

300ms  → 1 → emit at 1300ms  
600ms  → 2 → emit at 1600ms  
900ms  → 3 → emit at 1900ms  
1200ms → 4 → emit at 2200ms  
1500ms → 5 → emit at 2500ms  

Output
1, 2, 3, 4, 5 (same order, delayed)`,

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
            { label: 'Delay Time (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, delayTime] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                delay(delayTime[0]),
                map(v => String(v))
            );
        }
    },
    delayWhen: {
        name: 'delayWhen',
        category: 'Utility',

        description: `Delays each value based on another observable.

Think of it like:
👉 "Delay depends on something else"

HOW IT WORKS:
• Each value triggers a new observable
• Value is emitted only when that observable completes
• Delay can vary per value

IMPORTANT:
• Delay is dynamic (not fixed)
• Each value can have different delay
• Controlled by another observable

KEY DIFFERENCE:
• delay → fixed time
• delayWhen → dynamic delay (observable-based)

WHEN TO USE:
• When delay depends on conditions
• When creating dynamic timing behavior
• When coordinating multiple async streams

Example

Source (every 300ms)
1    2    3    4    5

DelayWhen = value * 200ms

Timeline

1 → delay 200ms → emit  
2 → delay 400ms → emit  
3 → delay 600ms → emit  
4 → delay 800ms → emit  
5 → delay 1000ms → emit  

Output
1, 2, 3, 4, 5 (different delays)`,

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
            { label: 'Source Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [values, sourceInterval] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                delayWhen(v => interval(v * 200)),
                map(v => String(v))
            );
        }
    },
    finalize: {
        name: 'finalize',
        category: 'Utility',

        description: `Executes a function when the observable completes or errors.

Think of it like:
👉 "Always run this at the end"

HOW IT WORKS:
• Stream emits values normally
• When stream completes OR errors → finalize runs
• Runs exactly once at the end

IMPORTANT:
• Does NOT modify values
• Runs on both completion and error
• Runs even if unsubscribed early

WHEN TO USE:
• Cleanup logic (like stopping loaders)
• Closing resources (subscriptions, connections)
• Logging when stream ends

Example

Source values
1, 2, 3

Processing

1 → emit  
2 → emit  
3 → emit  

Stream completes → finalize runs  

Output
1, 2, 3  
(then finalize executes)`,

        comparisons: ['tap', 'complete'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    finalize(() => console.log('✅ Finalize: Stream ended'))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return new Observable(observer => {
                of(...values).pipe(
                    map(v => String(v)),
                    finalize(() => {
                        observer.next('✅ Finalize: Stream ended');
                        observer.complete();
                    })
                ).subscribe({
                    next: v => observer.next(v),
                    error: err => observer.error(err)
                });
            });
        }
    },
    repeat: {
        name: 'repeat',
        category: 'Utility',

        description: `Repeats the source observable a specified number of times.

Think of it like:
👉 "Run the same stream again and again"

HOW IT WORKS:
• Source runs normally
• When it completes → it starts again
• Repeats this process N times

IMPORTANT:
• Repeats only after completion
• Total executions = original + repeats
• If no count is given → repeats infinitely

WHEN TO USE:
• Retrying operations
• Replaying sequences
• Looping streams

Example

Source values
1, 2, 3

Repeat count
2

Processing

Run 1 → 1, 2, 3  
Run 2 → 1, 2, 3  

Output
1, 2, 3, 1, 2, 3`,

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
            { label: 'Repeat Count', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, countArr] = inputs;
            const count = Number(countArr[0]);

            return of(...values).pipe(
                repeat(count),
                map(v => String(v))
            );
        }
    },
    timeout: {
        name: 'timeout',
        category: 'Error Handling',

        description: `Throws an error if a value is not emitted within the specified time.

Think of it like:
👉 "If nothing comes in time → fail"

HOW IT WORKS:
• Starts timer for each emission
• If next value does not arrive in time → error is thrown
• Timer resets after each emission

IMPORTANT:
• Works between emissions
• Throws error on delay
• Useful for detecting slow streams

WHEN TO USE:
• Handling slow API responses
• Detecting delays in streams
• Adding time limits

Example

Source (every 500ms)
1    2    3    4

Timeout = 300ms

Timeline

0ms → start  
500ms → too late → ❌ timeout error  

Output
❌ Timeout Error`,

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
            { label: 'Timeout (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, timeoutArr] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                timeout(timeoutArr[0]),
                map(v => String(v)),
                catchError(() => of('❌ Timeout Error'))
            );
        }
    },
    timeoutWith: {
        name: 'timeoutWith',
        category: 'Error Handling',

        description: `Switches to another observable if a value is not emitted within the specified time.

Think of it like:
👉 "If nothing comes in time → switch to backup"

HOW IT WORKS:
• Starts timer for each emission
• If timeout occurs → switches to fallback observable
• Continues with fallback instead of error

IMPORTANT:
• Does NOT throw error
• Switches to another observable
• Useful for fallback logic

KEY DIFFERENCE:
• timeout → throws error
• timeoutWith → switches to fallback

WHEN TO USE:
• Providing fallback data
• Handling slow APIs gracefully
• Avoiding errors

Example

Source (every 500ms)
1    2    3

Timeout = 300ms

Fallback
'Fallback A', 'Fallback B'

Timeline

0ms → start  
500ms → too late → switch to fallback  

Output
Fallback A, Fallback B`,

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
            { label: 'Timeout (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [values, sourceInterval, timeoutArr] = inputs;

            return interval(sourceInterval[0]).pipe(
                take(values.length),
                map(i => values[i]),
                timeoutWith(timeoutArr[0], of('Fallback A', 'Fallback B')),
                map(v => String(v))
            );
        }
    },
    toArray: {
        name: 'toArray',
        category: 'Utility',

        description: `Collects all emitted values and emits them as a single array when the source completes.

Think of it like:
👉 "Wait for everything, then give me all values together"

HOW IT WORKS:
• Values are collected internally
• Nothing is emitted during the stream
• When source completes → emit full array

IMPORTANT:
• Emits only ONCE (at completion)
• Requires source to complete
• If source never completes → nothing is emitted

WHEN TO USE:
• When you need all values together
• When converting stream into array
• When processing batch data

Example

Source values
1, 2, 3, 4, 5

Processing

1 → store  
2 → store  
3 → store  
4 → store  
5 → store  

Source completes → emit array  

Output
[1, 2, 3, 4, 5]`,

        comparisons: ['reduce', 'scan'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    toArray()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                toArray(),
                map(arr => JSON.stringify(arr))
            );
        }
    },
    catchError: {
        name: 'catchError',
        category: 'Error Handling',

        description: `Catches an error and replaces it with another observable.

Think of it like:
👉 "If error happens → recover with something else"

HOW IT WORKS:
• Source emits values normally
• If error occurs → catch it
• Replace error with another observable

IMPORTANT:
• When error occurs → original stream stops
• catchError replaces it with a new observable
• Prevents error from crashing the stream chain

WHEN TO USE:
• Handling API errors
• Providing fallback data
• Avoiding application crashes

Example

Source values
1, 2, ❌ error

Processing

1 → emit  
2 → emit  
error → catch → switch to fallback  

Output
1, 2, Fallback`,

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
            { label: 'Source Values (use "error")', defaultValue: [1, 2, 'error', 3] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                map(v => {
                    if (v === 'error') throw new Error('Error');
                    return String(v);
                }),
                catchError(() => of('⚠️ Fallback value'))
            );
        }
    },
    retry: {
        name: 'retry',
        category: 'Error Handling',

        description: `Retries the source observable when an error occurs.

Think of it like:
👉 "If it fails, try again"

HOW IT WORKS:
• Source runs normally
• If error occurs → restart the stream
• Retries up to N times

IMPORTANT:
• Only works on errors (not completion)
• If retries exceed limit → error is thrown
• Total attempts = original + retries

WHEN TO USE:
• Retrying failed API calls
• Handling temporary failures
• Improving reliability

Example

Source values
1, 2, ❌ error

Retry count
2

Processing

Run 1 → 1, 2 → error  
Run 2 → 1, 2 → error  
Run 3 → 1, 2 → error → stop  

Output
1, 2, 1, 2, 1, 2  
(then error)`,

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
            { label: 'Source Values (use "error" to simulate)', defaultValue: [1, 2, 'error'] },
            { label: 'Retry Count', defaultValue: [2] }
        ],

        run: (inputs) => {
            const [values, retryArr] = inputs;
            const retryCount = Number(retryArr[0]);

            return of(...values).pipe(
                map(v => {
                    if (v === 'error') throw new Error('Error');
                    return String(v);
                }),
                retry(retryCount),
                catchError(() => of('❌ Final Error after retries'))
            );
        }
    },
    throwIfEmpty: {
        name: 'throwIfEmpty',
        category: 'Error Handling',

        description: `Throws an error if the source completes without emitting any value.

Think of it like:
👉 "If nothing came → throw error"

HOW IT WORKS:
• Waits for source to emit values
• If at least one value → pass through
• If none → throw error on completion

IMPORTANT:
• Works only on completion
• Does NOT affect streams with values
• Useful for validation

WHEN TO USE:
• Ensuring data exists
• Validating empty responses
• Avoiding silent empty streams

Example

Source values
(no values)

Processing

(no emission)  
source completes → throw error  

Output
❌ Error: Empty stream`,

        comparisons: ['defaultIfEmpty', 'first'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    throwIfEmpty(() => new Error('Empty stream'))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                throwIfEmpty(() => new Error('Empty stream')),
                map(v => String(v)),
                catchError(() => of('❌ Error: Empty stream'))
            );
        }
    },
    share: {
        name: 'share',
        category: 'Multicasting',

        description: `Shares a single execution of the source among multiple subscribers.

Think of it like:
👉 "Run once, share with everyone"

HOW IT WORKS:
• Without share → each subscriber runs the source separately
• With share → all subscribers share the same execution
• Late subscribers only receive future values

IMPORTANT:
• Prevents duplicate executions
• No replay (no memory)
• Late subscribers miss previous values

WHEN TO USE:
• Avoid multiple API calls
• Share live data between components
• Optimize performance

Example

Source (every 500ms)
1    2    3    4    5

Subscriber A starts at 0ms  
Subscriber B joins at 1000ms  

Timeline

0ms   → A subscribes  
500ms → 1 → A  
1000ms → 2 → A  

1000ms → B subscribes  

1500ms → 3 → A, B  
2000ms → 4 → A, B  
2500ms → 5 → A, B  

Output

A → 1, 2, 3, 4, 5  
B → 3, 4, 5 (missed 1,2)`,

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
            { label: 'Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, intervalArr] = inputs;
            const intervalTime = intervalArr[0];

            const source$ = interval(intervalTime).pipe(
                take(values.length),
                map(i => values[i]),
                share()
            );

            return new Observable(observer => {

                // Subscriber A (starts immediately)
                source$.subscribe(v => observer.next(`A → ${v}`));

                // Subscriber B (joins late)
                setTimeout(() => {
                    source$.subscribe(v => observer.next(`B → ${v}`));
                }, intervalTime * 2);

            });
        }
    },
    shareReplay: {
        name: 'shareReplay',
        category: 'Multicasting',

        description: `Shares a single execution AND replays previous values to new subscribers.

Think of it like:
👉 "Run once, share, and remember values"

HOW IT WORKS:
• Source runs once (shared execution)
• Last N values are stored (buffer)
• New subscribers immediately receive stored values

IMPORTANT:
• Prevents duplicate execution
• Replays previous values to late subscribers
• Has memory (buffer)

KEY DIFFERENCE:
• share → no memory
• shareReplay → remembers past values

WHEN TO USE:
• Caching API responses
• Sharing data across components
• Avoiding repeated calls with memory

Example

Source (every 500ms)
1    2    3    4    5

Subscriber A starts at 0ms  
Subscriber B joins at 1000ms  
Replay buffer = 2  

Timeline

0ms   → A subscribes  
500ms → 1 → A  
1000ms → 2 → A  

1000ms → B subscribes  
👉 B instantly gets last 2 values → 1, 2  

1500ms → 3 → A, B  
2000ms → 4 → A, B  
2500ms → 5 → A, B  

Output

A → 1, 2, 3, 4, 5  
B → 1, 2, 3, 4, 5 (replayed + live)`,

        comparisons: ['share'],

        syntax: `
const values = $INPUT_0_ARRAY;
const intervalTime = $INPUT_1_VALUE;
const bufferSize = $INPUT_2_VALUE;

const source$ = interval(intervalTime)
  .pipe(
    take(values.length),
    map(i => values[i]),
    shareReplay(bufferSize)
  );

source$.subscribe(a => console.log('A:', a));

setTimeout(() => {
  source$.subscribe(b => console.log('B:', b));
}, intervalTime * 2);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Interval (ms)', defaultValue: [500] },
            { label: 'Replay Buffer Size', defaultValue: [2] },
            { label: 'Subscriber Delay (ms)', defaultValue: [1000] }
        ],

        run: (inputs) => {
            const [values, intervalArr, bufferArr, delayArr] = inputs;

            const intervalTime = intervalArr[0];
            const bufferSize = bufferArr[0];
            const delayTime = delayArr[0];

            const source$ = interval(intervalTime).pipe(
                take(values.length),
                map(i => values[i]),
                shareReplay(bufferSize)
            );

            return new Observable(observer => {

                // Subscriber A (immediate)
                source$.subscribe(v => observer.next(`A → ${v}`));

                // Subscriber B (late)
                setTimeout(() => {
                    source$.subscribe(v => observer.next(`B → ${v}`));
                }, delayTime);

            });
        }
    },
    connect: {
        name: 'connect',
        category: 'Multicasting',

        description: `Creates a shared stream with custom control over how values are shared.

Think of it like:
👉 "Control how multiple subscribers receive values"

HOW IT WORKS:
• Creates a shared stream internally
• Multiple subscribers share same execution
• You define how values are distributed

IMPORTANT:
• Starts automatically (no manual connect needed)
• Allows custom sharing logic
• More flexible than share

KEY DIFFERENCE:
• connect → YOU control HOW the stream is shared
• connectable → YOU control WHEN the stream starts

WHEN TO USE:
• When you want custom sharing behavior
• When managing multiple subscribers differently

Example

Two subscribers receive values from same stream  
Custom logic controls how values are shared`,

        comparisons: ['connectable', 'share'],

        syntax: `
interval(500)
  .pipe(
    connect(shared$ => merge(
      shared$.pipe(map(v => 'A: ' + v)),
      shared$.pipe(map(v => 'B: ' + v))
    ))
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, intervalArr] = inputs;
            const intervalTime = intervalArr[0];

            return interval(intervalTime).pipe(
                take(values.length),
                map(i => values[i]),
                connect(shared$ =>
                    merge(
                        shared$.pipe(map(v => `A → ${v}`)),
                        shared$.pipe(map(v => `B → ${v}`))
                    )
                )
            );
        }
    },
    connectable: {
        name: 'connectable',
        category: 'Multicasting',

        description: `Creates a connectable observable that does NOT start automatically.

Think of it like:
👉 "Prepare the stream, start it manually"

HOW IT WORKS:
• Converts source into a connectable observable
• Subscribers can subscribe before execution starts
• Nothing happens until connect() is called

IMPORTANT:
• Does NOT emit automatically
• Requires manual .connect()
• All subscribers receive values from the beginning

KEY DIFFERENCE:
• connectable → YOU control WHEN the stream starts
• connect → YOU control HOW the stream is shared

WHEN TO USE:
• When you want full control over start timing
• When all subscribers must receive complete data

Example

Subscribers A and B subscribe first  
Then connect() is called → stream starts for both together`,

        comparisons: ['connect', 'share'],

        syntax: `
const source$ = connectable(interval(500));

source$.subscribe(a => console.log('A:', a));
source$.subscribe(b => console.log('B:', b));

source$.connect();
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] },
            { label: 'Interval (ms)', defaultValue: [500] }
        ],

        run: (inputs) => {
            const [values, intervalArr] = inputs;
            const intervalTime = intervalArr[0];

            const source$ = connectable(
                interval(intervalTime).pipe(
                    take(values.length),
                    map(i => values[i])
                )
            );

            return new Observable(observer => {
                source$.subscribe(v => observer.next(`A → ${v}`));
                source$.subscribe(v => observer.next(`B → ${v}`));

                setTimeout(() => {
                    source$.connect();
                }, intervalTime);
            });
        }
    },
    count: {
        name: 'count',
        category: 'Utility',

        description: `Counts how many values are emitted and emits the total when the source completes.

Think of it like:
👉 "How many values did I get?"

HOW IT WORKS:
• Observes each value
• Keeps increasing count
• Emits final count when source completes

IMPORTANT:
• Emits only ONCE (at completion)
• Requires source to complete
• Can use condition (predicate) to count selectively

WHEN TO USE:
• Counting total values in a stream
• Counting matching values
• Validating number of emissions

Example

Source values
1, 2, 3, 4, 5

Processing

1 → count = 1  
2 → count = 2  
3 → count = 3  
4 → count = 4  
5 → count = 5  

Source completes → emit count  

Output
5`,

        comparisons: ['toArray', 'reduce'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    count()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4, 5] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                count(),
                map(v => `🔢 Count: ${v}`)
            );
        }
    },
    max: {
        name: 'max',
        category: 'Utility',

        description: `Emits the maximum (largest) value from the source when it completes.

Think of it like:
👉 "What is the biggest value?"

HOW IT WORKS:
• Compares values one by one
• Keeps track of the largest value
• Emits the maximum when source completes

IMPORTANT:
• Emits only ONCE (at completion)
• Requires source to complete
• Uses comparison internally

WHEN TO USE:
• Finding highest value
• Getting max score, price, etc.
• Comparing values in a stream

Example

Source values
1, 5, 3, 9, 2

Processing

1 → current max = 1  
5 → current max = 5  
3 → ignored  
9 → current max = 9  
2 → ignored  

Source completes → emit max  

Output
9`,

        comparisons: ['min', 'reduce'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    max()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 5, 3, 9, 2] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                max(),
                map(v => `🔝 Max: ${v}`),
                defaultIfEmpty('No values')
            );
        }
    },
    min: {
        name: 'min',
        category: 'Utility',

        description: `Emits the minimum (smallest) value from the source when it completes.

Think of it like:
👉 "What is the smallest value?"

HOW IT WORKS:
• Compares values one by one
• Keeps track of the smallest value
• Emits the minimum when source completes

IMPORTANT:
• Emits only ONCE (at completion)
• Requires source to complete
• Uses comparison internally

WHEN TO USE:
• Finding lowest value
• Getting minimum price, score, etc.
• Comparing values in a stream

Example

Source values
7, 2, 5, 1, 9

Processing

7 → current min = 7  
2 → current min = 2  
5 → ignored  
1 → current min = 1  
9 → ignored  

Source completes → emit min  

Output
1`,

        comparisons: ['max', 'reduce'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    min()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [7, 2, 5, 1, 9] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                min(),
                map(v => `🔽 Min: ${v}`),
                defaultIfEmpty('No values')
            );
        }
    },
    reduce: {
        name: 'reduce',
        category: 'Utility',

        description: `Applies an accumulator function to all values and emits a single final result when the source completes.

Think of it like:
👉 "Keep combining values → give final result at the end"

HOW IT WORKS:
• Starts with an initial value (optional)
• Combines each value using accumulator function
• Emits final accumulated result on completion

IMPORTANT:
• Emits only ONCE (at completion)
• Requires source to complete
• Similar to Array.reduce()

WHEN TO USE:
• Summing values
• Building final result from stream
• Aggregating data

Example

Source values
1, 2, 3, 4

Accumulator
sum = previous + current

Processing

1 → sum = 1  
2 → sum = 3  
3 → sum = 6  
4 → sum = 10  

Source completes → emit result  

Output
10`,

        comparisons: ['scan', 'count', 'toArray'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    reduce((acc, curr) => acc + curr, 0)
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [1, 2, 3, 4] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                reduce((acc, curr) => acc + Number(curr), 0),
                map(v => `🧮 Result: ${v}`)
            );
        }
    },
    every: {
        name: 'every',
        category: 'Utility',

        description: `Checks whether ALL values satisfy a condition and emits true or false.

Think of it like:
👉 "Are all values valid?"

HOW IT WORKS:
• Applies condition (predicate) to each value
• If all values pass → emit true
• If any value fails → emit false immediately

IMPORTANT:
• Emits only ONCE
• Can complete early on first failure
• Does NOT wait for full stream if condition fails

WHEN TO USE:
• Validating all data
• Checking conditions across entire stream
• Ensuring all values meet criteria

Example

Source values
2, 4, 6, 8

Condition
value > threshold i.e. 1

Processing

2 → pass  
4 → pass  
6 → pass  
8 → pass  

All passed → emit true  

Output
true`,

        comparisons: ['some', 'filter'],

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
            { label: 'Threshold Value', defaultValue: [1] }
        ],

        run: (inputs) => {
            const [values, thresholdArr] = inputs;
            const threshold = Number(thresholdArr[0]);

            return of(...values).pipe(
                every(v => v > threshold),
                map(v => `✅ All match: ${v}`)
            );
        }
    },
    isEmpty: {
        name: 'isEmpty',
        category: 'Utility',

        description: `Checks whether the source emits any values and returns true or false.

Think of it like:
👉 "Did anything come?"

HOW IT WORKS:
• Waits for first value
• If any value is emitted → emit false immediately
• If no values and source completes → emit true

IMPORTANT:
• Emits only ONCE
• Can complete early if value is found
• Does NOT wait for full stream if value exists

WHEN TO USE:
• Checking if stream has data
• Validating empty responses
• Conditional flows

Example

Source values
(empty)

Processing

(no values emitted)  
source completes → emit true  

Output
true`,

        comparisons: ['defaultIfEmpty', 'every'],

        syntax: `
const values = $INPUT_0_ARRAY;

of(...values)
  .pipe(
    isEmpty()
  )
  .subscribe(console.log);
`.trim(),

        inputs: [
            { label: 'Source Values', defaultValue: [] }
        ],

        run: (inputs) => {
            const [values] = inputs;

            return of(...values).pipe(
                isEmpty(),
                map(v => `📭 Is Empty: ${v}`)
            );
        }
    },
    defaultIfEmpty: {
        name: 'defaultIfEmpty',
        category: 'Utility',

        description: `Emits a default value if the source completes without emitting anything.

Think of it like:
👉 "If nothing came → give default value"

HOW IT WORKS:
• Waits for values from source
• If at least one value → pass through normally
• If no values → emit default value on completion

IMPORTANT:
• Emits original values if present
• Emits default ONLY if empty
• Does NOT modify non-empty streams

KEY DIFFERENCE:
• isEmpty → tells if empty (true/false)
• defaultIfEmpty → replaces empty with value

WHEN TO USE:
• Providing fallback values
• Handling empty API responses
• Avoiding empty outputs

Example

Source values
(empty)

Default value
"Fallback"

Processing

(no values emitted)  
source completes → emit "Fallback"  

Output
Fallback`,

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
            { label: 'Default Value', defaultValue: ['Fallback'] }
        ],

        run: (inputs) => {
            const [values, defaultArr] = inputs;
            const defaultValue = defaultArr[0];

            return of(...values).pipe(
                defaultIfEmpty(defaultValue),
                map(v => String(v))
            );
        }
    },
    sequenceEqual: {
        name: 'sequenceEqual',
        category: 'Utility',

        description: `Compares two sequences and emits true if they are exactly the same.

Think of it like:
👉 "Are both sequences identical?"

HOW IT WORKS:
• Compares values from both sequences one by one
• Checks order and length
• If all values match → true
• If any mismatch → false

IMPORTANT:
• Emits only ONCE
• Requires both sequences to complete
• Order and length must match

WHEN TO USE:
• Comparing arrays or streams
• Validating data equality
• Testing expected vs actual values

Example

Sequence A
1, 2, 3

Sequence B
1, 2, 3

Processing

1 == 1 → match  
2 == 2 → match  
3 == 3 → match  

Both complete → emit true  

Output
true`,

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
            { label: 'Sequence B', defaultValue: [1, 2, 3] }
        ],

        run: (inputs) => {
            const [valuesA, valuesB] = inputs;

            return of(...valuesA).pipe(
                sequenceEqual(of(...valuesB)),
                map(v => `🔁 Equal: ${v}`)
            );
        }
    },
    timeInterval: {
        name: 'timeInterval',
        category: 'Utility',

        description: `Emits each value along with the time interval since the previous emission.

Think of it like:
👉 "Tell me how much time passed before this value"

HOW IT WORKS:
• Tracks time between emissions
• Wraps each value with its time gap
• Emits object: { value, interval }

IMPORTANT:
• First emission interval is from subscription start
• Does NOT change original values (just wraps them)
• Useful for timing analysis

WHEN TO USE:
• Measuring delays between values
• Debugging timing issues
• Performance analysis

Example

Source (every 300ms)
1    2    3

Timeline

300ms → 1 → interval: 300  
600ms → 2 → interval: 300  
900ms → 3 → interval: 300  

Output
{ value: 1, interval: 300 }  
{ value: 2, interval: 300 }  
{ value: 3, interval: 300 }`,

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
            { label: 'Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [values, intervalArr] = inputs;
            const intervalTime = intervalArr[0];

            return interval(intervalTime).pipe(
                take(values.length),
                map(i => values[i]),
                timeInterval(),
                map(obj => `⏱ ${obj.value} after ${obj.interval}ms`)
            );
        }
    },
    timestamp: {
        name: 'timestamp',
        category: 'Utility',

        description: `Attaches the current timestamp to each emitted value.

Think of it like:
👉 "Tell me the exact time this value came"

HOW IT WORKS:
• Each value is wrapped with current time
• Emits object: { value, timestamp }
• Timestamp is in milliseconds (epoch time)

IMPORTANT:
• Does NOT change the value
• Adds time metadata
• Each emission gets its own timestamp

KEY DIFFERENCE:
• timeInterval → time between values
• timestamp → actual time of value

WHEN TO USE:
• Logging when values arrive
• Debugging event timing
• Tracking real-time data

Example

Source (every 300ms)
1    2    3

Timeline

300ms → 1 → timestamp: 1700000000000  
600ms → 2 → timestamp: 1700000000300  
900ms → 3 → timestamp: 1700000000600  

Output
{ value: 1, timestamp: ... }  
{ value: 2, timestamp: ... }  
{ value: 3, timestamp: ... }`,

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
            { label: 'Interval (ms)', defaultValue: [300] }
        ],

        run: (inputs) => {
            const [values, intervalArr] = inputs;
            const intervalTime = intervalArr[0];

            return interval(intervalTime).pipe(
                take(values.length),
                map(i => values[i]),
                timestamp(),
                map(obj => `🕒 ${obj.value} at ${obj.timestamp}`)
            );
        }
    }
};

// Comparison groups for related operators
export const OPERATOR_COMPARISONS: Record<string, string[]> = {
    // Combination operators
    'combineLatest': ['combineLatestAll', 'zip', 'zipAll', 'forkJoin', 'withLatestFrom'],
    'combineLatestAll': ['combineLatest', 'zipAll'],
    'zip': ['zipAll', 'combineLatest', 'forkJoin'],
    'zipAll': ['zip', 'combineLatestAll'],
    'forkJoin': ['combineLatest', 'zip'],
    'withLatestFrom': ['combineLatest', 'zip'],
    'concat': ['concatAll', 'concatMap', 'merge', 'mergeAll'],
    'concatAll': ['mergeAll', 'switchAll', 'concat'],
    'switchMap': ['mergeMap', 'concatMap', 'exhaustMap', 'map', 'switchAll'],
};

/**
 * Creates a composite operator that runs multiple operators simultaneously
 * and displays their outputs side-by-side
 */
export function createCompositeOperator(operatorNames: string[]): OperatorDemo {
    const validOperators = operatorNames.filter(name => OPERATOR_REGISTRY[name]);

    if (validOperators.length === 0) {
        throw new Error('No valid operators provided for composite comparison');
    }

    // Determine maximum input count among operators
    const maxInputCount = Math.max(
        ...validOperators.map(name => OPERATOR_REGISTRY[name].inputs.length)
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
            return new Observable(subscriber => {
                const subscriptions: Subscription[] = [];

                // Emit headers
                validOperators.forEach(opName => {
                    subscriber.next({
                        type: 'composite-header',
                        operator: opName
                    } as PlaygroundEvent);
                });

                // Execute operators
                validOperators.forEach(opName => {
                    const operator = OPERATOR_REGISTRY[opName];
                    if (!operator) return;

                    const sub = operator.run(inputs).subscribe({
                        next: (event: PlaygroundEvent) => {
                            if (typeof event === 'string') {
                                subscriber.next(`[${opName}]${event}`);
                            } else if (event.type === 'inner') {
                                subscriber.next({
                                    type: 'inner',
                                    label: `[${opName}]${event.label}`
                                } as PlaygroundEvent);
                            } else if (event.type === 'value') {
                                subscriber.next({
                                    type: 'value',
                                    value: `[${opName}]${event.value}`
                                } as PlaygroundEvent);
                            }
                        },
                        error: err => subscriber.error(err)
                    });

                    subscriptions.push(sub);
                });

                return () => subscriptions.forEach(s => s.unsubscribe());
            });
        }
    };
}