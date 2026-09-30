# Architecture Lab

A browser-based strategy game for software architects, built with **SvelteKit 2, Svelte 5, and TypeScript**. Build a system, survive six production challenges, and learn how architectural trade-offs affect capacity and resilience.

## Play

1. Spend your credits on application replicas, caches, queues, database replicas, an edge network, and observability.
2. Watch the live forecast. Aim for **98% traffic served**, **90 resilience**, and **response time below 300 ms**.
3. Deploy to lock in your score, then move to the next workload. Your architecture and unspent credits carry forward.
4. Earn up to 600 points. Replay to try another strategy; your personal best is saved locally.

Components can be removed for a full refund before each deployment. There are no timers, accounts, network API calls, tracking, or paid services. The simulation is deterministic. Capacity, costs, failure handling, consistency, and latency are intentionally simplified for learning, not production-sizing advice.

## Local development

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm test
npm run build
npm run preview
```

The production output is in `build/`. Set `BASE_PATH=/your-repository-name` to test project-path hosting locally:

```sh
BASE_PATH=/architecture-lab npm run build
BASE_PATH=/architecture-lab npm run preview
```

## GitHub Pages

The included `.github/workflows/pages.yml` validates pull requests and deploys pushes to `main` using the official GitHub Pages artifact flow. No personal access token or repository secrets are required; only the deployment job receives `pages: write` and `id-token: write` permissions.

In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source before the first deployment. The workflow obtains the Pages base path from `actions/configure-pages` and passes it into SvelteKit's static adapter configuration. It supports both project sites and account-root sites. You can also run it manually from the Actions tab.

## Project map

- `src/lib/game.ts`: deterministic simulation, component catalog, six scenarios
- `src/routes/+page.svelte`: responsive, keyboard-accessible game interface
- `tests/game.test.ts`: capacity, incident, bounds, and six-round affordability tests
- `svelte.config.js`: static output and deployment base path
- `.github/workflows/pages.yml`: validation and deployment

Only the best score is persisted, in the browser's local storage. A blocked or unavailable storage API does not prevent play.
