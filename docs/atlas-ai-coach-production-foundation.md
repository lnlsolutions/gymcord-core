# Atlas AI Coach Production Foundation V1

Atlas is now structured as a production-ready coaching foundation that runs without live OpenAI or provider API keys. The current implementation uses repository-owned mock generation and provider metadata placeholders so the UI can exercise coaching flows safely while live provider wiring remains future work.

## Consumer coaching flow

Consumers enter through `/atlas` or `/atlas/chat`, select `consumer` mode, send messages, and receive mock coaching responses. Responses include goal context, conversation history, memory metadata, provider request metadata, and safety metadata. Guidance is general fitness and nutrition coaching only.

## Trainer-assisted coaching flow

`trainer-assisted` mode keeps trainer relationships metadata-only. Atlas marks human coach handoff and trainer review as recommended, but it does not grant access to another account, bypass ownership rules, or perform live trainer actions. Draft responses and generated plans are suitable for later trainer review.

## Gym-member coaching flow

`gym-member` mode attaches tenant context metadata such as tenant ID, tenant name, one-account ownership model, and metadata-only gym relationship status. This supports future gym member experiences without changing account ownership or introducing hard tenant coupling in UI components.

## Onboarding-aware context

Atlas reads the local profile/onboarding fields when available: name, goal, activity level, and start date. When onboarding data is unavailable, Atlas uses mock fallback metadata rather than blocking the user or calling a provider.

## Memory model

Memory is repository-managed and includes goal, workout history, nutrition history, sleep history, recovery history, favorite exercises, injuries, PR history, and mission snapshot metadata. `AtlasMemoryRepository` persists and summarizes memory metadata through the existing local Atlas store.

## Provider model

The active backend provider is surfaced as metadata. Mock provider mode works today. Non-mock providers are treated as `provider-metadata-ready`, meaning Atlas records pending or failed provider request metadata but does not require API keys and does not make live AI calls.

## Plan generation model

`AtlasPlanRepository` supports mock generation for workout plans, nutrition plans, weekly check-in summaries, progress insights, habit recommendations, and recovery recommendations. Every generated plan includes title, summary, recommendations, coach mode, creation timestamp, and safety metadata.

## Safety metadata

Atlas surfaces visible safety metadata for:

- not medical advice
- emergency disclaimer
- trainer review recommended
- confidence level
- escalation needed
- human coach handoff recommended

Atlas does not provide medical diagnosis, emergency triage, unsafe health claims, or promises of outcomes. Users should contact qualified professionals for medical concerns, injuries, dietary restrictions, or emergencies.

## Future OpenAI/provider integration plan

1. Add an `AtlasProvider` interface behind repositories only.
2. Map chat and plan-generation requests to provider DTOs inside repository/provider code.
3. Keep UI free of `openai`, `@openai/*`, `@supabase/supabase-js`, `getSupabaseClient`, and `SupabaseProvider` imports.
4. Require explicit provider configuration and safe failure states before live calls.
5. Store pending, completed, and failed provider request metadata for auditability.
6. Preserve mock mode for demos, local development, CI, and offline use.

## Data ownership rules

Atlas preserves the one-account ownership model. Trainer and gym relationships are metadata-only in this foundation. No hard deletes are introduced. No security bypasses are introduced. Repository methods own persistence and provider boundaries; UI components render state and invoke repository methods only.

## Validation note

Run `npm ci`, `npm run build`, and `npm run test` for validation. If npm registry authorization blocks installation in the environment, record the exact registry/auth error in the pull request summary.
