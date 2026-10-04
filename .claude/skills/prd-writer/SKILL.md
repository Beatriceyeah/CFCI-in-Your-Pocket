---
name: prd-writer
description: Write a product requirements document (PRD) in Beatrice's standard five-part structure (Background, Value, Requirements, Risks and open items, Visual style), with P0 to P3 priorities and an MVP vs post-MVP split. Use this whenever the user asks for a PRD, product requirements doc, MVP spec, feature spec, 需求文档 or 产品需求, or wants to turn a product brief, meeting notes or a feature idea into requirements, even if they don't say "PRD".
---

# PRD writer

Write PRDs in the structure below. It was settled through real client work, so follow it rather than a generic spec template.

## Working rules

- **Source first.** Build the PRD from what the user gave you (product brief, meeting notes, chat). Don't invent features, metrics or decisions. A missing fact becomes an open question in section 4.
- **Confirm before editing.** Once a draft exists, propose changes in chat and wait for a clear yes before editing the document. Exception: the user explicitly tells you to make a specific change.
- **Language.** Write the document in English by default (it is usually shared with clients). Talk to the user in whatever language they use.
- **Concise.** Short sentences, tables for requirements, no filler sections. The user prefers cheatsheet-ready writing.
- **Flag your own judgment calls** in the chat reply after each draft or edit, so the user can catch them.

## Document structure

Title: `<Product name>: MVP PRD` (or the version being specced).

### 1. Background
- **Current state: why build this.** The business situation and the problem, starting from the client's need.
- **Core problem: what to build.** One or two sentences on the product, then what this version (e.g. MVP) is for and what is deferred to later versions.
- **Target users and scenarios.** A table: `User | Role | Scenario`. Put the client or business owner first (Role: Primary client), then content providers, then end users. One scenario sentence each.

### 2. Value
- **Business value** for the client or company: a `Metric | What it tells us` table. Say when it is measured (e.g. after launch). If the current version has a different success bar (e.g. a demo that confirms style), state it in one line.
- **Value for users:** one bullet per user type.

### 3. Requirements (the core)
1. **Overview:** modules in this version, how users move between them, and the priority definitions. Include a user flow diagram when there is more than a straight line of screens (branches by user type, loops, optional steps).
2. **Details, one subsection per module:** `### Module N: <Name>`, optional one-line description, then requirements (format below).
3. Note sample data, simulated features (e.g. mock login) and other demo assumptions in one closing line.

Only P0 items for the current version live here. Everything later goes to section 4.

### 4. Risks and open items
- **Risks of this version** (bullets).
- **Post-MVP items to confirm:** `Item | Priority` table, sorted P1 → P3. This is where all future work goes (engagement mechanisms, filtering, admin tools, enhancements, AI features).
- **Open questions:** a checklist (`- [ ]`).

### 5. Visual style
One line on the overall style direction, then a `Item | Decision` table (color palette, typography, card or layout patterns, pop-ups, motion, desktop vs mobile, reference apps). Fill only what the user decided; mark the rest "TBD with designer".

## Priority definitions

- **P0**: in this version (e.g. the MVP)
- **P1**: top priority right after this version
- **P2**: next version
- **P3**: later exploration

Half steps (e.g. P2.5) are fine when the user asks for them; add them to the definition line.

## Requirement format

**Simple module** (each requirement fits in one line): a table.

| Requirement | Priority |
| --- | --- |
| Gallery view: each card shows name, cover image and one-sentence intro | P0 |

**Complex module** (requirements have rules, states, branches or edge cases): a nested list instead of a table, because tables can't hold sub-bullets. Use up to three levels:

```markdown
### Module 3: Product Browse

1. **[P0] Info card pop-up** opens when a user taps a gallery card
    - Demo video autoplays at the top
        - Muted by default; tap to unmute
        - No video uploaded → show the cover image instead
    - Scroll down for more information
        - Product brief, team, stage, link
2. **[P0] Swipe actions**
    - Right swipe = interested
        - Adds the product to Interested Products
        - Opens the feedback screen: Would use / Would invest / Would intro someone, plus a comment
    - Left swipe = not interested
        - Returns to the gallery; no feedback asked
```

Level 1 = the requirement with its priority tag. Level 2 = behaviors or components. Level 3 = rules, states, edge cases, empty and error states. Keep each line one short sentence. Mixing formats across modules is fine: use a table where a module is simple and a nested list where it is complex.

## Edge cases worth covering

Before handing over, check each module for: skip or back paths, first-time vs returning users, different user types seeing different content, empty states (no products yet, nothing saved), and what is simulated in a demo. Put anything you can't resolve from the source into Open questions.
