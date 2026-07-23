# Web Design Standard

> Version: 1.0.0
>
> Date: 2026-07-22
>
> Status: Final

## Conclusion First

This standard gives AI a restrained, modern, trustworthy product-web baseline for generating or improving HTML and web pages. It prioritizes information hierarchy, real component states, desktop and mobile usability, and accessibility over screenshot-only polish. It fits SaaS, tools, solo or small-team product sites, and lightweight operations dashboards. A user's existing brand, design system, or explicit visual direction always takes precedence. This is not a complete brand system: clarify first for expressive brand sites, games, complex commerce, or projects with strict existing visual constraints.

## 1. Scope And Use

### Suitable for

- SaaS, tools, and solo or small-team product sites.
- Lightweight operations dashboards, settings pages, data-management pages, and task-oriented tools.
- A stable default when an AI has no existing design system to follow.

### Not suitable for

- Expressive brand sites, game visuals, or complex commerce storefronts.
- Projects with a strict brand manual, component library, or approved visual specification.
- Pages where illustration, photography, 3D, or complex motion is the primary experience.

### How to use this standard

1. Before designing, generating, or changing a page, establish the page goal, audience, primary task, content priority, available brand assets, and technical constraints.
2. Use these default tokens and component rules only when no existing system applies. Existing brand guidance wins when it conflicts.
3. Establish information architecture and the critical task path before visual refinement. Every important component needs its relevant states.
4. Complete the checklist in section 8 before delivery and report checked items, known limits, and unverified items.

## 2. Design Goals, Direction, And Prohibitions

### Goals

- Content first: help people understand information, complete a task, and make a decision.
- Clear hierarchy: use layout, typography, spacing, and limited emphasis instead of decoration stacks.
- Restrained trust: clean neutrals, limited accents, visible boundaries, and purposeful whitespace.
- Real states: interactive elements include the required default, hover, focus, disabled, loading, success, and error states.
- Accessibility first: keyboard reachability, visible focus, sufficient contrast, semantic structure, and usable touch targets are required.

### Default visual direction

- Use white and cool light-gray surfaces, high-contrast dark body text, and neutrals for supporting information.
- Reserve the primary accent for primary actions, selected states, links, and key status. Do not introduce several competing saturated colors in one view.
- Use 1px borders, light shadows, and 6px to 8px radii for hierarchy. Cards group content; they are not page decoration.
- Whitespace should improve reading and scanning. Avoid empty marketing heroes on desktop and oversized headings in operational views.

### Prohibited patterns

- Broad or stacked gradients, purposeless glassmorphism, floating glow shapes, and decorative-only backgrounds.
- Excessive rounding, widespread pill buttons, nested cards, or floating-card treatment for every page section.
- Buzzword-heavy marketing copy, unsupported claims, fake charts, or invented live metrics.
- Desktop-only layouts, mobile overflow, horizontal traps, or inaccessible primary actions.
- Screenshot-only delivery that omits empty, loading, error, disabled, focus, and feedback states.

## 3. Base Tokens

### Color

| Purpose | Token | Default |
| --- | --- | --- |
| Page background | `--color-page` | `#FFFFFF` |
| Secondary surface | `--color-surface` | `#F8FAFC` |
| Emphasis surface | `--color-surface-strong` | `#EFF6FF` |
| Primary text | `--color-text` | `#0F172A` |
| Secondary text | `--color-text-muted` | `#475569` |
| Subtle text | `--color-text-subtle` | `#64748B` |
| Border | `--color-border` | `#E2E8F0` |
| Primary | `--color-primary` | `#2563EB` |
| Primary hover | `--color-primary-hover` | `#1D4ED8` |
| Success | `--color-success` | `#15803D` |
| Warning | `--color-warning` | `#B45309` |
| Danger | `--color-danger` | `#B91C1C` |

Text and background combinations should meet WCAG AA contrast. Never use color as the only signal for selection, required fields, success, or failure.

### Font And Type Scale

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; use an appropriate local sans-serif fallback for non-Latin scripts.
- Body baseline: `16px / 1.5`. Dense tables and support text can use `14px / 1.5`; do not go below `12px`.
- Suggested scale: `12`, `14`, `16`, `20`, `24`, `32`, `40px`. Keep the number of levels limited and do not scale font size with viewport width.
- Prefer `600` or `700` for headings and `400` or `450` for body text. Do not use thin weights for important information.

### Spacing, Containers, And Size

