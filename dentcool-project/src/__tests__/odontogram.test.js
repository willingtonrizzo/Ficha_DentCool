import { describe, expect, it } from 'vitest';
import { cloneInitialTeeth, updateToothSurfaceState } from '../odontogram';

describe('odontogram model', () => {
  it('updates only the selected surface of the selected tooth', () => {
    const teeth = cloneInitialTeeth();

    const updated = updateToothSurfaceState(teeth, 16, 'O', 'corona');

    expect(updated[16].O).toBe('corona');
    expect(updated[16].M).toBe(teeth[16].M);
    expect(updated[26]).toEqual(teeth[26]);
    expect(teeth[16].O).toBe('caries');
  });

  it('creates a fresh clone of the initial teeth state', () => {
    const first = cloneInitialTeeth();
    const second = cloneInitialTeeth();

    first[16].O = 'implante';

    expect(second[16].O).toBe('caries');
  });
});
