namespace FormJobs.Core;

public sealed record ChecklistItem(
    string Id,
    string Title,
    string Detail,
    string When,
    string? GuideSlug);

public sealed record GuideSection(string Heading, string Body);

public sealed record Guide(
    string Slug,
    string Title,
    string Kicker,
    string Summary,
    IReadOnlyList<string> Takeaways,
    IReadOnlyList<GuideSection> Sections);
