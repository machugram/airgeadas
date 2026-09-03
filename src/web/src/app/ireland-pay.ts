import { PayEstimate, PayRequest } from './models';

const MONTH_NAMES = [
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

const USC_BANDS: { limit: number; rate: number }[] = [
  { limit: 12_012, rate: 0.005 },
  { limit: 28_700, rate: 0.02 },
  { limit: 70_044, rate: 0.03 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.08 },
];

function eur(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function countWeekdays(year: number, month: number, startDay: number, endDay: number): number {
  let count = 0;
  for (let day = startDay; day <= endDay; day++) {
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday !== 0 && weekday !== 6) {
      count += 1;
    }
  }
  return count;
}

function incomeTax(taxable: number, srcop: number, credits: number): number {
  const standard = Math.min(Math.max(taxable, 0), srcop);
  const higher = Math.max(0, taxable - srcop);
  return Math.max(0, standard * 0.2 + higher * 0.4 - credits);
}

function uscOn(gross: number, scale: number): number {
  if (gross * scale <= 13_000) {
    return 0;
  }

  let tax = 0;
  let previous = 0;
  for (const band of USC_BANDS) {
    const bandTop = Number.isFinite(band.limit) ? band.limit / scale : Number.POSITIVE_INFINITY;
    const slice = Math.min(gross, bandTop) - previous;
    if (slice > 0) {
      tax += slice * band.rate;
    }
    previous = bandTop;
    if (gross <= bandTop) {
      break;
    }
  }
  return tax;
}

function profile(status: PayRequest['status']): { cutOff: number; credits: number; label: string } {
  if (status === 'MarriedOneIncome') {
    return { cutOff: 53_000, credits: 6_000, label: 'married, one income' };
  }
  if (status === 'SinglePersonChildCarer') {
    return { cutOff: 48_000, credits: 5_900, label: 'single person child carer' };
  }
  return { cutOff: 44_000, credits: 4_000, label: 'single PAYE' };
}

function pensionRate(request: PayRequest): { rate: number; label: string } {
  if (request.pensionScheme === 'None') {
    return { rate: 0, label: 'No pension' };
  }
  if (request.pensionScheme === 'AutoEnrol') {
    return { rate: 0.015, label: 'MyFutureFund 1.5%' };
  }
  const percent = clamp(request.occupationalPercent, 0, 40);
  const label = Number.isInteger(percent) ? String(percent) : percent.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return { rate: percent / 100, label: `Occupational ${label}%` };
}

function employeePrsiRate(year: number, month: number): number {
  if (year > 2026 || (year === 2026 && month >= 10)) {
    return 0.0435;
  }
  return 0.042;
}

function annualPrsiRate(year: number): number {
  if (year === 2026) {
    return (0.042 * 9 + 0.0435 * 3) / 12;
  }
  return year >= 2027 ? 0.0435 : 0.042;
}

function slice(
  gross: number,
  pensionRateValue: number,
  scheme: PayRequest['pensionScheme'],
  srcop: number,
  credits: number,
  uscScale: number,
  prsiRate: number,
) {
  const pension = scheme === 'None' ? 0 : gross * pensionRateValue;
  const taxable = scheme === 'Occupational' ? Math.max(0, gross - pension) : gross;
  const tax = incomeTax(taxable, srcop, credits);
  const usc = uscOn(gross, uscScale);
  const prsi = gross * prsiRate;
  const pensionR = eur(pension);
  const taxR = eur(tax);
  const uscR = eur(usc);
  const prsiR = eur(prsi);
  const grossR = eur(gross);
  const deductions = pensionR + taxR + uscR + prsiR;
  return {
    gross: grossR,
    pension: pensionR,
    taxable: eur(taxable),
    incomeTax: taxR,
    usc: uscR,
    prsi: prsiR,
    net: eur(grossR - deductions),
    deductions,
  };
}

export function estimatePay(request: PayRequest): PayEstimate {
  const year = request.year;
  const month = clamp(Math.round(request.month), 1, 12);
  const delay = Math.max(0, request.daysAfterFirst);
  const dim = daysInMonth(year, month);
  const startDay = Math.min(dim + 1, delay + 1);
  const daysWorked = Math.max(0, dim - delay);
  const daysMissed = Math.min(delay, dim);
  const weekdaysInMonth = countWeekdays(year, month, 1, dim);
  const weekdaysWorked = startDay > dim ? 0 : countWeekdays(year, month, startDay, dim);
  const taxProfile = profile(request.status);
  const scheme = pensionRate(request);
  const monthly = request.annualSalary / 12;
  const firstGross = dim === 0 ? 0 : (monthly * daysWorked) / dim;
  const periodPrsi = employeePrsiRate(year, month);
  const annualPrsi = annualPrsiRate(year);

  const first = slice(
    firstGross,
    scheme.rate,
    request.pensionScheme,
    taxProfile.cutOff / 12,
    taxProfile.credits / 12,
    12,
    periodPrsi,
  );
  const full = slice(
    monthly,
    scheme.rate,
    request.pensionScheme,
    taxProfile.cutOff / 12,
    taxProfile.credits / 12,
    12,
    periodPrsi,
  );
  const yearPay = slice(
    request.annualSalary,
    scheme.rate,
    request.pensionScheme,
    taxProfile.cutOff,
    taxProfile.credits,
    1,
    annualPrsi,
  );

  const remainingMonths = 12 - month;
  const aeEmployer = request.pensionScheme === 'AutoEnrol' ? eur(firstGross * 0.015) : 0;
  const aeState = request.pensionScheme === 'AutoEnrol' ? eur(firstGross * 0.005) : 0;
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    firstMonth: first,
    fullMonth: full,
    fullYear: yearPay,
    calendar: {
      year,
      month,
      monthName: MONTH_NAMES[month - 1],
      daysInMonth: dim,
      startDay,
      daysWorked,
      daysMissed,
      weekdaysInMonth,
      weekdaysWorked,
      startDate: startDay > dim ? null : `${year}-${pad(month)}-${pad(startDay)}`,
    },
    tax: {
      statusLabel: taxProfile.label,
      standardRateCutOff: taxProfile.cutOff,
      taxCredits: taxProfile.credits,
      periodPrsiRate: periodPrsi,
      annualPrsiRate: annualPrsi,
    },
    pension: {
      scheme: request.pensionScheme,
      label: scheme.label,
      employeeRate: scheme.rate,
      firstMonthEmployer: aeEmployer,
      firstMonthState: aeState,
      firstMonthPot: eur(first.pension + aeEmployer + aeState),
    },
    monthlyGross: eur(monthly),
    restOfCalendarYearGross: eur(firstGross + remainingMonths * monthly),
  };
}
