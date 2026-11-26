# Flat Ledger

A dashboard for a shared flat's Splitwise group: search and filter every expense, see what was
bought for the flat (cookware, appliances, keys…), and work out a fair move-out buyout for those
setup items with straight-line depreciation from each purchase date.

**Live:** https://pranjalg8.github.io/splitwise-dashboard/

## Privacy

The site has no server and no data. You pick your Splitwise export on the page; it is read in your
browser and kept only in that browser's local storage, along with any setup tags you change and
your move-out date. "Forget this file" removes it.

## Using it

1. In Splitwise, open the group and choose **Export as spreadsheet**.
2. Open the site and pick the downloaded `.csv`.
3. Choose who is moving out, the valuation (purchase price or 3/5/8-year straight line), how shares
   are counted and the move-out date. The statement section has a ready-to-paste message.

The category rules and the hand-picked setup list are in `docs/index.html`. They were written for one
flat's export, so other groups will want to adjust the `SETUP` list and the `RULES`.

## Files

- `docs/index.html`: the page (calculations, drawing and controls)
- `docs/dash.js`: a small runtime that re-runs the calculations and redraws when data or filters change
