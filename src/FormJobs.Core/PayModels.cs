namespace FormJobs.Core;

public enum TaxStatus
{
    Single,
    MarriedOneIncome,
    SinglePersonChildCarer
}

public enum PensionScheme
{
    None,
    Occupational,
    AutoEnrol
}

public sealed record PayRequest(
    decimal AnnualSalary,
    int Year,
    int Month,
    int DaysAfterFirst,
    TaxStatus Status,
    PensionScheme PensionScheme,
    decimal OccupationalPercent);

public sealed record MoneySlice(
    decimal Gross,
    decimal Pension,
    decimal Taxable,
    decimal IncomeTax,
    decimal Usc,
    decimal Prsi,
    decimal Net,
    decimal Deductions);

public sealed record CalendarBreakdown(
    int Year,
    int Month,
    string MonthName,
    int DaysInMonth,
    int StartDay,
    int DaysWorked,
    int DaysMissed,
    int WeekdaysInMonth,
    int WeekdaysWorked,
    DateOnly? StartDate);

public sealed record TaxBreakdown(
    string StatusLabel,
    decimal StandardRateCutOff,
    decimal TaxCredits,
    decimal PeriodPrsiRate,
    decimal AnnualPrsiRate);

public sealed record PensionBreakdown(
    PensionScheme Scheme,
    string Label,
    decimal EmployeeRate,
    decimal FirstMonthEmployer,
    decimal FirstMonthState,
    decimal FirstMonthPot);

public sealed record PayEstimate(
    MoneySlice FirstMonth,
    MoneySlice FullMonth,
    MoneySlice FullYear,
    CalendarBreakdown Calendar,
    TaxBreakdown Tax,
    PensionBreakdown Pension,
    decimal MonthlyGross,
    decimal RestOfCalendarYearGross);

public sealed record TaxRateBand(string Label, string Threshold, string Rate);

public sealed record RateCard(
    int Year,
    IReadOnlyList<TaxRateBand> IncomeTax,
    IReadOnlyList<TaxRateBand> Usc,
    IReadOnlyList<TaxRateBand> Prsi,
    IReadOnlyList<TaxRateBand> Credits,
    IReadOnlyList<string> Notes);
