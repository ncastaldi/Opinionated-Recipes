import { getFlatCookware, getFlatIngredients, getFlatTimers } from '@cooklang/cooklang';
import { describe, expect, it } from 'vitest';

import { parseRecipe } from './parse.ts';

const chickpeaCurry = `---
title: Weeknight Chickpea Curry
servings: 4
tags: [vegetarian, weeknight]
---

Heat @olive oil{2%tbsp} in a #large pot{} over medium heat.

Add @yellow onion{1}(diced) and cook for ~{5%minutes} until soft.
`;

describe('parseRecipe', () => {
  it('extracts metadata, ingredients, cookware and timers from valid Cooklang', () => {
    const { recipe, report, clean } = parseRecipe(chickpeaCurry);

    expect(clean).toBe(true);
    expect(report).toBe('');
    expect(recipe.title).toBe('Weeknight Chickpea Curry');
    expect([...recipe.tags]).toEqual(['vegetarian', 'weeknight']);
    expect(getFlatIngredients(recipe)).toEqual([
      { name: 'olive oil', quantity: 2, unit: 'tbsp', displayText: '2 tbsp', note: null },
      { name: 'yellow onion', quantity: 1, unit: null, displayText: '1', note: 'diced' },
    ]);
    expect(getFlatCookware(recipe).map((c) => c.name)).toEqual(['large pot']);
    expect(getFlatTimers(recipe)).toEqual([
      { name: null, quantity: 5, unit: 'minutes', displayText: '5 minutes' },
    ]);
  });

  it('reports malformed markup as plain text instead of failing silently', () => {
    const { recipe, report, clean } = parseRecipe('Add @salt{1%tsp and stir for ~{oops');

    expect(clean).toBe(false);
    expect(report).toContain('Warning');
    expect(report).not.toMatch(/<[^>]+>/);
    // The parser drops the broken quantity rather than rejecting the recipe,
    // which is exactly why `clean` has to be checked.
    expect(getFlatIngredients(recipe)).toEqual([
      { name: 'salt', quantity: null, unit: null, displayText: null, note: null },
    ]);
  });
});
