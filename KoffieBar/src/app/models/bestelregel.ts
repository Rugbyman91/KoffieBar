import { MenuOptions, ExtraOption, KoffieGrootte } from '../menu-options';

export interface GebakBestelregel {
  type: 'gebak';
  product: MenuOptions;
  aantal: number;
}

export interface KoffieBestelregel {
  type: 'koffie';
  product: MenuOptions;
  grootte: KoffieGrootte;
  extras: ExtraOption[];
  aantal: number;
}

export type Bestelregel = GebakBestelregel | KoffieBestelregel;
