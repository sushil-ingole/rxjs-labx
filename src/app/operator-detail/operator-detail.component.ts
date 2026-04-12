import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import {
  OPERATOR_REGISTRY,
  OperatorDemo,
  OutputRow,
  createCompositeOperator
} from '../data/operator-registry';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-operator-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './operator-detail.component.html',
  styleUrl: './operator-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorDetailComponent implements OnInit, OnDestroy {

  operatorName!: string;
  operator?: OperatorDemo;

  dynamicSyntax: string = '';
  dynamicSyntaxMap: Record<string, string> = {};
  visibleInputsCache: any[] = [];

  inputValues: any[] = [];

  output: OutputRow[] = [];
  startTime = 0;
  subscription?: Subscription;

  relatedOperators: string[] = [];

  isComposite = false;
  operatorNames: string[] = [];
  groupedOutput: Map<string, OutputRow[]> = new Map();

  /* --- Composite view filter --- */
  showFilterDropdown = false;
  panelSections = [
    { key: 'description', label: 'Description', visible: true },
    { key: 'syntax', label: 'Syntax', visible: true },
    { key: 'output', label: 'Output', visible: true }
  ];

  /* --- Non-composite view filter --- */
  showNonCompositeFilter = false;
  nonCompositePanelSections = [
    { key: 'description', label: 'Description', visible: true },
    { key: 'syntax', label: 'Syntax', visible: true },
    { key: 'playground', label: 'Playground', visible: true }
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.view-filter') && !target.closest('.header-view-filter')) {
      if (this.showFilterDropdown || this.showNonCompositeFilter) {
        this.showFilterDropdown = false;
        this.showNonCompositeFilter = false;
        this.cdr.markForCheck();
      }
    }
  }

  isSectionVisible(key: string): boolean {
    return this.panelSections.find(s => s.key === key)?.visible ?? true;
  }

  isNonCompositeSectionVisible(key: string): boolean {
    return this.nonCompositePanelSections.find(s => s.key === key)?.visible ?? true;
  }

  /* --- Resizable panels --- */
  @ViewChild('desktopLayout', { static: false }) desktopLayoutRef!: ElementRef<HTMLElement>;
  panelWidths = ['33.33%', '33.33%', '33.33%'];
  private dragIndex = -1;
  private dragStartX = 0;
  private dragStartWidths: number[] = [];
  private boundDragMove = this.onDragMove.bind(this);
  private boundDragEnd = this.onDragEnd.bind(this);

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.operatorName = params.get('name')!;

      if (this.operatorName.includes('-VS-')) {
        this.operatorNames = this.operatorName.split('-VS-');
        this.operator = createCompositeOperator(this.operatorNames);
        this.isComposite = true;

        // ✅ NEW reference
        this.groupedOutput = new Map();
        this.operatorNames.forEach(op => this.groupedOutput.set(op, []));
      } else {
        this.operator = OPERATOR_REGISTRY[this.operatorName];
        this.isComposite = false;
        this.relatedOperators = this.operator?.comparisons || [];
      }

      if (this.operator) {
        this.inputValues = this.operator.inputs
          .filter(inp => !inp.hide)
          .map(i => [...i.defaultValue]);

        this.computeVisibleInputs();
      }

      this.updateSyntaxOnly();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /* ---------------- SYNTAX (ONLY ON RUN) ---------------- */

  private updateSyntaxOnly(): void {
    if (!this.operator) return;

    const parsedInputs = this.parseInputs();

    if (this.isComposite) {
      const newMap: Record<string, string> = {};

      this.operatorNames.forEach(op => {
        const operator = OPERATOR_REGISTRY[op];
        if (!operator) return;

        newMap[op] = this.replaceSyntaxPlaceholders(
          operator.syntax,
          parsedInputs
        );
      });

      this.dynamicSyntaxMap = newMap;
    } else {
      this.dynamicSyntax = this.replaceSyntaxPlaceholders(
        this.operator.syntax,
        parsedInputs
      );
    }
  }

  private replaceSyntaxPlaceholders(
    syntax: string,
    inputs: any[][]
  ): string {
    let result = syntax;

    inputs.forEach((values, index) => {
      const joined = values.map(v => JSON.stringify(v)).join(', ');
      const single = values[0];

      result = result.replace(
        new RegExp(`\\$INPUT_${index}_ARRAY`, 'g'),
        `[${joined}]`
      );

      result = result.replace(
        new RegExp(`\\$INPUT_${index}_VALUE`, 'g'),
        String(single)
      );
    });

    return result;
  }

  /* ---------------- RUN ---------------- */

  run(): void {
    if (!this.operator) return;

    this.subscription?.unsubscribe();
    this.output = [];
    this.groupedOutput = new Map(
      Array.from(this.groupedOutput.keys()).map(k => [k, []])
    );
    this.startTime = Date.now();

    // ✅ UPDATE SYNTAX ONLY HERE
    this.updateSyntaxOnly();

    const parsedInputs = this.parseInputs();
    let index = 1;

    this.subscription = this.operator.run(parsedInputs).subscribe({
    next: (event) => {
      const elapsed = Date.now() - this.startTime;

      const extractOpName = (text: string): string | null => {
        const m = text.match(/^\[([^\]]+)\]/);
        return m ? m[1] : null;
      };

      if (typeof event === 'object' && event.type === 'composite-header') {
        this.groupedOutput.get(event.operator)?.push({
          kind: 'meta',
          value: `━ ${event.operator} ━`,
          time: `${elapsed} ms`
        });
        return;
      }

      if (typeof event === 'string') {
        let opName: string | null = null;
        let value = event;

        if (this.isComposite) {
          opName = extractOpName(event);
          if (opName) value = event.slice(opName.length + 2);
        }

        const row: OutputRow = {
          kind: 'value',
          index: index++,
          value,
          time: `${elapsed} ms`
        };

        if (this.isComposite && opName) {
          const existing = this.groupedOutput.get(opName) || [];

          this.groupedOutput = new Map(this.groupedOutput);
          this.groupedOutput.set(opName, [...existing, row]);
        } else {
          this.output = [...this.output, row];
        }
      }

      this.cdr.markForCheck();
    },
    error: (err) => {
      const elapsed = Date.now() - this.startTime;
      const errorRow: OutputRow = {
        kind: 'meta',
        value: `❌ Error: ${err?.message || err}`,
        time: `${elapsed} ms`
      };

      if (this.isComposite) {
        const firstOp = this.operatorNames[0];
        const existing = this.groupedOutput.get(firstOp) || [];
        this.groupedOutput = new Map(this.groupedOutput);
        this.groupedOutput.set(firstOp, [...existing, errorRow]);
      } else {
        this.output = [...this.output, errorRow];
      }

      this.cdr.markForCheck();
    }
    });

    this.cdr.markForCheck();
  }

  /* ---------------- INPUT PARSING ---------------- */

  private parseInputs(): any[][] {
    if (!this.operator) return [];

    let visibleIndex = 0;

    return this.operator.inputs.map(input => {

      if (input.hide) return input.defaultValue;

      const raw = this.inputValues[visibleIndex++];

      if (Array.isArray(raw)) return raw;

      const rawStr = (raw ?? '').toString();

      const cleaned = rawStr
        .split(',')
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '');

      // ✅ OBJECT handling (keep this first priority)
      if (input.type === 'object') {
        return cleaned.map((v: string) => {
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        });
      }

      // ✅ Preserve original type from defaultValue
      if (Array.isArray(input.defaultValue) && input.defaultValue.length > 0) {
        const first = input.defaultValue[0];

        if (typeof first === 'number') {
          // Single-number inputs (interval, count, timeout): fallback to default if invalid
          if (input.defaultValue.length === 1) {
            const num = Number(cleaned[0]);
            return [isNaN(num) ? input.defaultValue[0] : num];
          }

          return cleaned.map((v: any, i: number) => {
            const num = Number(v);
            return isNaN(num) ? v : num;
          });
        }

        if (typeof first === 'string') {
          return cleaned;
        }
      }

      // ✅ Fallback (IMPORTANT)
      return cleaned;
    });
  }

  /* ---------------- UI HELPERS ---------------- */

  private computeVisibleInputs(): void {
    if (!this.operator) {
      this.visibleInputsCache = [];
      return;
    }

    this.visibleInputsCache = this.operator.inputs.filter(i => !i.hide);
  }

  hasCompositeOutput(): boolean {
    return Array.from(this.groupedOutput.values()).some(v => v.length > 0);
  }

  getOperatorDescription(name: string): string {
    return OPERATOR_REGISTRY[name]?.description || '';
  }

  getInputType(input: any): string {
    if (input.defaultValue.length === 1 && typeof input.defaultValue[0] === 'number') {
      return 'number';
    }
    return 'text';
  }

  getPlaceholder(input: any): string {
    if (input.defaultValue.length === 1 && typeof input.defaultValue[0] === 'number') {
      return 'Single number';
    }
    return 'Comma separated values';
  }

  /* ---------------- RESIZABLE PANELS (HORIZONTAL - NON COMPOSITE) ---------------- */

  onDragStart(event: MouseEvent, handleIndex: number): void {
    event.preventDefault();
    this.dragIndex = handleIndex;
    this.dragStartX = event.clientX;

    const layout = this.desktopLayoutRef?.nativeElement;
    if (!layout) return;

    const panels = layout.querySelectorAll<HTMLElement>('.panel');
    this.dragStartWidths = Array.from(panels).map(p => p.getBoundingClientRect().width);

    document.addEventListener('mousemove', this.boundDragMove);
    document.addEventListener('mouseup', this.boundDragEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  private onDragMove(event: MouseEvent): void {
    if (this.dragIndex < 0) return;

    const delta = event.clientX - this.dragStartX;
    const leftIdx = this.dragIndex;
    const rightIdx = this.dragIndex + 1;

    const minWidth = 150;
    let newLeft = this.dragStartWidths[leftIdx] + delta;
    let newRight = this.dragStartWidths[rightIdx] - delta;

    if (newLeft < minWidth) {
      newLeft = minWidth;
      newRight = this.dragStartWidths[leftIdx] + this.dragStartWidths[rightIdx] - minWidth;
    }
    if (newRight < minWidth) {
      newRight = minWidth;
      newLeft = this.dragStartWidths[leftIdx] + this.dragStartWidths[rightIdx] - minWidth;
    }

    const totalWidth = this.dragStartWidths.reduce((a, b) => a + b, 0);
    const widths = [...this.dragStartWidths];
    widths[leftIdx] = newLeft;
    widths[rightIdx] = newRight;

    this.panelWidths = widths.map(w => ((w / totalWidth) * 100).toFixed(2) + '%');
    this.cdr.markForCheck();
  }

  private onDragEnd(): void {
    this.dragIndex = -1;
    document.removeEventListener('mousemove', this.boundDragMove);
    document.removeEventListener('mouseup', this.boundDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  /* ---------------- RESIZABLE SECTIONS (VERTICAL - COMPOSITE) ---------------- */

  // Heights for each section within composite panels: [description, syntax, output]
  compositeSectionHeights = ['120px', '140px', '220px'];
  private vDragIndex = -1;
  private vDragStartY = 0;
  private vDragStartHeights: number[] = [];
  private vDragContainer: HTMLElement | null = null;
  private boundVDragMove = this.onVDragMove.bind(this);
  private boundVDragEnd = this.onVDragEnd.bind(this);

  onVDragStart(event: MouseEvent, handleIndex: number, panelEl: HTMLElement): void {
    event.preventDefault();
    this.vDragIndex = handleIndex;
    this.vDragStartY = event.clientY;
    this.vDragContainer = panelEl;

    const sections = panelEl.querySelectorAll<HTMLElement>('.resizable-section');
    this.vDragStartHeights = Array.from(sections).map(s => s.getBoundingClientRect().height);

    document.addEventListener('mousemove', this.boundVDragMove);
    document.addEventListener('mouseup', this.boundVDragEnd);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }

  private onVDragMove(event: MouseEvent): void {
    if (this.vDragIndex < 0) return;

    const delta = event.clientY - this.vDragStartY;
    const topIdx = this.vDragIndex;
    const bottomIdx = this.vDragIndex + 1;

    const minHeight = 60;
    let newTop = this.vDragStartHeights[topIdx] + delta;
    let newBottom = this.vDragStartHeights[bottomIdx] - delta;

    if (newTop < minHeight) {
      newTop = minHeight;
      newBottom = this.vDragStartHeights[topIdx] + this.vDragStartHeights[bottomIdx] - minHeight;
    }
    if (newBottom < minHeight) {
      newBottom = minHeight;
      newTop = this.vDragStartHeights[topIdx] + this.vDragStartHeights[bottomIdx] - minHeight;
    }

    const heights = [...this.compositeSectionHeights];
    heights[topIdx] = newTop + 'px';
    heights[bottomIdx] = newBottom + 'px';
    this.compositeSectionHeights = heights;
    this.cdr.markForCheck();
  }

  private onVDragEnd(): void {
    this.vDragIndex = -1;
    this.vDragContainer = null;
    document.removeEventListener('mousemove', this.boundVDragMove);
    document.removeEventListener('mouseup', this.boundVDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
}