import { BiquadFilter } from "./BiquadFilter";
import { CascadedFilterConfig } from "./types";

export class CascadedFilter {
  private filters: BiquadFilter[];

  constructor({ sampleRate, filters }: CascadedFilterConfig) {
    this.filters = filters.map((config) => {
      return new BiquadFilter({ ...config, sampleRate });
    });
  }

  next(x: number) {
    const filters = this.filters;
    const size = filters.length;
    let y = x;

    for (let i = 0; i < size; i++) {
      y = filters[i].next(y);
    }

    return y;
  }
}
