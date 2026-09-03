import { Component, computed, input } from '@angular/core';
import { EurPipe } from './eur.pipe';
import { PieSlice } from './models';
import { pieArcs } from './pie';

@Component({
  selector: 'app-pie-chart',
  imports: [EurPipe],
  templateUrl: './pie-chart.html',
})
export class PieChart {
  readonly slices = input<PieSlice[]>([]);
  readonly caption = input('Money mix');
  readonly empty = input('Nothing to chart yet. Add income or leftover first.');
  readonly arcs = computed(() => pieArcs(this.slices()));
}
