import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, startWith } from 'rxjs';
import { EurPipe } from '../eur.pipe';
import { FormJobsService } from '../formjobs.service';
import {
  CoupleEarners,
  Household,
  MoneySlice,
  PayEstimate,
  PayFrequency,
  PayRequest,
  PensionScheme,
} from '../models';
import { PlannerService } from '../planner.service';

@Component({
  selector: 'app-pay',
  imports: [ReactiveFormsModule, EurPipe, RouterLink],
  templateUrl: './pay.html',
})
export class PayPage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  private readonly planner = inject(PlannerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly now = new Date();
  private syncingPay = false;

  readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  readonly form = this.fb.nonNullable.group({
    annualSalary: 74000,
    monthlyGross: 6166.67,
    annualBonus: 0,
    frequency: this.fb.nonNullable.control<PayFrequency>('monthly'),
    hoursPerWeek: 39,
    year: this.now.getFullYear(),
    month: this.now.getMonth() + 1,
    daysAfterFirst: 0,
    household: this.fb.nonNullable.control<Household>('Single'),
    coupleEarners: this.fb.nonNullable.control<CoupleEarners>('OneIncome'),
    pensionScheme: this.fb.nonNullable.control<PensionScheme>('Occupational'),
    occupationalPercent: 5,
    employerMatchPercent: 5,
    monthlyRent: 0,
    claimRentCredit: true,
    childCarer: false,
    homeCarer: false,
    age65: false,
  });

  readonly estimate = signal<PayEstimate | null>(null);
  readonly added = signal(false);

  ngOnInit(): void {
    this.form.controls.annualSalary.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.syncingPay) {
          return;
        }
        this.syncingPay = true;
        this.form.controls.monthlyGross.setValue(roundMoney(Number(value) / 12));
        this.syncingPay = false;
      });

    this.form.controls.monthlyGross.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.syncingPay) {
          return;
        }
        this.syncingPay = true;
        this.form.controls.annualSalary.setValue(roundMoney(Number(value) * 12));
        this.syncingPay = false;
      });

    this.form.valueChanges
      .pipe(startWith(this.form.getRawValue()), debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.added.set(false);
        this.estimate.set(this.jobs.estimate(this.toRequest()));
      });
  }

  addToPlan(): void {
    const pay = this.estimate();
    if (!pay || !(pay.fullMonth.net > 0)) {
      return;
    }
    this.planner.addOrReplace({
      kind: 'income',
      name: 'Tuarastal glan (net pay)',
      amount: pay.fullMonth.net,
      cadence: 'monthly',
      category: 'Work',
    });
    if (pay.rent.monthly > 0) {
      this.planner.addOrReplace({
        kind: 'expense',
        name: 'Cíos (rent)',
        amount: pay.rent.monthly,
        cadence: 'monthly',
        category: 'Housing',
      });
    }
    this.added.set(true);
  }

  share(gross: number, part: number): number {
    if (!gross) {
      return 0;
    }
    return Math.max(0, (part / gross) * 100);
  }

  ofGross(part: number, gross: number): string {
    if (!gross) {
      return '0%';
    }
    return `${((part / gross) * 100).toFixed(1)}%`;
  }

  shown(pay: PayEstimate): MoneySlice {
    return pay.periods[this.form.controls.frequency.value];
  }

  showAs(frequency: PayFrequency): void {
    this.form.controls.frequency.setValue(frequency);
  }

  periodLabel(): string {
    const frequency = this.form.controls.frequency.value;
    if (frequency === 'yearly') {
      return 'Year';
    }
    if (frequency === 'fortnightly') {
      return 'Fortnight';
    }
    if (frequency === 'weekly') {
      return 'Week';
    }
    if (frequency === 'hourly') {
      return `Hour (${this.form.controls.hoursPerWeek.value}h week)`;
    }
    return 'Month';
  }

  isFrequency(id: PayFrequency): boolean {
    return this.form.controls.frequency.value === id;
  }

  private toRequest(): PayRequest {
    const value = this.form.getRawValue();
    return {
      annualSalary: asMoney(value.annualSalary),
      year: Number(value.year) || this.now.getFullYear(),
      month: Number(value.month) || this.now.getMonth() + 1,
      daysAfterFirst: asMoney(value.daysAfterFirst),
      household: value.household ?? 'Single',
      coupleEarners: value.coupleEarners ?? 'OneIncome',
      pensionScheme: value.pensionScheme ?? 'Occupational',
      occupationalPercent: asMoney(value.occupationalPercent),
      employerMatchPercent: asMoney(value.employerMatchPercent),
      monthlyRent: asMoney(value.monthlyRent),
      claimRentCredit: Boolean(value.claimRentCredit),
      childCarer: Boolean(value.childCarer),
      homeCarer: Boolean(value.homeCarer),
      age65: Boolean(value.age65),
      annualBonus: asMoney(value.annualBonus),
      hoursPerWeek: asMoney(value.hoursPerWeek) || 39,
    };
  }
}

function asMoney(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
