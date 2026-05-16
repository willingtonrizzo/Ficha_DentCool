import { STORAGE_KEYS } from '../../data';
import { getPersistedItem, removePersistedItem, setPersistedItem } from '../../persistence';
import {
  DEFAULT_SUPPLY_CATALOG,
  DEFAULT_SUPPLY_CATEGORIES,
  DEFAULT_SUPPLY_RECIPES,
  DEFAULT_SUPPLY_SUPPLIERS,
  DEFAULT_SUPPLY_UNITS,
} from './suppliesSeeds';

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function loadJsonArray(key, fallback) {
  if (typeof window === 'undefined') return cloneValue(fallback);
  try {
    const raw = getPersistedItem(key);
    if (!raw) return cloneValue(fallback);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return cloneValue(fallback);
    return cloneValue(parsed);
  } catch {
    return cloneValue(fallback);
  }
}

function saveJsonArray(key, value) {
  if (typeof window === 'undefined') return;
  setPersistedItem(key, JSON.stringify(cloneValue(value)));
}

function resetJsonArray(key, fallback) {
  if (typeof window !== 'undefined') {
    removePersistedItem(key);
  }
  return cloneValue(fallback);
}

function hasOwnValue(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

export function loadSupplyCatalog() {
  return loadJsonArray(STORAGE_KEYS.suppliesCatalog, DEFAULT_SUPPLY_CATALOG);
}

export function saveSupplyCatalog(catalog) {
  saveJsonArray(STORAGE_KEYS.suppliesCatalog, catalog);
}

export function resetSupplyCatalog() {
  return resetJsonArray(STORAGE_KEYS.suppliesCatalog, DEFAULT_SUPPLY_CATALOG);
}

export function loadSupplyRecipes() {
  return loadJsonArray(STORAGE_KEYS.suppliesRecipes, DEFAULT_SUPPLY_RECIPES);
}

export function saveSupplyRecipes(recipes) {
  saveJsonArray(STORAGE_KEYS.suppliesRecipes, recipes);
}

export function resetSupplyRecipes() {
  return resetJsonArray(STORAGE_KEYS.suppliesRecipes, DEFAULT_SUPPLY_RECIPES);
}

export function loadSupplySnapshots() {
  return loadJsonArray(STORAGE_KEYS.suppliesSnapshots, []);
}

export function saveSupplySnapshots(snapshots) {
  saveJsonArray(STORAGE_KEYS.suppliesSnapshots, snapshots);
}

export function resetSupplySnapshots() {
  return resetJsonArray(STORAGE_KEYS.suppliesSnapshots, []);
}

export function loadSupplyCategories() {
  return loadJsonArray(STORAGE_KEYS.suppliesCategories, DEFAULT_SUPPLY_CATEGORIES);
}

export function saveSupplyCategories(categories) {
  saveJsonArray(STORAGE_KEYS.suppliesCategories, categories);
}

export function resetSupplyCategories() {
  return resetJsonArray(STORAGE_KEYS.suppliesCategories, DEFAULT_SUPPLY_CATEGORIES);
}

export function loadSupplyUnits() {
  return loadJsonArray(STORAGE_KEYS.suppliesUnits, DEFAULT_SUPPLY_UNITS);
}

export function saveSupplyUnits(units) {
  saveJsonArray(STORAGE_KEYS.suppliesUnits, units);
}

export function resetSupplyUnits() {
  return resetJsonArray(STORAGE_KEYS.suppliesUnits, DEFAULT_SUPPLY_UNITS);
}

export function loadSupplySuppliers() {
  return loadJsonArray(STORAGE_KEYS.suppliesSuppliers, DEFAULT_SUPPLY_SUPPLIERS);
}

export function saveSupplySuppliers(suppliers) {
  saveJsonArray(STORAGE_KEYS.suppliesSuppliers, suppliers);
}

export function resetSupplySuppliers() {
  return resetJsonArray(STORAGE_KEYS.suppliesSuppliers, DEFAULT_SUPPLY_SUPPLIERS);
}

export function loadSupplyPurchases() {
  return loadJsonArray(STORAGE_KEYS.suppliesPurchases, []);
}

export function saveSupplyPurchases(purchases) {
  saveJsonArray(STORAGE_KEYS.suppliesPurchases, purchases);
}

export function resetSupplyPurchases() {
  return resetJsonArray(STORAGE_KEYS.suppliesPurchases, []);
}

export function loadSupplyState() {
  return {
    catalog: loadSupplyCatalog(),
    recipes: loadSupplyRecipes(),
    snapshots: loadSupplySnapshots(),
    categories: loadSupplyCategories(),
    units: loadSupplyUnits(),
    suppliers: loadSupplySuppliers(),
    purchases: loadSupplyPurchases(),
  };
}

export function saveSupplyState(state = {}) {
  if (hasOwnValue(state, 'catalog')) saveSupplyCatalog(state.catalog);
  if (hasOwnValue(state, 'recipes')) saveSupplyRecipes(state.recipes);
  if (hasOwnValue(state, 'snapshots')) saveSupplySnapshots(state.snapshots);
  if (hasOwnValue(state, 'categories')) saveSupplyCategories(state.categories);
  if (hasOwnValue(state, 'units')) saveSupplyUnits(state.units);
  if (hasOwnValue(state, 'suppliers')) saveSupplySuppliers(state.suppliers);
  if (hasOwnValue(state, 'purchases')) saveSupplyPurchases(state.purchases);
}

export function resetSupplyState() {
  return {
    catalog: resetSupplyCatalog(),
    recipes: resetSupplyRecipes(),
    snapshots: resetSupplySnapshots(),
    categories: resetSupplyCategories(),
    units: resetSupplyUnits(),
    suppliers: resetSupplySuppliers(),
    purchases: resetSupplyPurchases(),
  };
}
