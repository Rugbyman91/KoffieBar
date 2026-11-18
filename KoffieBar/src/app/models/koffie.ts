export enum KoffieExtra {
  Espresso,
  Melk,
  Suiker,
  VeganMelk
}

export enum KoffieGrootte {
  Small,
  Medium,
  Large,
  ExtraLarge
}

export const KoffieExtraLabels: Record<KoffieExtra, string> = {
  [KoffieExtra.Espresso]: 'Espresso',
  [KoffieExtra.Melk]: 'Melk',
  [KoffieExtra.Suiker]: 'Suiker',
  [KoffieExtra.VeganMelk]: 'Vegan melk'
};

export const KoffieGrootteLabels: Record<KoffieGrootte, string> = {
  [KoffieGrootte.Small]: 'Small',
  [KoffieGrootte.Medium]: 'Medium',
  [KoffieGrootte.Large]: 'Large',
  [KoffieGrootte.ExtraLarge]: 'Extra large'
};

export const EspressoGrootteLabels: Partial<Record<KoffieGrootte, string>> = {
  [KoffieGrootte.Small]: 'Enkel',
  [KoffieGrootte.Medium]: 'Dubbel',
  [KoffieGrootte.Large]: 'Triple'
};

export const KoffieGrootteFactor: Record<KoffieGrootte, number> = {
  [KoffieGrootte.Small]: 1,
  [KoffieGrootte.Medium]: 1.25,
  [KoffieGrootte.Large]: 1.5,
  [KoffieGrootte.ExtraLarge]: 1.75
};

export const EspressoGrootteFactor: Partial<Record<KoffieGrootte, number>> = {
  [KoffieGrootte.Small]: 1,
  [KoffieGrootte.Medium]: 2,
  [KoffieGrootte.Large]: 3
};

export const KoffieExtraPrijs: Record<KoffieExtra, number> = {
  [KoffieExtra.Espresso]: 0.5,
  [KoffieExtra.Melk]: 0,
  [KoffieExtra.Suiker]: 0,
  [KoffieExtra.VeganMelk]: 0.5
};