# Presentations

For a user deck, start with CREATE_A_DECK.md. Use `npm run deck -- catalog --json`
and starters/catalog.json to choose a purpose-specific starter. Edit the generated
BRIEF.md, deck.json and assets/; never overwrite existing decks or fabricate facts.

For system changes, keep all deck behavior here. SSG and SiteKit are read-only
upstream dependencies. Use public SSG CLI/template contracts and SiteKit dist.
Never edit output/. Deck content and branding belong in starter/example/consumer
directories. `node scripts/write-schema.mjs` regenerates the agent-facing schema
when layout contracts change. Run `npm test` after changes; it builds examples and
all starters, checks onboarding and static contracts, and runs browser tests.
