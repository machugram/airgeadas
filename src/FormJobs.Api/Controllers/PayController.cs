using FormJobs.Core;
using Microsoft.AspNetCore.Mvc;

namespace FormJobs.Api.Controllers;

[ApiController]
[Route("api/pay")]
public sealed class PayController(IrelandPayCalculator calculator) : ControllerBase
{
    [HttpPost("estimate")]
    public ActionResult<PayEstimate> Estimate([FromBody] PayRequest request)
    {
        if (request.AnnualSalary is < 0 or > 10_000_000)
        {
            return ValidationProblem("Annual salary is out of range.");
        }

        if (request.Month is < 1 or > 12)
        {
            return ValidationProblem("Month must be 1–12.");
        }

        if (request.Year is < 2024 or > 2030)
        {
            return ValidationProblem("Year is out of range.");
        }

        return calculator.Estimate(request);
    }

    [HttpGet("rates/{year:int}")]
    public ActionResult<RateCard> Rates(int year) => IrelandPayCalculator.RatesFor(year);
}
