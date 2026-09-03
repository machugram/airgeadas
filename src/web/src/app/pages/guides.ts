import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormJobsService } from '../formjobs.service';
import { GuideListItem } from '../models';

@Component({
  selector: 'app-guides',
  imports: [RouterLink],
  templateUrl: './guides.html',
})
export class GuidesPage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  readonly guides = signal<GuideListItem[]>([]);

  ngOnInit(): void {
    this.guides.set(this.jobs.guides());
  }
}
