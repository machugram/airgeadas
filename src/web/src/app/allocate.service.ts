import { Injectable, signal } from '@angular/core';
import { LeftoverPot } from './models';

const STORAGE_KEY = 'clearplan-leftover-pots-v1';

export const DEFAULT_POTS: LeftoverPot[] = [
  { id: 'savings', name: 'Coigiltis (savings)', category: 'Savings', amount: 0 },
  { id: 'stocks', name: 'Stocanna (stocks)', category: 'Investments', amount: 0 },
  { id: 'emergency', name: 'Ciste práinne (emergency)', category: 'Emergency', amount: 0 },
  { id: 'pension', name: 'Pinsin extra (pension)', category: 'Pension', amount: 0 },
];

@Injectable({ providedIn: 'root' })
export class AllocateService {
  readonly pots = signal<LeftoverPot[]>(this.load());

  setAmount(id: string, amount: number): void {
    const next = Math.max(0, roundMoney(amount));
    this.pots.update((list) => {
      const updated = list.map((pot) => (pot.id === id ? { ...pot, amount: next } : pot));
      this.save(updated);
      return updated;
    });
  }

  planned(): number {
    return this.pots().reduce((sum, pot) => sum + pot.amount, 0);
  }

  remaining(leftover: number): number {
    const rest = Math.max(0, leftover) - this.planned();
    if (Math.abs(rest) < 0.005) {
      return 0;
    }
    return roundMoney(rest);
  }

  suggest(leftover: number): void {
    const spare = Math.max(0, leftover);
    const savings = roundMoney(spare * 0.5);
    const stocks = roundMoney(spare * 0.3);
    const emergency = roundMoney(spare - savings - stocks);
    this.pots.update((list) => {
      const updated = list.map((pot) => {
        if (pot.id === 'savings') {
          return { ...pot, amount: savings };
        }
        if (pot.id === 'stocks') {
          return { ...pot, amount: stocks };
        }
        if (pot.id === 'emergency') {
          return { ...pot, amount: emergency };
        }
        return { ...pot, amount: 0 };
      });
      this.save(updated);
      return updated;
    });
  }

  clear(): void {
    const updated = this.pots().map((pot) => ({ ...pot, amount: 0 }));
    this.save(updated);
    this.pots.set(updated);
  }

  private load(): LeftoverPot[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return DEFAULT_POTS.map((pot) => ({ ...pot }));
      }
      const parsed = JSON.parse(raw) as LeftoverPot[];
      if (!Array.isArray(parsed)) {
        return DEFAULT_POTS.map((pot) => ({ ...pot }));
      }
      return DEFAULT_POTS.map((seed) => {
        const found = parsed.find((pot) => pot.id === seed.id);
        return { ...seed, amount: Math.max(0, Number(found?.amount) || 0) };
      });
    } catch {
      return DEFAULT_POTS.map((pot) => ({ ...pot }));
    }
  }

  private save(pots: LeftoverPot[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pots));
    } catch {
      // Private mode or a full disk. The draft still lives in this session.
    }
  }
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
