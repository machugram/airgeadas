import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs';
import { EurPipe } from '../eur.pipe';
import { FormJobsService } from '../formjobs.service';
import { PayEstimate, PayRequest } from '../models';

@Component({
  selector: 'app-pay',
  imports: [ReactiveFormsModule, EurPipe],
  templateUrl: './pay.html',
})
export class PayPage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

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
    year: 2026,
    month: 8,
    daysAfterFirst: 5,
    status: this.fb.nonNullable.control<PayRequest['status']>('Single'),
    pensionScheme: this.fb.nonNullable.control<PayRequest['pensionScheme']>('Occupational'),
    occupationalPercent: 5,
  });

  readonly estimate = signal<PayEstimate | null>(null);

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(startWith(this.form.getRawValue()), debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.estimate.set(
          this.jobs.estimate({
            annualSalary: Number(value.annualSalary),
            year: Number(value.year),
            month: Number(value.month),
            daysAfterFirst: Number(value.daysAfterFirst),
            status: value.status ?? 'Single',
            pensionScheme: value.pensionScheme ?? 'Occupational',
            occupationalPercent: Number(value.occupationalPercent),
          }),
        );
      });
  }

  share(gross: number, part: number): number {
    if (!gross) {
      return 0;
    }
    return Math.max(0, (part / gross) * 100);
  }
}
