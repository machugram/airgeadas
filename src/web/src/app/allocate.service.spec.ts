import { AllocateService } from './allocate.service';

describe('AllocateService', () => {
  beforeEach(() => {
    localStorage.removeItem('clearplan-leftover-pots-v1');
  });

  it('suggests a 50 / 30 / 20 split of leftover', () => {
    const allocate = new AllocateService();
    allocate.suggest(1000);

    expect(allocate.pots().find((pot) => pot.id === 'savings')?.amount).toBe(500);
    expect(allocate.pots().find((pot) => pot.id === 'stocks')?.amount).toBe(300);
    expect(allocate.pots().find((pot) => pot.id === 'emergency')?.amount).toBe(200);
    expect(allocate.remaining(1000)).toBe(0);
  });

  it('flags an over-plan', () => {
    const allocate = new AllocateService();
    allocate.setAmount('stocks', 400);
    expect(allocate.remaining(250)).toBe(-150);
  });
});
