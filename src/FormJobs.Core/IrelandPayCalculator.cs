namespace FormJobs.Core;

public sealed class IrelandPayCalculator
{
    private static readonly (decimal Limit, decimal Rate)[] UscBands =
    [
        (12_012m, 0.005m),
        (28_700m, 0.02m),
        (70_044m, 0.03m),
        (decimal.MaxValue, 0.08m)
    ];

    private static readonly string[] MonthNames =
    [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    public PayEstimate Estimate(PayRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (request.AnnualSalary < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Salary cannot be negative.");
        }

        var year = request.Year;
        var month = Math.Clamp(request.Month, 1, 12);
        var delay = Math.Max(0, request.DaysAfterFirst);
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var startDay = Math.Min(daysInMonth + 1, delay + 1);
        var daysWorked = Math.Max(0, daysInMonth - delay);
        var daysMissed = Math.Min(delay, daysInMonth);
        var weekdaysInMonth = CountWeekdays(year, month, 1, daysInMonth);
        var weekdaysWorked = startDay > daysInMonth ? 0 : CountWeekdays(year, month, startDay, daysInMonth);
        var monthName = MonthNames[month - 1];
        var profile = Profile(request.Status);
        var (schemeRate, schemeLabel) = PensionRate(request);
        var monthly = request.AnnualSalary / 12m;
        var firstGross = daysInMonth == 0 ? 0 : monthly * daysWorked / daysInMonth;
        var periodPrsi = EmployeePrsiRate(year, month);
        var annualPrsi = AnnualPrsiRate(year);

        var first = Slice(firstGross, schemeRate, request.PensionScheme, profile.CutOff / 12m, profile.Credits / 12m, 12m, periodPrsi);
        var full = Slice(monthly, schemeRate, request.PensionScheme, profile.CutOff / 12m, profile.Credits / 12m, 12m, periodPrsi);
        var yearPay = Slice(request.AnnualSalary, schemeRate, request.PensionScheme, profile.CutOff, profile.Credits, 1m, annualPrsi);

        var remainingMonths = 12 - month;
        var restGross = firstGross + remainingMonths * monthly;
        var aeEmployer = request.PensionScheme == PensionScheme.AutoEnrol ? Eur(firstGross * 0.015m) : 0m;
        var aeState = request.PensionScheme == PensionScheme.AutoEnrol ? Eur(firstGross * 0.005m) : 0m;

        return new PayEstimate(
            FirstMonth: first,
            FullMonth: full,
            FullYear: yearPay,
            Calendar: new CalendarBreakdown(
                year,
                month,
                monthName,
                daysInMonth,
                startDay,
                daysWorked,
                daysMissed,
                weekdaysInMonth,
                weekdaysWorked,
                startDay > daysInMonth ? null : new DateOnly(year, month, startDay)),
            Tax: new TaxBreakdown(profile.Label, profile.CutOff, profile.Credits, periodPrsi, annualPrsi),
            Pension: new PensionBreakdown(
                request.PensionScheme,
                schemeLabel,
                schemeRate,
                aeEmployer,
                aeState,
                Eur(first.Pension + aeEmployer + aeState)),
            MonthlyGross: Eur(monthly),
            RestOfCalendarYearGross: Eur(restGross));
    }

    public static RateCard RatesFor(int year) => new(
        year,
        [
            new TaxRateBand("Personal allowance equivalent", "Credits, not a 0% band", "€4,000 single PAYE credits"),
            new TaxRateBand("Standard rate", "Up to €44,000 taxable (single)", "20%"),
            new TaxRateBand("Higher rate", "Balance", "40%"),
            new TaxRateBand("Married, one income cut-off", "€53,000", "20% then 40%"),
            new TaxRateBand("Single person child carer cut-off", "€48,000", "20% then 40%")
        ],
        [
            new TaxRateBand("Exempt if total income", "€13,000 or under", "0%"),
            new TaxRateBand("Band 1", "First €12,012", "0.5%"),
            new TaxRateBand("Band 2", "Next to €28,700", "2%"),
            new TaxRateBand("Band 3", "Next to €70,044", "3%"),
            new TaxRateBand("Band 4", "Balance", "8%")
        ],
        [
            new TaxRateBand("Class A employee", "Jan–Sep 2026", "4.20%"),
            new TaxRateBand("Class A employee", "From 1 Oct 2026", "4.35%"),
            new TaxRateBand("Weekly exemption", "€352 or less that week", "0%")
        ],
        [
            new TaxRateBand("Single personal credit", "2026", "€2,000"),
            new TaxRateBand("Employee PAYE credit", "2026", "€2,000"),
            new TaxRateBand("Married personal credit", "2026", "€4,000"),
            new TaxRateBand("Single person child carer credit", "2026", "€1,900")
        ],
        [
            "Figures follow Revenue rates for the 2026 tax year (calendar year).",
            "Occupational pension contributions reduce income tax, not USC or PRSI.",
            "MyFutureFund (auto-enrol) is taken from net pay, with a State top-up instead of tax relief.",
            "This is an estimate, not a Revenue computation or financial advice."
        ]);

    private static MoneySlice Slice(
        decimal gross,
        decimal pensionRate,
        PensionScheme scheme,
        decimal srcop,
        decimal credits,
        decimal uscScale,
        decimal prsiRate)
    {
        var pension = scheme == PensionScheme.None ? 0m : gross * pensionRate;
        var taxable = scheme == PensionScheme.Occupational ? Math.Max(0, gross - pension) : gross;
        var tax = IncomeTax(taxable, srcop, credits);
        var usc = UscOn(gross, uscScale);
        var prsi = gross * prsiRate;
        var pensionR = Eur(pension);
        var taxR = Eur(tax);
        var uscR = Eur(usc);
        var prsiR = Eur(prsi);
        var grossR = Eur(gross);
        var deductions = pensionR + taxR + uscR + prsiR;
        return new MoneySlice(
            grossR,
            pensionR,
            Eur(taxable),
            taxR,
            uscR,
            prsiR,
            Eur(grossR - deductions),
            deductions);
    }

    private static decimal IncomeTax(decimal taxable, decimal srcop, decimal credits)
    {
        var standard = Math.Min(Math.Max(taxable, 0), srcop);
        var higher = Math.Max(0, taxable - srcop);
        return Math.Max(0, standard * 0.20m + higher * 0.40m - credits);
    }

    private static decimal UscOn(decimal gross, decimal scale)
    {
        if (gross * scale <= 13_000m)
        {
            return 0m;
        }

        decimal tax = 0m;
        decimal previous = 0m;
        foreach (var (limit, rate) in UscBands)
        {
            var bandTop = limit == decimal.MaxValue ? decimal.MaxValue : limit / scale;
            var slice = Math.Min(gross, bandTop) - previous;
            if (slice > 0)
            {
                tax += slice * rate;
            }

            previous = bandTop;
            if (gross <= bandTop)
            {
                break;
            }
        }

        return tax;
    }

    private static int CountWeekdays(int year, int month, int startDay, int endDay)
    {
        var count = 0;
        for (var day = startDay; day <= endDay; day++)
        {
            var weekday = new DateTime(year, month, day).DayOfWeek;
            if (weekday is not DayOfWeek.Saturday and not DayOfWeek.Sunday)
            {
                count++;
            }
        }

        return count;
    }

    private static (decimal CutOff, decimal Credits, string Label) Profile(TaxStatus status) => status switch
    {
        TaxStatus.MarriedOneIncome => (53_000m, 6_000m, "married, one income"),
        TaxStatus.SinglePersonChildCarer => (48_000m, 5_900m, "single person child carer"),
        _ => (44_000m, 4_000m, "single PAYE")
    };

    private static (decimal Rate, string Label) PensionRate(PayRequest request) => request.PensionScheme switch
    {
        PensionScheme.None => (0m, "No pension"),
        PensionScheme.AutoEnrol => (0.015m, "MyFutureFund 1.5%"),
        _ => (Math.Clamp(request.OccupationalPercent, 0, 40) / 100m,
            $"Occupational {Math.Clamp(request.OccupationalPercent, 0, 40):0.##}%")
    };

    private static decimal EmployeePrsiRate(int year, int month)
    {
        if (year > 2026 || (year == 2026 && month >= 10))
        {
            return 0.0435m;
        }

        return 0.042m;
    }

    private static decimal AnnualPrsiRate(int year)
    {
        if (year == 2026)
        {
            return (0.042m * 9m + 0.0435m * 3m) / 12m;
        }

        return year >= 2027 ? 0.0435m : 0.042m;
    }

    private static decimal Eur(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
