# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-08
- Primary product surfaces: Studio landing page, service menu, booking flow, private local reservations, build guide, serverless availability API.
- Evidence reviewed: `what-starter-gather`, `what-starter-tempo`, `what-starter-cartograph`, What router/core package docs.

## Brand
- Personality: Warm coral creative studio with crisp navy scheduling discipline.
- Trust signals: Explicit local-only reservation boundary, conflict validation before booking, timezone text on every slot.
- Avoid: Medical/enterprise calendar blandness, fake multi-tenant claims, implying durable booking inventory.

## Product goals
- Goals: Demonstrate date/timezone-aware appointment booking, service durations, local reservation management, reschedule/cancel, ICS export, and Vura serverless conflict checks.
- Non-goals: Auth, staff calendars, durable shared holds, SMS/email, paid appointments.
- Success signals: A user selects a service and slot, validates availability through `/api/availability`, stores a local reservation, reschedules/cancels it, and downloads an ICS file.

## Personas and jobs
- Primary personas: Framework evaluators, service business prototype builders, agents copying a booking pattern.
- User jobs: Learn signal effects for local state, understand serverless validation boundaries, copy ICS export patterns.
- Key contexts of use: Public starter gallery, local template clone, Vura deployment smoke.

## Information architecture
- Primary navigation: Studio, Services, Book, Reservations, Build.
- Core routes/screens: `/`, `/services`, `/book`, `/reservations`, `/build`, `/404`.
- Content hierarchy: Studio promise, service durations, slot grid, private reservations ledger, agent implementation guide.

## Design principles
- Principle 1: Scheduling should feel calm but precise: soft color, hard validation.
- Principle 2: Every time shown must include timezone context.
- Tradeoffs: Uses deterministic demo dates so screenshots and tests are stable.

## Visual language
- Color: retain deep navy (`#07172f`), flat navy panels (`#0d2447`), coral actions, peach/cream text and aqua focus accents.
- Typography: shared local Avenir Next / Segoe UI Variable / Segoe UI sans-serif stack; body 16px/1.6, labels and controls 14px, headings 28–36px/1.2, section headings 24px/1.3, brand 24px.
- Spacing/layout rhythm: 8px rhythm, compact scheduling summary, readable service cards and ledger rows; service/date/time labels begin within the mobile booking viewport.
- Shape/radius/elevation: 8px corners and subtle 1px borders. No uppercase pill controls, gradients, glows or decorative orbital background rings.
- Motion: short route entrance; reduced-motion disables it.
- Imagery/iconography: retain the existing small code-native service circle marks; no external assets.

## Components
- Existing components to reuse: None directly; copy framework/Vura patterns only.
- New/changed components: AppShell, ServiceCard, slot grid, reservation ledger, ICS link.
- Variants and states: Loading availability, conflict rejected, empty reservations, storage denied, cancelled reservation.
- Token/component ownership: `src/styles.css` owns visual tokens.

## Accessibility
- Target standard: WCAG AA intent.
- Keyboard/focus behavior: Service, slot, book, reschedule, cancel, and ICS controls are keyboard reachable.
- Contrast/readability: Cream/coral on navy with large controls and visible focus.
- Screen-reader semantics: Status regions for availability/storage, labels for date/service/timezone.
- Reduced motion and sensory considerations: `prefers-reduced-motion` stops pulses/entry.

## Responsive behavior
- Supported breakpoints/devices: 360px mobile through desktop.
- Layout adaptations: Booking rail stacks under slot grid on mobile.
- Touch/hover differences: Buttons and slot radios have large hit targets.

## Interaction states
- Loading: `Checking studio calendar...`
- Empty: Reservations page points back to Book.
- Error: Conflict/API/storage failures keep draft selections intact.
- Success: Booked reservation shows confirmation and ICS export.
- Disabled: Booking disabled while API is checking.
- Offline/slow network: User gets retry copy and no fake hold.

## Content voice
- Tone: Studio concierge, concise and reassuring.
- Terminology: Session, slot, studio time, local reservation.
- Microcopy rules: State local/demo boundaries where a real booking product would otherwise imply shared inventory. Keep raw endpoint names in `/build`, not in the studio or booking product copy.

## Implementation constraints
- Framework/styling system: What Framework 0.13.10, Vite 6.4.3, Vura CLI 0.3.0.
- Design-token constraints: No external fonts or assets.
- Performance constraints: Small bundle, bounded API body reader, generated aliases.
- Compatibility constraints: Node 22 and npm ci.
- Test/screenshot expectations: Vitest API/domain tests plus Playwright browser smoke desktop/mobile. Booking controls must show visible Service, Date, and Time labels; mobile keeps the local-count chip beside the wordmark; empty home state shows the next open slot instead of a giant zero.

## Verified draft and ledger continuity
- A verified hold belongs to the selected service/date/start and local reservations snapshot. Draft changes invalidate it; stale responses do not enable booking. Pending checks disable repeats and booking.
- Choosing a service routes to Book with that service selected. Date/time use native pressed buttons; no incomplete tab keyboard contract is implied.
- The service radiogroup uses one tab stop with arrow/Home/End selection and focus movement.
- Cancelled records remain visible after reload, without move/cancel/export actions. Reset all reactively restores the empty ledger.
- Compact hero type and mobile wordmark/count row retain the coral/navy orbital identity while shortening the path to service/slot choices.

## Open questions
- [ ] Which durable calendar backend should production docs recommend first / owner: platform team / impact: future integration guide.