- Spacing scale: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64px`. Spacing should reflect the relationship between adjacent content.
- Content container: maximum `1200px` on desktop with `24px` horizontal padding; `16px` horizontal padding on mobile.
- Interactive targets should be at least `40px` high or wide, and preferably `44px` on mobile.
- Fixed-format elements use stable dimensions, grids, or min/max constraints so labels and states do not shift the layout.

### Radius, Border, And Shadow

- Buttons and inputs: `6px`; cards and dialogs: `8px`; tags may use `999px`, but ordinary buttons should not become pills.
- Standard border: `1px solid var(--color-border)`. Selected and focused states must remain visible.
- Use shadows only for floating layers, menus, and deliberately elevated elements: `0 8px 24px rgba(15, 23, 42, 0.12)`. Prefer borders over shadows for ordinary cards.

## 4. Desktop And Mobile Responsive Strategy

- Design from content breakpoints rather than device labels. Below `768px`, default to one column. Collapse complex two-column layouts when space is insufficient and keep a maximum container width on wide screens.
- Desktop supports parallel information, side navigation, and table scanning. Mobile prioritizes the main task, essential status, and continuous reading; move, collapse, or defer secondary information.
- Mobile navigation needs a clear, closable entry point. Do not merely shrink a desktop menu.
- Tables should prioritize essential columns. When they cannot compress, provide a scroll container, summary cards, or a detail view and make scrollability apparent.
- Mobile forms use one column, labels before inputs, and field-adjacent errors. No critical action may rely on hover-only help.
- Do not hide critical content behind desktop hover. Check focus order, touch targets, and safe areas.

## 5. Page Structure And Information Hierarchy

- Define one primary task and one primary action per page. The primary action normally uses the only visually primary button.
- Prefer this structure: global or contextual navigation, page title and key status, main content, then secondary information or support actions.
- Page titles name the object or current task, rather than using vague slogans. Supporting copy explains value, limits, or the next step.
- Use semantic HTML: `header`, `nav`, `main`, `section`, `article`, `form`, `button`, and `table` should reflect the real structure.
- Dashboards and tools stay compact, ordered, and scan-friendly. Do not create a marketing hero or decorative media for ordinary management work.
- Use spacing and headings to group content. Introduce a card only when content needs an actual boundary. Avoid cards inside cards.

## 6. Core Component Standards

### Navigation

- Mark the current item with a clear selected signal such as text, color, or an underline; position alone is insufficient.
- Both desktop and mobile navigation support keyboard access and visible focus. Mobile menus can open and close without losing context.

### Buttons

- Differentiate primary, secondary, and destructive actions. A region should normally have one primary button.
- Familiar tool actions can use icon buttons with an `aria-label` or visible hint. An unfamiliar action needs text, not an unexplained icon.
- Cover default, hover, focus, disabled, and loading states. Loading prevents duplicate submissions and disabled states remain understandable.

### Forms

- Every field has a visible label, sensible default or hint, required indication, and field-level error feedback.
- Errors explain recovery, not only a red border. Submission results have page-level feedback.
- Placeholder text is never the only label. Support keyboard use, autofill, and accessible names.

### Cards

- Use for repeated items, independently scannable content, or genuinely framed tool panels.
- Keep padding stable, heading levels limited, and one clear primary action. Do not make every page area a decorative card.

### Lists And Tables

- Lists suit reading order; tables suit comparison. Data tables need headers, alignment rules, empty states, and loading states.
- Numbers, dates, and statuses use consistent formatting. Important status uses text plus color or an icon.
- Add bulk actions, sorting, filtering, and pagination only where the product actually needs them. Do not create static fake functionality.

### Empty And Feedback States

- Empty states say what is absent, why it may be empty, and the next action.
- Loading states preserve layout and communicate progress. Error states offer a viable retry or recovery path.
- Success, warning, and error feedback is perceptible and predictably dismissible or persistent. It must not cover critical content.

## 7. AI Implementation Instructions

1. Read this standard and the project's existing brand, component library, page code, and technical constraints first. Existing brand guidance and explicit user requests take precedence.
2. When information is incomplete, ask the smallest set of material clarifying questions. Do not present guesses as requirements.
3. Offer a concise implementation plan: page task, hierarchy, responsive handling, component states, and validation. Wait for confirmation before a large change when scope or visual direction is unclear.
4. Implement real HTML, CSS, and interaction states. Do not deliver screenshot-like layouts, fake charts, or unusable buttons.
5. Keep changes scoped and reuse existing project components and tokens. Add abstractions or dependencies only when justified.
6. Complete section 8 after implementation and report passed checks, fixes, known limits, and unverified items.

## 8. Post-Implementation Checklist

- [ ] The page goal, audience, main task, content priority, and existing brand requirements are known.
- [ ] Existing brand, design-system, or explicit visual guidance took priority; any departure from the default is explained.
- [ ] Hierarchy is clear, the main action is unambiguous, and text neither overflows nor overlaps.
- [ ] Color, type, spacing, containers, radius, border, and shadow follow this standard or the existing design system.
- [ ] Desktop and mobile layouts, navigation, forms, and tables or lists are checked; no critical information depends on hover alone.
- [ ] Buttons, forms, and critical components include needed default, hover, focus, disabled, loading, empty, success, or error states.
- [ ] Keyboard use, visible focus, semantic structure, image alt text, and text contrast are checked.
- [ ] The result contains no purposeless gradients, glassmorphism, excessive rounding, fake data, or static-only decoration.
- [ ] Available project build, test, or visual checks were run and their result is reported.

## Related References

- [AGENTS.md](./AGENTS.md): local-agent execution constraints and delivery-report requirement.

## Change Log

| Version | Date | Change |
| --- | --- | --- |
| 1.0.0 | 2026-07-22 | Established the default product-web design standard. |
