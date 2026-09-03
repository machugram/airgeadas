export type Household = 'Single' | 'Couple';
export type CoupleEarners = 'OneIncome' | 'TwoIncomes';
export type PensionScheme = 'None' | 'Occupational' | 'AutoEnrol';

export type PayFrequency = 'yearly' | 'monthly' | 'fortnightly' | 'weekly' | 'hourly';

export interface PayRequest {
  annualSalary: number;
  year: number;
  month: number;
  daysAfterFirst: number;
  household: Household;
  coupleEarners?: CoupleEarners;
  pensionScheme: PensionScheme;
  occupationalPercent: number;
  employerMatchPercent?: number;
  monthlyRent?: number;
  claimRentCredit?: boolean;
  childCarer?: boolean;
  homeCarer?: boolean;
  age65?: boolean;
  annualBonus?: number;
  hoursPerWeek?: number;
}

export interface MoneySlice {
  gross: number;
  pension: number;
  employerPension: number;
  taxable: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  net: number;
  deductions: number;
}

export interface TaxCreditLine {
  id: string;
  label: string;
  amount: number;
  included: boolean;
}

export interface PayEstimate {
  firstMonth: MoneySlice;
  fullMonth: MoneySlice;
  fullYear: MoneySlice;
  calendar: {
    year: number;
    month: number;
    monthName: string;
    daysInMonth: number;
    startDay: number;
    daysWorked: number;
    daysMissed: number;
    weekdaysInMonth: number;
    weekdaysWorked: number;
    startDate: string | null;
  };
  tax: {
    statusLabel: string;
    standardRateCutOff: number;
    taxCredits: number;
    creditLines: TaxCreditLine[];
    periodPrsiRate: number;
    annualPrsiRate: number;
  };
  pension: {
    scheme: string;
    label: string;
    employeeRate: number;
    employerRate: number;
    firstMonthEmployer: number;
    fullMonthEmployer: number;
    fullYearEmployer: number;
    firstMonthState: number;
    firstMonthPot: number;
  };
  rent: {
    monthly: number;
    annual: number;
    credit: number;
  };
  monthlyGross: number;
  restOfCalendarYearGross: number;
  annualBonus: number;
  hoursPerWeek: number;
  periods: {
    yearly: MoneySlice;
    monthly: MoneySlice;
    fortnightly: MoneySlice;
    weekly: MoneySlice;
    hourly: MoneySlice;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
  when: string;
  guideSlug: string | null;
}

export interface GuideListItem {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
}

export interface Guide {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  takeaways: string[];
  sections: { heading: string; body: string }[];
}

export interface RateCard {
  year: number;
  incomeTax: { label: string; threshold: string; rate: string }[];
  usc: { label: string; threshold: string; rate: string }[];
  prsi: { label: string; threshold: string; rate: string }[];
  credits: { label: string; threshold: string; rate: string }[];
  notes: string[];
}

export type Cadence = 'weekly' | 'monthly' | 'yearly';
export type EntryKind = 'income' | 'expense';

export interface MoneyEntry {
  id: string;
  kind: EntryKind;
  name: string;
  amount: number;
  cadence: Cadence;
  category: string;
}

export interface LeftoverPot {
  id: string;
  name: string;
  category: string;
  amount: number;
}

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}
