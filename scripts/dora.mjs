import { writeFileSync, mkdirSync } from "node:fs";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const ENV = process.env.DEPLOY_ENV || "production";
const since = new Date(Date.now() - 90 * 864e5);
const H = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" };

async function api(path) {
  let url = `https://api.github.com/repos/${owner}/${repo}${path}`, out = [];
  while (url) {
    const r = await fetch(url, { headers: H });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    out.push(...(await r.json()));
    url = (r.headers.get("link") || "").match(/<([^>]+)>;\s*rel="next"/)?.[1];
  }
  return out;
}
const week = (d) => { d = new Date(d); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const hrs = (ms) => +(ms / 36e5).toFixed(2);

// 1) Deployments + 상태
const deps = (await api(`/deployments?environment=${ENV}&per_page=100`))
  .filter((d) => new Date(d.created_at) >= since);
for (const d of deps) {
  const [s] = await api(`/deployments/${d.id}/statuses?per_page=1`);
  d.state = s?.state ?? "unknown";
}
const okDeps = deps.filter((d) => d.state === "success")
  .map((d) => new Date(d.created_at)).sort((a, b) => a - b);

// 2) Lead time: PR 첫 커밋 → 머지 이후 첫 성공 배포
const prs = (await api(`/pulls?state=closed&sort=updated&direction=desc&per_page=100`))
  .filter((p) => p.merged_at && new Date(p.merged_at) >= since);
const leads = [];
for (const p of prs) {
  const [first] = await api(`/pulls/${p.number}/commits?per_page=1`);
  const deployedAt = okDeps.find((t) => t >= new Date(p.merged_at));
  if (first && deployedAt)
    leads.push({ week: week(deployedAt), h: hrs(deployedAt - new Date(first.commit.committer.date)) });
}

// 3) MTTR: incident 이슈
const incidents = (await api(`/issues?labels=incident&state=closed&since=${since.toISOString()}&per_page=100`))
  .filter((i) => !i.pull_request && i.closed_at)
  .map((i) => ({ week: week(i.closed_at), h: hrs(new Date(i.closed_at) - new Date(i.created_at)) }));

// 주간 집계
const weeks = [...new Set([...deps.map((d) => week(d.created_at)), ...leads.map((l) => l.week), ...incidents.map((i) => i.week)])].sort();
const weekly = weeks.map((w) => {
  const d = deps.filter((x) => week(x.created_at) === w);
  const fail = d.filter((x) => ["failure", "error"].includes(x.state)).length;
  return {
    week: w,
    deploys: d.length,
    cfr: d.length ? +((fail / d.length) * 100).toFixed(1) : 0,
    leadTimeH: avg(leads.filter((l) => l.week === w).map((l) => l.h)),
    mttrH: avg(incidents.filter((i) => i.week === w).map((i) => i.h)),
  };
});
const fails = deps.filter((d) => ["failure", "error"].includes(d.state)).length;
const summary = {
  deploysPerWeek: +(deps.length / (90 / 7)).toFixed(1),
  leadTimeH: avg(leads.map((l) => l.h)),
  cfr: deps.length ? +((fails / deps.length) * 100).toFixed(1) : 0,
  mttrH: avg(incidents.map((i) => i.h)),
};

mkdirSync("docs/data", { recursive: true });
writeFileSync("docs/data/metrics.json", JSON.stringify({ generated: new Date().toISOString(), summary, weekly }, null, 2));