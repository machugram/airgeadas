import { MoneySlice, PayEstimate, PayRequest, TaxCreditLine } from './models';

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

function finite(value: number | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

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
    const sliceAmount = Math.min(gross, bandTop) - previous;
    if (sliceAmount > 0) {
      tax += sliceAmount * band.rate;
    }
    previous = bandTop;
    if (gross <= bandTop) {
      break;
    }
  }
  return tax;
}

function rentCreditAmount(annualRent: number, household: PayRequest['household'], claim: boolean): number {
  if (!claim || annualRent <= 0) {
    return 0;
  }
  const cap = household === 'Couple' ? 2_000 : 1_000;
  return eur(Math.min(cap, annualRent * 0.2));
}

function taxProfile(request: PayRequest): {
  cutOff: number;
  label: string;
  lines: TaxCreditLine[];
  credits: number;
} {
  const household = request.household ?? 'Single';
  const earners = request.coupleEarners ?? 'OneIncome';
  const childCarer = Boolean(request.childCarer) && household === 'Single';
  const homeCarer = Boolean(request.homeCarer) && household === 'Couple';
  const age65 = Boolean(request.age65);
  const monthlyRent = Math.max(0, request.monthlyRent ?? 0);
  const annualRent = monthlyRent * 12;
  const claimRent = Boolean(request.claimRentCredit);
  const potentialRent = rentCreditAmount(annualRent, household, true);
  const rentCredit = claimRent ? potentialRent : 0;

  let cutOff = 44_000;
  let personal = 2_000;
  let label = 'aonair (single), PAYE';

  if (household === 'Couple') {
    if (homeCarer || earners === 'OneIncome') {
      cutOff = 53_000;
      personal = 4_000;
      label = homeCarer ? 'cúpla (couple), home carer' : 'cúpla (couple), one income';
    } else {
      cutOff = 44_000;
      personal = 2_000;
      label = 'cúpla (couple), two incomes';
    }
  } else if (childCarer) {
    cutOff = 48_000;
    label = 'aonair (single), child carer';
  }

  const payeCredit = 2_000;
  const childCarerCredit = childCarer ? 1_900 : 0;
  const homeCarerCredit = homeCarer ? 1_950 : 0;
  const ageCredit = age65 ? (household === 'Couple' ? 490 : 245) : 0;

  const lines: TaxCreditLine[] = [
    { id: 'personal', label: 'Personal', amount: personal, included: true },
    { id: 'paye', label: 'Employee PAYE', amount: payeCredit, included: true },
    { id: 'rent', label: 'Cíos (rent)', amount: potentialRent, included: claimRent && rentCredit > 0 },
    { id: 'child', label: 'Single person child carer', amount: childCarerCredit, included: childCarer },
    { id: 'home', label: 'Home carer', amount: homeCarerCredit, included: homeCarer },
    { id: 'age', label: 'Age 65+', amount: ageCredit, included: age65 },
  ];

  const credits = lines.reduce((sum, line) => sum + (line.included ? line.amount : 0), 0);
  return { cutOff, label, lines, credits };
}

function pensionRates(request: PayRequest): {
  employee: number;
  employer: number;
  state: number;
  label: string;
} {
  if (request.pensionScheme === 'None') {
    return { employee: 0, employer: 0, state: 0, label: 'No pinsin (pension)' };
  }
  if (request.pensionScheme === 'AutoEnrol') {
    return { employee: 0.015, employer: 0.015, state: 0.005, label: 'MyFutureFund 1.5%' };
  }
  const percent = clamp(request.occupationalPercent, 0, 40);
  const match = clamp(request.employerMatchPercent ?? 0, 0, 40);
  const label = Number.isInteger(percent)
    ? String(percent)
    : percent.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return {
    employee: percent / 100,
    employer: match / 100,
    state: 0,
    label: `Occupational ${label}%`,
  };
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
  employeeRate: number,
  employerRate: number,
  scheme: PayRequest['pensionScheme'],
  srcop: number,
  credits: number,
  uscScale: number,
  prsiRate: number,
) {
  const pension = scheme === 'None' ? 0 : gross * employeeRate;
  const employerPension = scheme === 'None' ? 0 : gross * employerRate;
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
    employerPension: eur(employerPension),
    taxable: eur(taxable),
    incomeTax: taxR,
    usc: uscR,
    prsi: prsiR,
    net: eur(grossR - deductions),
    deductions,
  };
}

