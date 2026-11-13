import { revealFor } from './ingredient-reveal.js?v=20261110-complete-food';

// Visually reviewed: the second illustration actually exposes a filling/cut.
// An ingredient description or a different top-down photograph is insufficient.
const reviewedPairs=Object.freeze({
  'smoked-turkey':['assets/cutaway/focaccia-outside.webp','assets/cutaway/focaccia-inside.webp'],
  beetroot:['assets/cutaway/beetroot-outside.webp','assets/illustrations/branded/beetroot.webp'],
  zucchini:['assets/cutaway/zucchini-outside.webp','assets/illustrations/branded/zucchini.webp'],
  'omelet-plate':['assets/illustrations/branded/omelet-plate.webp','assets/cutaway/omelet-plate-inside-v1.webp'],
  pancake:['assets/cutaway/pancake-outside-v1.webp','assets/cutaway/pancake-inside-v1.webp'],
});
export function cutawayImagesFor(entry){
  const reveal=revealFor(entry,0);
  const pair=reveal&&reviewedPairs[reveal.dishId];
  return pair&&pair[0]!==pair[1]?[...pair]:null;
}
