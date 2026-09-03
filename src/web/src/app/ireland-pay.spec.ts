import { estimatePay } from './ireland-pay';

describe('estimatePay', () => {
  it('matches August 2026 single occupational 5%', () => {
    const estimate = estimatePay({
      annualSalary: 74000,
      year: 2026,
      month: 8,
      daysAfterFirst: 5,
      status: 'Single',
      pensionScheme: 'Occupational',
      occupationalPercent: 5,
    });

    expect(estimate.calendar.daysWorked).toBe(26);
    expect(estimate.calendar.startDay).toBe(6);
    expect(estimate.calendar.weekdaysWorked).toBe(18);
    expect(estimate.firstMonth.gross).toBe(5172.04);
    expect(estimate.firstMonth.pension).toBe(258.6);
    expect(estimate.firstMonth.incomeTax).toBe(898.71);
    expect(estimate.firstMonth.usc).toBe(116.23);
    expect(estimate.firstMonth.prsi).toBe(217.23);
    expect(estimate.firstMonth.net).toBe(3681.27);
    expect(estimate.fullMonth.gross).toBe(6166.67);
    expect(estimate.fullMonth.net).toBe(4160.12);
  });

  it('does not give MyFutureFund income-tax relief', () => {
    const occupational = estimatePay({
      annualSalary: 74000,
      year: 2026,
      month: 8,
      daysAfterFirst: 5,
      status: 'Single',
      pensionScheme: 'Occupational',
      occupationalPercent: 5,
    });
    const autoEnrol = estimatePay({
      annualSalary: 74000,
      year: 2026,
      month: 8,
      daysAfterFirst: 5,
      status: 'Single',
      pensionScheme: 'AutoEnrol',
      occupationalPercent: 0,
    });

    expect(autoEnrol.firstMonth.incomeTax).toBeGreaterThan(occupational.firstMonth.incomeTax);
    expect(autoEnrol.pension.employeeRate).toBe(0.015);
  });
});
