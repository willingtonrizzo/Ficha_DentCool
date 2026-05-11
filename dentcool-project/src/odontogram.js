import { INITIAL_TEETH } from './data';

export function cloneInitialTeeth() {
  return JSON.parse(JSON.stringify(INITIAL_TEETH));
}

export function updateToothSurfaceState(teeth, toothId, surface, state) {
  return {
    ...teeth,
    [toothId]: {
      ...teeth[toothId],
      [surface]: state,
    },
  };
}
