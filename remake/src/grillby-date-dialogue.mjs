import data from './grillby-date-dialogue.json' with { type: 'json' };

// obj_grillbynpc_sansdate và SCR_TEXT 570–578: lời và lựa chọn trong bữa ăn.
export const grillbyDateDialogue = data;
export function grillbyMealChoice(choice) { return { pages: choice === 0 ? data.fries : data.burger, foodFlag: choice === 0 ? 1 : 2 }; }
export function grillbyBrotherChoice(choice) { return choice === 0 ? data.cool : data.uncool; }
export function grillbyKetchupChoice(choice) { return { pages: choice === 0 ? data.ketchupYes : data.ketchupNo, drink: choice !== 0 }; }
export function grillbyFlowerChoice(choice) { return choice === 0 ? data.flowerYes : data.flowerNo; }
