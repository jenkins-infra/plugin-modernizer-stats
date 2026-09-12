# Statistics

What each page shows and how the numbers are worked out.

## Where the data comes from

`npm run fetch-metadata` downloads one file,
[`report.json`](https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json), into
`public/data/`. It is generated from the per-run records that the
[Plugin Modernizer tool](https://github.com/jenkinsci/plugin-modernizer-tool) pushes to
[metadata-plugin-modernizer](https://github.com/jenkins-infra/metadata-plugin-modernizer). The site is
static, so figures are as fresh as the last fetch — the dashboard shows the report's own timestamp.

A **migration** is one recipe applied to one plugin on one run. A plugin normally has many, and the
same recipe can be applied to it more than once, so migration counts are counts of records rather than
of plugins.

## Dashboard

Totals for plugins, migrations, successes and failures, all taken straight from the report.

- **Migration Status** — success against failure. Percentages are each slice's share of those two.
- **Recipe Performance** — the ten recipes with the **most applications**, ordered by volume rather
  than by success rate.
- **Migration Timeline** — successes and failures per month.
- **Migration Tags** — how often each tag appears. A migration can carry several, so the counts add up
  to more than the number of migrations.
- **Recipes with Most Failures** — up to eight recipes with their success and failure counts.

## Plugins

The list covers plugins with at least one migration recorded, searchable by name and filterable by four
cards. _All Passed_ and _All Failed_ mean exactly that. Plugins with mixed results are _Mostly Passed_
when under half their migrations failed, and _Mostly Failed_ at half or more.

A plugin is shown as **Not Reported** if any one of its migrations has no recorded outcome, whatever the
others did.

Each plugin's own page adds a per-recipe breakdown, its pull requests, its failed migrations, the full
migration history with diff sizes and CI results, and a copy-ready `plugin-modernizer` command. Note
that the plugin version and branch in the header come from the first migration that records them,
while the last-updated date is the most recent.

**"Modernized" on a plugin page means every migration in the report succeeded.** It does not mean the
plugin is on the latest parent, baseline or dependencies.

## Recipes

Each recipe's success rate is its successful applications divided by its **total** applications, and
recipes are grouped into high (80% or above), medium (50–79%) and low (under 50%). Some applications
have no recorded outcome, and those count against the rate here. The dashboard's _Recipes with Most
Failures_ card divides by successes plus failures instead, so a recipe with outcome-less applications
reads higher there.

Search matches the short recipe name — the part after the last dot — which is also what the list
displays. The full id appears on hover.

A recipe's own page adds its outcome split, including an **Other** slice for applications with no
recorded outcome, a monthly timeline, and every plugin it was applied to. Those rows are applications,
so a plugin the recipe ran against twice appears twice.

## Migrations are not pull requests

Re-running a recipe force-pushes to the existing pull request rather than opening a new one, so
migration counts are higher than pull request counts.
