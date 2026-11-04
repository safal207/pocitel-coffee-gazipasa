# Menu ingredients and estimated nutrition

Every catalog entry now has an expandable information panel: 42 individual entries, 4 pairings and 8 takeaway versions, in Turkish, English and Russian. A text button in each feed card opens the information directly. Product viewers and customization dialogs include the same panel. Data is loaded on demand, after a product opens.

## What these numbers mean

**No café recipe sheets, ingredient weights, brand labels or measured nutrient values were supplied. All energy ranges are editorial estimates for explicitly assumed portions. They are not verified Poçitel nutrition declarations, guaranteed limits, dietary prescriptions or laboratory results. Actual servings can fall outside the ranges.**

Main food ingredients come from the supplied printed menu. Missing drink, sauce and cooking details are labelled as typical-recipe assumptions. Ingredient statements are not complete allergen declarations. In particular, flavoured nut syrup is not assumed to contain actual nuts, plant drinks are not assumed to be vitamin-fortified, and photographs are not used to infer recipes.

`dist/nutrition-data.js` is the editable source of truth: each recipe lists an ingredient key and minimum/maximum assumed grams or millilitres. Energy references use kcal per 100 g or per 100 ml as identified by `unit`. Per recipe, sum amount × energy density / 100, then round the lower bound down and upper bound up to 10 kcal (5 kcal for totals ≤30 kcal). Combo totals sum the already-rounded component estimates. Takeaway inherits the same serving estimate and explicitly notes that actual cup size may differ.

Milk or syrup selections do not pretend to have exact configured nutrition: the panel changes to “Base recipe” and explains that it shows values before the selected changes. Quantity controls do not change a one-serving estimate into a whole-order nutrition claim.

## Evidence and assumptions

Reference material consulted on 2026-11-04:

- [Health Canada, Nutrient Value of Some Common Foods (2008)](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/nutrient-value-some-common-foods-2008.html). Generic ingredient comparisons, not a modern Turkish café-specific dataset. Examples: poached egg 74 kcal/50 g; boiled egg 78/50 g; white bread 93/35 g (commercial) and 100/35 g (homemade); feta 132/50 g; cheddar 202/50 g; yogurt 114–129/181 g; milk 108–155 kcal/250 ml; plain homemade pancake 86/38 g; fries 236/76 g; walnuts 166/25 g; olive oil 121/14 g. The reference describes natural recipe and sample variation.
- [Nutella Türkiye label](https://www.nutella.com/tr/tr/products/spread/nutella): 539 kcal/100 g and the manufacturer's ingredient list. The assumed 15–25 g serving is ours, not a café-confirmed portion.
- [Pınar Klasik Sucuk](https://www.pinar.com.tr/urunler/detay/Sucuk/627/176/0), [Doyum Sucuk](https://www.pinar.com.tr/urunler/detay-et/Pinar-Doyum-Sucuk/633/182/0) and [Pınar product publication](https://www.pinar.com.tr/images/pdf/Guzel-Yasa-2023-2.pdf): example sucuk values spanning 377–430 kcal/100 g. These brands are reference examples, not asserted café suppliers.
- [Oatly Barista](https://www.oatly.com/en-gb/products/oat-drink/oat-drink-barista-edition-1l?workflowLocale=en-uk), [Alpro Almond No Sugars](https://www.alpro.com/sg/products/drinks/alpro-almond-no-sugars-roasted-uht-1l): example plant drink endpoints, 61 and 13 kcal/100 ml. Other products can differ.
- [Monin manufacturer specification, hosted by its retailer](https://www.webstaurantstore.com/documents/nutrition/monin_dark_chocolate_flavoring_sauce_nutrition.pdf): 288.3 kcal/100 g for one dark chocolate sauce. The model deliberately uses a wider 288–400 range because the café's Belgian chocolate sauce is unidentified.
- [NHS B vitamins](https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-b/), [vitamin C](https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-c/), [vitamin E](https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-e/): ingredient-level vitamin profiles. No quantitative vitamin amounts, daily-value percentages or therapeutic claims are presented.

The recipe amounts, vegetable/fruit mix ranges, sauce fat allowances, focaccia oil, pesto, turkey product range, cream, syrup, matcha powder, salep mix and frappé-base ranges are **editorial modelling assumptions** informed by analogous foods, not retrieved café measurements. Hot chocolate uses generic prepared milk-and-cocoa examples (203–255 kcal/250 ml), with optional topping. The energy profile for pancakes is generic; unconfirmed batter ingredients are not represented as confirmed menu ingredients. Plain coffee and tea do not receive meaningful-vitamin claims. No weight-loss, detoxification or immunity promises are made.

Before calling these café-approved values: obtain serving weights, complete recipes including sauces/oils/sugar, exact milk and packaged-product labels, preparation yields, and confirm available substitutions. Recalculate from these records; use laboratory analysis if precise vitamin quantities are desired.

## Validation

Automated tests cover all 54 products × 3 languages, complete ingredient descriptions, energy ranges enclosing component calculations, pairing arithmetic, takeaway inheritance, and customized-recipe notices. Existing static sharing-page tests also run. All 9 nutrition and sharing tests passed. Menu data and prices are byte-for-byte unchanged from the preceding release. The two nutrition modules total 33,798 bytes (12,219 bytes gzip separately) and load only when a product is opened. Browser checks: Russian food panel at 320 px, English takeaway drink and oat-milk + vanilla customization at 390 px, Turkish combo at 768 px, and desktop viewer. No horizontal overflow in the checked 320/390/768 px views. Native details disclosure works with Enter. Dark theme inherits the established palette (panel rgb(37,35,31), body text rgb(243,236,223)). Browser console entries seen were extension metadata errors, not site errors. Native iOS/Android, laboratory nutrition analysis, and exact café serving validation were not performed.

Rooibos caffeine-free wording: [SA Rooibos Council FAQ](https://sarooibos.co.za/frequently-asked-questions/). No therapeutic claims from that source are used.
