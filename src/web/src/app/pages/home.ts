import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AllocateService } from '../allocate.service';
import { EurPipe } from '../eur.pipe';
import { PieSlice } from '../models';
import { PieChart } from '../pie-chart';
import { cadenceLabel, monthlyAmount, PlannerService } from '../planner.service';

const MONTH_COLORS = ['#16382e', '#b85a34', '#3d7a9a', '#215445', '#8f3f22', '#c4a35a', '#6b4f71', '#4a7c59'];
const POT_COLORS: Record<string, string> = {
  savings: '#215445',
  stocks: '#b85a34',
  emergency: '#3d7a9a',
  pension: '#6b4f71',
};
const REST_COLOR = '#d4cbb8';

@Component({
  selector: 'app-home',
  imports: [RouterLink, EurPipe, PieChart],
  templateUrl: './home.html',
})
export class HomePage {
  readonly planner = inject(PlannerService);
  readonly allocate = inject(AllocateService);
  readonly cadenceLabel = cadenceLabel;
  readonly monthlyAmount = monthlyAmount;

  readonly monthSlices = computed<PieSlice[]>(() => {
    const slices = this.planner.spendingByCategory().map((row, index) => ({
      label: row.category,
      value: row.amount,
      color: MONTH_COLORS[index % MONTH_COLORS.length],
    }));
    const leftover = this.planner.leftover();
    if (leftover > 0) {
      slices.push({ label: 'Fágtha (leftover)', value: leftover, color: REST_COLOR });
    }
    return slices;
  });

  readonly leftoverSlices = computed<PieSlice[]>(() => {
    const leftover = Math.max(0, this.planner.leftover());
    if (leftover <= 0) {
      return [];
    }
    const slices = this.allocate
      .pots()
      .filter((pot) => pot.amount > 0)
      .map((pot) => ({
        label: pot.name,
        value: pot.amount,
        color: POT_COLORS[pot.id] ?? MONTH_COLORS[0],
      }));
    const rest = this.allocate.remaining(leftover);
    if (rest > 0) {
      slices.push({ label: 'Still unplanned', value: rest, color: REST_COLOR });
    }
    return slices;
  });

  readonly leftoverRemaining = computed(() => this.allocate.remaining(this.planner.leftover()));
  readonly plannedTotal = computed(() => this.allocate.planned());
  readonly leftoverOver = computed(() => this.leftoverRemaining() < 0);
  readonly canCommit = computed(
    () => this.planner.leftover() > 0 && this.plannedTotal() > 0 && !this.leftoverOver(),
  );

  setPot(id: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.allocate.setAmount(id, Number.isFinite(value) ? value : 0);
  }

  suggestSplit(): void {
    this.allocate.suggest(this.planner.leftover());
  }

  addPotsToPlan(): void {
    if (!this.canCommit()) {
      return;
    }
    for (const pot of this.allocate.pots()) {
      if (!(pot.amount > 0)) {
        continue;
      }
      this.planner.addOrReplace({
        kind: 'expense',
        name: pot.name,
        amount: pot.amount,
        cadence: 'monthly',
        category: pot.category,
      });
    }
    this.allocate.clear();
  }
}
