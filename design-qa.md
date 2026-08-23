# Design QA

## Target

- Source: `qa/source.png`
- Implementation: `qa/implementation.png`
- Viewports checked: desktop 1440 x 1024, mobile 390 x 844

## Comparison history

### Iteration 1

- The desktop headline wrapped to three lines and weakened the chosen composition.
- The supporting sentence broke in the middle of a word.
- The first mobile capture did not emulate the CSS viewport reliably.

Fixes: constrained the desktop hero copy and headline size, added deliberate Japanese line breaks, and switched mobile QA to Chrome device-metric emulation.

### Iteration 2

- Source and implementation were placed in one comparison image.
- The corporate white navigation, dark photographic hero, oversized Gothic headline, bright filter area, and image-led event card hierarchy match the selected direction.
- Real event ordering and content differ intentionally from the concept mock.
- Mobile width is exactly 390px with no horizontal overflow.

### Iteration 3 — user fidelity correction

- P1: The display headline was visibly lighter than the selected concept.
- P1: The hero image lacked the concept's strong dark-left gradient, reducing contrast.
- P1: Event windows had drifted to white split panels instead of image-led navy gradient cards.
- P2: The three hero branch buttons were visually unclear and duplicated the real branch filter.

Fixes: changed the display face to the heaviest available Japanese Gothic stack with a subtle same-color stroke, restored a strong navy-to-transparent hero treatment, removed the redundant hero buttons, and rebuilt the desktop event grid as one large featured image card plus smaller image cards with navy gradient overlays and white type.

Post-fix evidence: `qa/implementation.png` and `/tmp/jsdf-qa-comparison-redesign.png`. The final combined comparison shows matched headline emphasis, left-side contrast, photographic card hierarchy, deep navy overlays, and white action buttons. The absence of the three decorative hero buttons is an intentional user-requested simplification; branch filtering remains available immediately below the hero.

### Iteration 4 — iPhone headline wrapping

- P2: At 390px the first headline phrase wrapped, producing three visual lines.

Fix: wrapped each intended line in a non-wrapping inline block and set the mobile display size to 31px with tighter tracking. Post-fix capture `/tmp/jsdf-implementation-mobile-final.png` measures 390px wide with no horizontal overflow and shows exactly two headline lines.

## Functional checks

- Initial event render: 14 events.
- Latest source-backed render: 15 events, including one current Maritime Self-Defense Force event from the JMSDF official event list.
- Region, branch, access, and keyword controls render and remain usable.
- Hero branch buttons update the branch filter.
- Sea button correctly shows the current zero-result state rather than appearing inactive.
- After removal of the hero shortcuts, the branch select correctly shows the current sea zero-result state.
- No browser console or runtime errors during the final mobile check.
- Image failures fall back to a branch-specific local image.

## Final result

passed
