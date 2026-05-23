import { sportmonksEndpoints } from "../endpoints";
import { normalizeCountry } from "../normalize/countries";
import { runSportmonksSync } from "./core";

export function syncCountries() {
  return runSportmonksSync({
    entity: "countries",
    endpoint: sportmonksEndpoints.countries,
    table: "countries",
    normalize: normalizeCountry
  });
}
