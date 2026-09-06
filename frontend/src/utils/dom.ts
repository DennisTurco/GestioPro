// Guards a row/cell click handler against firing after a text-selection drag:
// mousedown-then-drag-then-mouseup over a clickable row leaves text selected and
// also fires a click event, which would otherwise navigate away right when the
// user just wanted to copy some text.
export function hasActiveTextSelection(): boolean {
  return (window.getSelection()?.toString().length ?? 0) > 0
}
