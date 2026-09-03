import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { EurPipe } from '../eur.pipe';
import { Cadence, EntryKind } from '../models';
import {
  cadenceLabel,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  monthlyAmount,
  PlannerService,
} from '../planner.service';

@Component({
  selector: 'app-flow',
  imports: [ReactiveFormsModule, EurPipe],
  templateUrl: './flow.html',
})
export class FlowPage {
  private readonly planner = inject(PlannerService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly kind = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map((): EntryKind => (this.router.url.includes('spending') ? 'expense' : 'income')),
    ),
    { initialValue: 'income' as EntryKind },
  );

  readonly title = computed(() => (this.kind() === 'income' ? 'Income' : 'Spending'));
  readonly kicker = computed(() => (this.kind() === 'income' ? 'Money in' : 'Money out'));
  readonly lede = computed(() =>
    this.kind() === 'income'
      ? 'Salary is one kind of income. Add freelance, benefits, cíos (rent), or anything else that repeats.'
      : 'Cíos (rent), groceries, bills, debt, and savings you have already promised.',
  );
  readonly categories = computed(() =>
    this.kind() === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES,
  );
  readonly cadenceLabel = cadenceLabel;
  readonly monthlyAmount = monthlyAmount;

  readonly form = this.fb.nonNullable.group({
    name: '',
    amount: 0,
    cadence: this.fb.nonNullable.control<Cadence>('monthly'),
    category: this.fb.nonNullable.control<string>(INCOME_CATEGORIES[0]),
  });

  readonly rows = computed(() => this.planner.ofKind(this.kind()));
  readonly total = computed(() =>
    this.kind() === 'income' ? this.planner.incomeMonthly() : this.planner.spendingMonthly(),
  );

  constructor() {
    effect(() => {
      const categories = this.categories() as readonly string[];
      const current = this.form.controls.category.value;
      if (!categories.includes(current)) {
        this.form.controls.category.setValue(categories[0]);
      }
    });
  }

  add(): void {
    const value = this.form.getRawValue();
    const amount = Number(value.amount);
    const name = value.name.trim();
    if (!name || !(amount > 0)) {
      return;
    }
    const categories = this.categories() as readonly string[];
    const category = categories.includes(value.category) ? value.category : categories[0];
    this.planner.add({
      kind: this.kind(),
      name,
      amount,
      cadence: value.cadence,
      category,
    });
    this.form.patchValue({ name: '', amount: 0 });
  }

  remove(id: string): void {
    this.planner.remove(id);
  }
}
