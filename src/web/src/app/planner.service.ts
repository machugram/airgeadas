import { computed, Injectable, signal } from '@angular/core';
import { Cadence, EntryKind, MoneyEntry } from './models';

const STORAGE_KEY = 'clearplan-entries-v1';

export const INCOME_CATEGORIES = [
  'Work',
  'Freelance',
  'Benefits',
  'Rent received',
  'Investments',
  'Other',
] as const;

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Bills',
  'Health',
  'Debt',
  'Savings',
  'Investments',
  'Emergency',
  'Pension',
  'Other',
] as const;

export function monthlyAmount(entry: MoneyEntry): number {
  if (entry.cadence === 'weekly') {
    return (entry.amount * 52) / 12;
  }
  if (entry.cadence === 'yearly') {
    return entry.amount / 12;
  }
  return entry.amount;
}

@Injectable({ providedIn: 'root' })
export class PlannerService {
  readonly entries = signal<MoneyEntry[]>(this.load());

  readonly incomeMonthly = computed(() =>
    this.entries()
      .filter((entry) => entry.kind === 'income')
      .reduce((sum, entry) => sum + monthlyAmount(entry), 0),
  );

  readonly spendingMonthly = computed(() =>
    this.entries()
      .filter((entry) => entry.kind === 'expense')
      .reduce((sum, entry) => sum + monthlyAmount(entry), 0),
  );

  readonly leftover = computed(() => roundMoney(this.incomeMonthly() - this.spendingMonthly()));

  readonly spendingByCategory = computed(() => {
    const totals = new Map<string, number>();
    for (const entry of this.entries()) {
      if (entry.kind !== 'expense') {
        continue;
      }
      const amount = monthlyAmount(entry);
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + amount);
    }
    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .filter((row) => row.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  });

  ofKind(kind: EntryKind): MoneyEntry[] {
    return this.entries().filter((entry) => entry.kind === kind);
  }

  add(input: Omit<MoneyEntry, 'id'>): MoneyEntry {
    const entry: MoneyEntry = { ...input, id: crypto.randomUUID() };
    this.entries.update((list) => {
      const next = [...list, entry];
      this.save(next);
      return next;
    });
    return entry;
  }

  addOrReplace(input: Omit<MoneyEntry, 'id'>): MoneyEntry {
    const existing = this.entries().find(
      (entry) => entry.kind === input.kind && entry.name === input.name,
    );
    if (!existing) {
      return this.add(input);
    }
    const nextEntry = { ...existing, ...input };
    this.entries.update((list) => {
      const next = list.map((entry) => (entry.id === existing.id ? nextEntry : entry));
      this.save(next);
      return next;
    });
    return nextEntry;
  }

  remove(id: string): void {
    this.entries.update((list) => {
      const next = list.filter((entry) => entry.id !== id);
      this.save(next);
      return next;
    });
  }

  private load(): MoneyEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as MoneyEntry[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      const renamed = glossIrishNames(parsed);
      if (renamed !== parsed) {
        this.save(renamed);
      }
      return renamed;
    } catch {
      return [];
    }
  }

  private save(entries: MoneyEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Private mode or a full disk. The plan still lives in this session.
    }
  }
}

function glossIrishNames(entries: MoneyEntry[]): MoneyEntry[] {
  const names: Record<string, string> = {
    'Tuarastal glan': 'Tuarastal glan (net pay)',
    Cíos: 'Cíos (rent)',
  };
  let changed = false;
  const next = entries.map((entry) => {
    const name = names[entry.name];
    if (!name) {
      return entry;
    }
    changed = true;
    return { ...entry, name };
  });
  return changed ? next : entries;
}

export function cadenceLabel(cadence: Cadence): string {
  if (cadence === 'weekly') {
    return 'week';
  }
  if (cadence === 'yearly') {
    return 'year';
  }
  return 'month';
}

function roundMoney(value: number): number {
  if (Math.abs(value) < 0.005) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