function scaleSlice(slice: MoneySlice, factor: number): MoneySlice {
  const gross = eur(slice.gross * factor);
  const pension = eur(slice.pension * factor);
  const employerPension = eur(slice.employerPension * factor);
  const taxable = eur(slice.taxable * factor);
  const incomeTax = eur(slice.incomeTax * factor);
  const usc = eur(slice.usc * factor);
  const prsi = eur(slice.prsi * factor);
  const deductions = eur(pension + incomeTax + usc + prsi);
  return {
    gross,
    pension,
    employerPension,
    taxable,
    incomeTax,
    usc,
    prsi,
    net: eur(gross - deductions),
    deductions,
  };
}

export const STANDARD_WEEK_HOURS = 39;

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
  const tax = taxProfile(request);
  const scheme = pensionRates(request);
  const salary = Math.max(0, finite(request.annualSalary));
  const bonus = Math.max(0, finite(request.annualBonus));
  const hours = clamp(finite(request.hoursPerWeek) || STANDARD_WEEK_HOURS, 1, 80);
  const annualGross = salary + bonus;
  const monthlySalary = salary / 12;
  const monthly = annualGross / 12;
  const firstGross = dim === 0 ? 0 : (monthlySalary * daysWorked) / dim;
  const periodPrsi = employeePrsiRate(year, month);
  const annualPrsi = annualPrsiRate(year);

  const first = slice(
    firstGross,
    scheme.employee,
    scheme.employer,
    request.pensionScheme,
    tax.cutOff / 12,
    tax.credits / 12,
    12,
    periodPrsi,
  );
  const full = slice(
    monthly,
    scheme.employee,
    scheme.employer,
    request.pensionScheme,
    tax.cutOff / 12,
    tax.credits / 12,
    12,
    periodPrsi,
  );
  const yearPay = slice(
    annualGross,
    scheme.employee,
    scheme.employer,
    request.pensionScheme,
    tax.cutOff,
    tax.credits,
    1,
    annualPrsi,
  );

  const remainingMonths = 12 - month;
  const monthlyRent = Math.max(0, request.monthlyRent ?? 0);
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
      statusLabel: tax.label,
      standardRateCutOff: tax.cutOff,
      taxCredits: tax.credits,
      creditLines: tax.lines,
      periodPrsiRate: periodPrsi,
      annualPrsiRate: annualPrsi,
    },
    pension: {
      scheme: request.pensionScheme,
      label: scheme.label,
      employeeRate: scheme.employee,
      employerRate: scheme.employer,
      firstMonthEmployer: first.employerPension,
      fullMonthEmployer: full.employerPension,
      fullYearEmployer: yearPay.employerPension,
      firstMonthState: eur(firstGross * scheme.state),
      firstMonthPot: eur(first.pension + first.employerPension + firstGross * scheme.state),
    },
    rent: {
      monthly: eur(monthlyRent),
      annual: eur(monthlyRent * 12),
      credit: tax.lines.find((line) => line.id === 'rent' && line.included)?.amount ?? 0,
    },
    monthlyGross: eur(monthly),
    restOfCalendarYearGross: eur(firstGross + remainingMonths * monthlySalary),
    annualBonus: eur(bonus),
    hoursPerWeek: hours,
    periods: {
      yearly: yearPay,
      monthly: full,
      fortnightly: scaleSlice(yearPay, 1 / 26),
      weekly: scaleSlice(yearPay, 1 / 52),
      hourly: scaleSlice(yearPay, 1 / (52 * hours)),
    },
  };
}
