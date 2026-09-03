import { Injectable } from '@angular/core';
import { CHECKLIST, GUIDES } from './catalog';
import { estimatePay } from './ireland-pay';
import { ChecklistItem, Guide, GuideListItem, PayEstimate, PayRequest } from './models';

@Injectable({ providedIn: 'root' })
export class FormJobsService {
  estimate(request: PayRequest): PayEstimate {
    return estimatePay(request);
  }

  checklist(): ChecklistItem[] {
    return CHECKLIST;
  }

  guides(): GuideListItem[] {
    return GUIDES.map(({ slug, title, kicker, summary }) => ({ slug, title, kicker, summary }));
  }

  guide(slug: string): Guide | undefined {
    return GUIDES.find((item) => item.slug.toLowerCase() === slug.toLowerCase());
  }
}
