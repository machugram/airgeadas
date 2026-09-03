import { estimatePay } from './ireland-pay';

const base = {
  annualSalary: 74000,
  year: 2026,
  month: 8,
  daysAfterFirst: 5,
  household: 'Single' as const,
  pensionScheme: 'Occupational' as const,
  occupationalPercent: 5,
};

describe('estimatePay', () => {
  it('matches August 2026 single occupational 5%', () => {
    const estimate = estimatePay(base);

    expect(estimate.calendar.daysWorked).toBe(26);
    expect(estimate.calendar.startDay).toBe(6);
    expect(estimate.calendar.weekdaysWorked).toBe(18);
    expect(estimate.firstMonth.gross).toBe(5172.04);
    expect(estimate.firstMonth.pension).toBe(258.6);
    expect(estimate.firstMonth.employerPension).toBe(0);
    expect(estimate.firstMonth.incomeTax).toBe(898.71);
    expect(estimate.firstMonth.usc).toBe(116.23);
    expect(estimate.firstMonth.prsi).toBe(217.23);
    expect(estimate.firstMonth.net).toBe(3681.27);
    expect(estimate.fullMonth.gross).toBe(6166.67);
    expect(estimate.fullMonth.net).toBe(4160.12);
  });

  it('does not give MyFutureFund income-tax relief', () => {
    const occupational = estimatePay(base);
    const autoEnrol = estimatePay({
      ...base,
      pensionScheme: 'AutoEnrol',
      occupationalPercent: 0,
    });

    expect(autoEnrol.firstMonth.incomeTax).toBeGreaterThan(occupational.firstMonth.incomeTax);
    expect(autoEnrol.pension.employeeRate).toBe(0.015);
    expect(autoEnrol.pension.employerRate).toBe(0.015);
  });

  it('keeps net the same when the employer matches pinsin', () => {
    const unmatched = estimatePay(base);
    const matched = estimatePay({ ...base, employerMatchPercent: 5 });

    expect(matched.firstMonth.net).toBe(unmatched.firstMonth.net);
    expect(matched.firstMonth.employerPension).toBe(258.6);
    expect(matched.pension.firstMonthPot).toBe(517.2);
  });

  it('applies the rent tax credit to PAYE only', () => {
    const plain = estimatePay(base);
    const withRent = estimatePay({
      ...base,
      monthlyRent: 2000,
      claimRentCredit: true,
    });

    expect(withRent.rent.credit).toBe(1000);
    expect(withRent.firstMonth.usc).toBe(plain.firstMonth.usc);
    expect(withRent.firstMonth.incomeTax).toBe(815.38);
    expect(withRent.firstMonth.net).toBeGreaterThan(plain.firstMonth.net);
  });

  it('gives a cúpla one-income household a wider cut-off and more credits', () => {
    const single = estimatePay(base);
    const couple = estimatePay({
      ...base,
      household: 'Couple',
      coupleEarners: 'OneIncome',
    });

    expect(couple.tax.standardRateCutOff).toBe(53000);
    expect(couple.tax.taxCredits).toBe(6000);
    expect(couple.fullMonth.incomeTax).toBeLessThan(single.fullMonth.incomeTax);
  });

  it('puts an annual bonus into the year, not the first payslip', () => {
    const plain = estimatePay(base);
    const withBonus = estimatePay({ ...base, annualBonus: 6000 });

    expect(withBonus.firstMonth.net).toBe(plain.firstMonth.net);
    expect(withBonus.fullYear.gross).toBe(80000);
    expect(withBonus.fullMonth.gross).toBe(6666.67);
    expect(withBonus.fullYear.net).toBeLessThan(plain.fullYear.net + 6000);
  });

  it('scales the year into week and hour periods', () => {
    const estimate = estimatePay(base);

    expect(estimate.periods.monthly).toEqual(estimate.fullMonth);
    expect(estimate.periods.weekly.gross).toBe(1423.08);
    expect(estimate.hoursPerWeek).toBe(39);
    expect(estimate.periods.hourly.gross).toBe(36.49);
  });
});
