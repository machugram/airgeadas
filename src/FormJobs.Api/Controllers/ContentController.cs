using FormJobs.Core;
using Microsoft.AspNetCore.Mvc;

namespace FormJobs.Api.Controllers;

[ApiController]
[Route("api/content")]
public sealed class ContentController(ArrivalCatalog catalog) : ControllerBase
{
    [HttpGet("checklist")]
    public IReadOnlyList<ChecklistItem> Checklist() => catalog.Checklist;

    [HttpGet("guides")]
    public IReadOnlyList<GuideListItem> Guides() =>
        catalog.Guides.Select(guide => new GuideListItem(
            guide.Slug,
            guide.Title,
            guide.Kicker,
            guide.Summary)).ToList();

    [HttpGet("guides/{slug}")]
    public ActionResult<Guide> Guide(string slug)
    {
        var guide = catalog.GuideBySlug(slug);
        return guide is null ? NotFound() : guide;
    }
}

public sealed record GuideListItem(string Slug, string Title, string Kicker, string Summary);
