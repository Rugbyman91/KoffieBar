export interface MenuOptions {
  id: number;
  name: string;
  description: string;
  allergies: string;
  price: number;
  categorie: Categorie;
  isEspresso: boolean;
}

export enum Categorie {
  Koffie = 1,
  Gebak = 2,
}

export interface ExtraOption {
  id: number;
  name: string;
  price: number;
}

export interface KoffieGrootte {
  code: string;
  label: string;
  factor: number;
}

export interface MenuData {
  coffees: MenuOptions[];
  pastries: MenuOptions[];
  extras: ExtraOption[];
  coffeeSizes: KoffieGrootte[];
  espressoSizes: KoffieGrootte[];
}
