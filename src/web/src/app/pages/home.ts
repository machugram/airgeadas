import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EurPipe } from '../eur.pipe';
import { FormJobsService } from '../formjobs.service';
import { GuideListItem, PayEstimate } from '../models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, EurPipe],
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  readonly estimate = signal<PayEstimate | null>(null);
  readonly guides = signal<GuideListItem[]>([]);

  ngOnInit(): void {
    this.estimate.set(
      this.jobs.estimate({
        annualSalary: 74000,
        year: 2026,
        month: 8,
        daysAfterFirst: 5,
        status: 'Single',
        pensionScheme: 'Occupational',
        occupationalPercent: 5,
      }),
    );
    this.guides.set(this.jobs.guides().slice(0, 3));
  }
}
