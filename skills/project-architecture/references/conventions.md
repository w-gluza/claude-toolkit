# Framework and architecture reference points

These are references, not rigid templates. Check the project's actual framework version and current official guidance before recommending a structure. For the longer reading list and the reasoning behind the defaults, see `sources.md`.

- Next.js App Router - project structure and colocation: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js Route Handlers - API endpoints: https://nextjs.org/docs/app/getting-started/route-handlers
- React documentation - component structure and composition: https://react.dev/learn
- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/intro.html

For any other framework, find its official structure guide first and start from that, not from the Next.js notes below.

## Decision prompts

- Are route entry points being confused with domain logic or persistence operations?
- Does the proposed grouping reflect actual product/domain boundaries, or just add nesting?
- Is shared code truly shared, or was it extracted prematurely?
- Are imports predictable and dependency directions sensible?
- Are sensitive operations/server-only modules isolated from client code?
- If persistence exists, who owns transactions, database queries, and schema/migrations?
- What would need to change if a second feature or endpoint were added?

## Next.js with a database

When relevant, route files handle HTTP boundaries; domain modules handle business rules; server-only modules handle persistence/integrations. This is a separation of responsibilities, **not** a requirement to create a folder for each layer. Put migrations and tooling in their framework/tool-standard locations.
