// Suggested pairings already have a food and drink. Only the actual
// add-to-cart action is pending, so never claim the draft was ordered.
export function comboJourneyState(choice, offer) {
  const foodChosen = Boolean(choice?.foodId);
  const drinkChosen = Boolean(choice?.drinkId);
  const count = Number(foodChosen) + Number(drinkChosen);
  return {
    count,
    total: 3,
    foodChosen,
    drinkChosen,
    orderPossible: count === 2 && Boolean(offer),
  };
}
