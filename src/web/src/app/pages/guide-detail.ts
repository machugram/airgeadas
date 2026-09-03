import { Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormJobsService } from '../formjobs.service';
import { Guide } from '../models';

@Component({
  selector: 'app-guide-detail',
  imports: [RouterLink],
  templateUrl: './guide-detail.html',
})
export class GuideDetailPage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  readonly guide = signal<Guide | null>(null);
  readonly missing = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const found = this.jobs.guide(params.get('slug') ?? '');
      this.guide.set(found ?? null);
      this.missing.set(!found);
      this.title.setTitle(found ? `${found.title} · Clearplan` : 'Guide not found · Clearplan');
    });
  }
}
