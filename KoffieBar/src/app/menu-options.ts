export interface MenuOptions {
    id: number,
    name: string,
    description: string,
    allergies: string,
    price: number
}

export interface ExtraOption {
    id: number,
    name: string,
    price: number
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