import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadSupplyCatalog,
  loadSupplyRecipes,
  loadSupplySnapshots,
  loadSupplyState,
  resetSupplyCatalog,
  resetSupplyRecipes,
  resetSupplySnapshots,
  resetSupplyState,
  saveSupplyCatalog,
  saveSupplyRecipes,
  saveSupplySnapshots,
  saveSupplyState,
} from './suppliesStorage';
import { STORAGE_KEYS } from '../../data';

describe('supplies storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads seeded catalog and recipes by default', () => {
    const catalog = loadSupplyCatalog();
    const recipes = loadSupplyRecipes();

    expect(catalog.length).toBeGreaterThan(0);
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('persists and restores supply catalog, recipes and snapshots', () => {
    saveSupplyCatalog([{ id: 'sup-test', name: 'Test', unitCost: 10 }]);
    saveSupplyRecipes([{ id: 'recipe-test', treatmentId: 'evaluacion', items: [] }]);
    saveSupplySnapshots([{ id: 'snap-test', totalSupplyCost: 100 }]);

    expect(loadSupplyCatalog()[0].name).toBe('Test');
    expect(loadSupplyRecipes()[0].id).toBe('recipe-test');
    expect(loadSupplySnapshots()[0].id).toBe('snap-test');
  });

  it('persists and restores the whole supply state', () => {
    saveSupplyState({
      catalog: [{ id: 'sup-one', name: 'One' }],
      recipes: [{ id: 'recipe-one', treatmentId: 'evaluacion', items: [] }],
      snapshots: [{ id: 'snap-one', totalSupplyCost: 42 }],
    });

    const state = loadSupplyState();

    expect(state.catalog[0].id).toBe('sup-one');
    expect(state.recipes[0].id).toBe('recipe-one');
    expect(state.snapshots[0].id).toBe('snap-one');
  });

  it('persists explicit empty arrays in the supply state', () => {
    saveSupplyState({
      catalog: [],
      recipes: [],
      snapshots: [],
      categories: [],
      units: [],
      suppliers: [],
      purchases: [],
    });

    const state = loadSupplyState();

    expect(state.catalog).toEqual([]);
    expect(state.recipes).toEqual([]);
    expect(state.snapshots).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.units).toEqual([]);
    expect(state.suppliers).toEqual([]);
    expect(state.purchases).toEqual([]);
  });

  it('resets supply storage keys', () => {
    saveSupplyCatalog([{ id: 'sup-reset', name: 'Reset' }]);
    saveSupplyRecipes([{ id: 'recipe-reset', treatmentId: 'evaluacion', items: [] }]);
    saveSupplySnapshots([{ id: 'snap-reset', totalSupplyCost: 1 }]);

    const resetCatalog = resetSupplyCatalog();
    const resetRecipes = resetSupplyRecipes();
    const resetSnapshots = resetSupplySnapshots();
    const resetState = resetSupplyState();

    expect(resetCatalog.length).toBeGreaterThan(0);
    expect(resetRecipes.length).toBeGreaterThan(0);
    expect(resetSnapshots).toEqual([]);
    expect(resetState.catalog.length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(STORAGE_KEYS.suppliesCatalog)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.suppliesRecipes)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.suppliesSnapshots)).toBeNull();
  });
});
