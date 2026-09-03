export interface PayRequest {
  annualSalary: number;
  year: number;
  month: number;
  daysAfterFirst: number;
  status: 'Single' | 'MarriedOneIncome' | 'SinglePersonChildCarer';
  pensionScheme: 'None' | 'Occupational' | 'AutoEnrol';
  occupationalPercent: number;
}

export interface MoneySlice {
  gross: number;
  pension: number;
  taxable: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  net: number;
  deductions: number;
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
    periodPrsiRate: number;
    annualPrsiRate: number;
  };
  pension: {
    scheme: string;
    label: string;
    employeeRate: number;
    firstMonthEmployer: number;
    firstMonthState: number;
    firstMonthPot: number;
  };
  monthlyGross: number;
  restOfCalendarYearGross: number;
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
