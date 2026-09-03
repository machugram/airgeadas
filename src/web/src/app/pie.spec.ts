import { pieArcs } from './pie';

describe('pieArcs', () => {
  it('splits two equal slices', () => {
    const arcs = pieArcs([
      { label: 'A', value: 50, color: '#111' },
      { label: 'B', value: 50, color: '#222' },
    ]);

    expect(arcs.length).toBe(2);
    expect(arcs[0].percent).toBe(50);
    expect(arcs[1].percent).toBe(50);
    expect(arcs[0].d).toContain('A ');
    expect(arcs[0].d).not.toContain('M 8 ');
  });

  it('draws a ring when one slice takes the lot', () => {
    const arcs = pieArcs([{ label: 'Only', value: 10, color: '#111' }]);

    expect(arcs.length).toBe(1);
    expect(arcs[0].percent).toBe(100);
    expect(arcs[0].d.startsWith('M 8 ')).toBeTrue();
  });

  it('skips empty slices', () => {
    const arcs = pieArcs([
      { label: 'A', value: 20, color: '#111' },
      { label: 'B', value: 0, color: '#222' },
    ]);

    expect(arcs.length).toBe(1);
    expect(arcs[0].slice.label).toBe('A');
  });
});
