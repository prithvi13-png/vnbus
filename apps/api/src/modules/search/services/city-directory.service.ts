import { Injectable } from "@nestjs/common";
import { srdvCityRows } from "@vnbus/supplier-sdk";
import type { CitySuggestion } from "@vnbus/types";

import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";

interface CityEntry extends CitySuggestion {
  /** SRDV's own code, which runs roughly from major cities to minor ones. */
  order: number;
  lower: string;
  words: string[];
}

const MAX_SUGGESTIONS = 20;

/**
 * The cities a traveller can search: SRDV's own city list, plus any city
 * added through SRDV_CITY_CODES. Built once on first use and searched in
 * memory — 27,000 names is a few milliseconds per keystroke.
 */
@Injectable()
export class CityDirectoryService {
  private entries: CityEntry[] | null = null;

  constructor(private readonly configuration: IntegrationConfigurationService) {}

  /**
   * Best matches first: the exact name, then names starting with the query,
   * then names with a word starting with it, then any other match. Ties go to
   * SRDV's own order, which lists major cities early — "bang" offers Bangalore
   * before Bangar. Each letter typed narrows the list further.
   */
  suggest(query: string, limit = 10): CitySuggestion[] {
    const needle = query.trim().toLowerCase().replace(/\s+/gu, " ");

    if (needle.length < 2) {
      return [];
    }

    return this.index()
      .map((entry) => ({ entry, rank: rankMatch(entry, needle) }))
      .filter((candidate) => candidate.rank < 4)
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.entry.order - right.entry.order ||
          left.entry.name.localeCompare(right.entry.name),
      )
      .slice(0, Math.min(Math.max(limit, 1), MAX_SUGGESTIONS))
      .map(({ entry }) => ({ name: entry.name, state: entry.state }));
  }

  private index(): CityEntry[] {
    if (this.entries) {
      return this.entries;
    }

    const entries = srdvCityRows().map(([code, name, state]) =>
      toEntry(name.trim(), state.trim(), Number(code)),
    );
    const known = new Set(entries.map((entry) => entry.lower));

    // Cities added only through SRDV_CITY_CODES. The setting carries no state
    // or display casing, so the name is title-cased as typed.
    for (const [name, code] of this.configuration.getSrdvCityCodes()) {
      if (!known.has(name) && !name.includes(",")) {
        known.add(name);
        entries.push(toEntry(titleCase(name), "", Number(code)));
      }
    }

    this.entries = entries;

    return entries;
  }
}

function toEntry(name: string, state: string, code: number): CityEntry {
  const lower = name.toLowerCase();

  return {
    name,
    state,
    order: Number.isFinite(code) ? code : Number.MAX_SAFE_INTEGER,
    lower,
    words: lower.split(/[\s(),.-]+/u).filter(Boolean),
  };
}

function rankMatch(entry: CityEntry, needle: string): number {
  if (entry.lower === needle) {
    return 0;
  }
  if (entry.lower.startsWith(needle)) {
    return 1;
  }
  if (entry.words.some((word) => word.startsWith(needle))) {
    return 2;
  }

  return entry.lower.includes(needle) ? 3 : 4;
}

function titleCase(value: string): string {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
