import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormJobsService } from '../formjobs.service';
import { ChecklistItem } from '../models';

const STORAGE_KEY = 'first-irish-job-checklist';

@Component({
  selector: 'app-checklist',
  imports: [RouterLink],
  templateUrl: './checklist.html',
})
export class ChecklistPage implements OnInit {
  private readonly jobs = inject(FormJobsService);
  readonly items = signal<ChecklistItem[]>([]);
  readonly done = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.done.set(JSON.parse(stored) as Record<string, boolean>);
      }
    } catch {
      this.done.set({});
    }
    this.items.set(this.jobs.checklist());
  }

  onToggle(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = { ...this.done(), [id]: checked };
    this.done.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or a full disk. Ticks still live in this session.
    }
  }

  completed(): number {
    return this.items().filter((item) => this.done()[item.id]).length;
  }
}
