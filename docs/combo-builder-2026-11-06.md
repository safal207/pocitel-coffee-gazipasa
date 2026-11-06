# Focaccia and drink combo builder

Guests can choose any of 3 focaccias and 23 drinks, select cafe or takeaway service, and customize supported milk or syrup options. Photos, ingredients, nutrition estimates and price follow the chosen components. The existing turkey + iced Americano pairing keeps its 20 ₺ saving; other pairs use menu prices without a new discount.

Multiple different pairings persist in the order. Editing replaces the selected row and preserves its quantity; matching rows merge up to the existing limit of 99. Matching individual components can be grouped without charging twice. Each transition has stale-cart protection and exact undo.

Validation: 18 Node tests pass, covering all 69 pairings, price and nutrition mapping, persistence, milk and syrup rules, quantity-preserving edits, merging, stale offers and malformed IDs. Browser checks at 390×844 (Russian) and 320×568 (English) confirmed choice changes, prices of 405 ₺ and 475 ₺, editing two portions and narrow-screen fit without horizontal overflow. Nutrition remains an estimate of the base recipe when milk or syrup changes.

The order remains a local draft for showing to the cafe team; payment and order confirmation happen at the cafe.
