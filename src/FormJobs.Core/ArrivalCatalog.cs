namespace FormJobs.Core;

public sealed class ArrivalCatalog
{
    public IReadOnlyList<ChecklistItem> Checklist { get; } =
    [
        new("pps", "Get a PPS number",
            "Payroll, tax credits, MyFutureFund and most public services need a Personal Public Service number. Apply online if you can, or book a MyGovID appointment if Revenue cannot match you automatically.",
            "Before or in week 1", "pps-number"),
        new("bank", "Open an Irish current account",
            "Salary is almost always paid into an Irish IBAN. Bring your employment contract, PPS number if you have it, and proof of address. Some banks accept a hotel letter for the first weeks.",
            "Week 1", null),
        new("myaccount", "Register for Revenue myAccount",
            "myAccount is where your tax credit certificate lives. Without it, payroll often falls back to emergency tax. Link your PPS number and keep the registration letter.",
            "Week 1–2", "revenue-myaccount"),
        new("tcc", "Check your tax credit certificate",
            "Your employer needs a current certificate so PAYE uses the right cut-off and credits. New arrivals sometimes wait on Revenue; ask payroll whether they have received it.",
            "Week 2", "paye-usc-prsi"),
        new("payslip", "Read the first payslip against a calculator",
            "The first month is usually prorated if you did not start on the 1st. Check pension, PAYE, USC and PRSI separately so a short month does not look like a wrong salary.",
            "First payday", "first-payslip"),
        new("pension", "Confirm the pension scheme",
            "A workplace occupational scheme usually exempts you from MyFutureFund auto-enrol. If there is no scheme, 1.5% employee / 1.5% employer / 0.5% State applies in 2026 on gross up to €80,000.",
            "First month", "pension"),
        new("emergency", "Watch for emergency tax",
            "If payroll has no PPS number, the first payment can be taxed at 40% with no credits. It usually unwinds once Revenue issues a certificate, but cash-flow in month one can be tight.",
            "First payday", "emergency-tax"),
        new("gp", "Register with a GP",
            "PRSI from this job builds your social insurance record. For day-to-day care, register with a local GP; medical cards have income tests and are separate from PAYE.",
            "First month", "healthcare")
    ];

