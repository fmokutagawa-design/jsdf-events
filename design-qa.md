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

## Functional checks

- Initial event render: 14 events.
- Region, branch, access, and keyword controls render and remain usable.
- Hero branch buttons update the branch filter.
- Sea button correctly shows the current zero-result state rather than appearing inactive.
- No browser console or runtime errors during the final mobile check.
- Image failures fall back to a branch-specific local image.

## Final result

passed
