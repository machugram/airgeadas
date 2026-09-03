using FormJobs.Core;

namespace FormJobs.Tests;

public class IrelandPayCalculatorTests
{
    private readonly IrelandPayCalculator _calculator = new();

    [Fact]
    public void First_month_august_2026_single_occupational_5_percent()
    {
        var estimate = _calculator.Estimate(new PayRequest(
            74_000m, 2026, 8, 5, TaxStatus.Single, PensionScheme.Occupational, 5m));

        Assert.Equal(26, estimate.Calendar.DaysWorked);
        Assert.Equal(31, estimate.Calendar.DaysInMonth);
        Assert.Equal(6, estimate.Calendar.StartDay);
        Assert.Equal(18, estimate.Calendar.WeekdaysWorked);
        Assert.Equal(5172.04m, estimate.FirstMonth.Gross);
        Assert.Equal(258.60m, estimate.FirstMonth.Pension);
        Assert.Equal(898.71m, estimate.FirstMonth.IncomeTax);
        Assert.Equal(116.23m, estimate.FirstMonth.Usc);
        Assert.Equal(217.23m, estimate.FirstMonth.Prsi);
        Assert.Equal(3681.27m, estimate.FirstMonth.Net);
        Assert.Equal(6166.67m, estimate.FullMonth.Gross);
        Assert.Equal(4160.12m, estimate.FullMonth.Net);
    }

    [Fact]
    public void Auto_enrol_does_not_reduce_income_tax_base()
    {
        var occupational = _calculator.Estimate(new PayRequest(
            74_000m, 2026, 8, 5, TaxStatus.Single, PensionScheme.Occupational, 5m));
        var autoEnrol = _calculator.Estimate(new PayRequest(
            74_000m, 2026, 8, 5, TaxStatus.Single, PensionScheme.AutoEnrol, 0m));

        Assert.True(autoEnrol.FirstMonth.IncomeTax > occupational.FirstMonth.IncomeTax);
        Assert.Equal(0.015m, autoEnrol.Pension.EmployeeRate);
        Assert.Equal(autoEnrol.FirstMonth.Pension, autoEnrol.Pension.FirstMonthEmployer);
    }

    [Fact]
    public void October_uses_higher_prsi_rate()
    {
        var august = _calculator.Estimate(new PayRequest(
            74_000m, 2026, 8, 0, TaxStatus.Single, PensionScheme.None, 0m));
        var october = _calculator.Estimate(new PayRequest(
            74_000m, 2026, 10, 0, TaxStatus.Single, PensionScheme.None, 0m));

        Assert.Equal(0.042m, august.Tax.PeriodPrsiRate);
        Assert.Equal(0.0435m, october.Tax.PeriodPrsiRate);
        Assert.True(october.FullMonth.Prsi > august.FullMonth.Prsi);
    }
}