    public IReadOnlyList<Guide> Guides { get; } =
    [
        new("first-payslip",
            "Your first Irish payslip",
            "Pay",
            "If you start after the 1st, gross pay is cut to the days you worked. Tax credits for that month often are not.",
            [
                "Monthly payroll usually prorates by calendar days, not working days.",
                "A short first month can still use a full month of tax credits if Revenue has you on file.",
                "Compare gross, pension, PAYE, USC and PRSI as five separate lines."
            ],
            [
                new("What ‘started five days in’ means",
                    "The month still has its full length. Starting on the 6th of a 31-day month means 26 paid days if payroll uses calendar days. Five unpaid days come off a full month’s salary, not off the annual rate itself. The €74,000 figure is a rate. August is a slice of that rate."),
                new("Why net is not just ‘salary ÷ 12 × days’",
                    "Income tax is calculated on taxable pay after occupational pension, against one-twelfth of the annual standard-rate cut-off and one-twelfth of your credits. USC and PRSI are charged on gross. So a short month is not a miniature of a full month in exact proportion — credits can make the first payslip look generous relative to gross, or emergency tax can make it look harsh."),
                new("What to bring to payroll",
                    "PPS number, Irish bank IBAN, and confirmation of the pension scheme. If you have a P45 from another 2026 Irish job, give it in; cumulative PAYE will then include that earlier pay.")
            ]),
        new("paye-usc-prsi",
            "PAYE, USC and PRSI",
            "Tax",
            "Ireland takes three statutory slices from an employee payslip. They are not one ‘tax’ line.",
            [
                "PAYE is income tax after credits. USC is a separate charge on gross.",
                "PRSI is social insurance, 4.2% for most of 2026, 4.35% from 1 October.",
                "Pension relief applies to PAYE only for occupational schemes."
            ],
            [
                new("PAYE",
                    "For 2026 a single employee has a €44,000 standard-rate cut-off at 20%, with the balance at 40%. Tax credits (typically €2,000 personal plus €2,000 PAYE) come off the tax bill, not off salary. Married one-income cut-off is €53,000 with a €4,000 personal credit plus the PAYE credit. These bands are frozen into 2026."),
                new("USC",
                    "Universal Social Charge is calculated on gross pay. Employee pension contributions do not reduce it. 2026 bands: 0.5% on the first €12,012, 2% to €28,700, 3% to €70,044, 8% above that. Income of €13,000 or under is exempt."),
                new("PRSI",
                    "Most employees are Class A. The employee rate is 4.2% until 30 September 2026 and 4.35% from 1 October. There is a weekly exemption at very low earnings (€352 or less in that week). PRSI is how you build a social insurance record for benefits later.")
            ]),
        new("pension",
            "Pension in a new Irish job",
            "Pension",
            "Occupational schemes and MyFutureFund are different products with different tax treatment.",
            [
                "A proper workplace scheme usually means you are not auto-enrolled.",
                "Occupational contributions get income-tax relief at your marginal rate.",
                "MyFutureFund 2026 is 1.5% / 1.5% / 0.5% (employee / employer / State)."
            ],
            [
                new("Occupational scheme",
                    "Many salaried roles at this level already run a defined-contribution scheme. A 5% employee contribution is common. Payroll deducts it before income tax, so on a 40% taxpayer a €100 contribution costs about €60 in take-home. USC and PRSI are still charged on the gross. Age-related relief caps apply (15% of earnings under 30, rising to 40% from age 60), on earnings up to €115,000."),
                new("MyFutureFund auto-enrol",
                    "If there is no exempt scheme, auto-enrolment applies for eligible employees. In 2026–2028 the employee pays 1.5% of gross (capped at €80,000), the employer matches 1.5%, and the State adds 0.5%. That employee slice comes off net pay — there is no PAYE relief — because the State top-up is the incentive. Rates step up in later years."),
                new("Ask HR one question",
                    "‘Am I in an occupational scheme that exempts me from MyFutureFund?’ The answer tells you which calculator setting to use and what will appear on the payslip.")
            ]),
        new("pps-number",
            "Getting a PPS number",
            "Arrival",
            "Almost nothing in Irish payroll works cleanly until you have a Personal Public Service number.",
            [
                "Apply as soon as you have an Irish address and your employment details.",
                "MyGovID / MyAccount and payroll all key off the same number.",
                "Without it, emergency tax is likely on the first payment."
            ],
            [
                new("Who issues it",
                    "The Department of Social Protection issues PPS numbers. If you already had one from a previous stay, reuse it — do not apply twice. New arrivals usually apply online or through a registration centre with passport, evidence of why you need the number (contract), and an Irish address."),
                new("What waits on it",
                    "Tax credit certificates, MyFutureFund enrolment, some bank onboarding, and GP registration often need it. Tell payroll the number the day you have it so they can stop emergency tax.")
            ]),
        new("emergency-tax",
            "Emergency tax",
            "Tax",
            "A new job with no tax credit certificate can withhold far more than the calculator’s ‘normal’ PAYE.",
            [
                "No PPS on file often means 40% on the whole payment, plus USC and PRSI.",
                "With a PPS number, month-one PAYE is usually a month’s cut-off and credits.",
                "Over-deducted tax is typically refunded once Revenue issues a certificate."
            ],
            [
                new("Two emergency flavours",
                    "If the employer has your PPS number, payroll can use a week-1 / month-1 basis: 20% up to that period’s cut-off, 40% above, with a period’s credits. If they do not, deduction can be 40% on everything with no credits. Both still take USC and PRSI."),
                new("Cash in week one",
                    "Budget as if the first payslip might be the harsher version. The FormJobs calculator assumes a PPS number is already with payroll. If it is not, take-home will be lower until Revenue catches up.")
            ]),
        new("revenue-myaccount",
            "Revenue myAccount",
            "Arrival",
            "This is the portal for your tax credit certificate, job record and year-end review.",
            [
                "Register once you have a PPS number.",
                "Your employer reads the certificate; you should still look at it.",
                "Rent credit and other claims live here, not on the payslip calculator."
            ],
            [
                new("Tax credit certificate",
                    "The certificate tells payroll your standard-rate cut-off and credits. If it still shows a previous job, or no job, PAYE will be wrong. After you start, check that this employer appears."),
                new("What FormJobs does not file",
                    "We do not submit anything to Revenue. Use myAccount for credits (rent, health expenses) and for reviewing your tax at year end. The calculator is a forecast using published 2026 rates.")
            ]),
        new("healthcare",
            "Healthcare while you pay PRSI",
            "Arrival",
            "PRSI is not private health insurance. You still need a GP, and a medical card is a separate means test.",
            [
                "Class A PRSI contributes to the social insurance record.",
                "Register with a GP; many lists are closed — call more than one.",
                "Private health insurance is optional and not deducted by this calculator."
            ],
            [
                new("GP and A&E",
                    "Find a GP who will take new patients. A&E is for emergencies. Bring PPS number and EHIC/GHIC if you have one from another EU country for the transition period."),
                new("Medical card",
                    "Medical cards and GP visit cards depend on income and circumstances. A €74,000 salary will usually be above medical-card limits for a single person, but check HSE rules if you have dependants.")
            ])
    ];

    public Guide? GuideBySlug(string slug) =>
        Guides.FirstOrDefault(guide =>
            string.Equals(guide.Slug, slug, StringComparison.OrdinalIgnoreCase));
}
