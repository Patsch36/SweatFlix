export interface ColorInfo {
  name: string;
  color: string;
  background: string;
}

export interface DateObj {
  date: string;
  textColor: string;
  backgroundColor: string;
}

export const availableColors: Record<string, ColorInfo> = {
  rose: {
    name: "Rose",
    color: "var(--rose-color)",
    background: "var(--rose-background)",
  },
  mint: {
    name: "Mint",
    color: "var(--mint-color)",
    background: "var(--mint-background)",
  },
  violet: {
    name: "Violet",
    color: "var(--violet-color)",
    background: "var(--violet-background)",
  },
  mindaro: {
    name: "Mindaro",
    color: "var(--mindaro-color)",
    background: "var(--mindaro-background)",
  },
  turquoise: {
    name: "Turquoise",
    color: "var(--turquoise-color)",
    background: "var(--turquoise-background)",
  },
  orange: {
    name: "Orange",
    color: "var(--orange-color)",
    background: "var(--orange-background)",
  },
  cerulean: {
    name: "Cerulean",
    color: "var(--cerulean-color)",
    background: "var(--cerulean-background)",
  },
  magenta: {
    name: "magenta",
    color: "var(--magenta-color)",
    background: "var(--magenta-background)",
  },
  indigo: {
    name: "Indigo",
    color: "var(--indigo-color)",
    background: "var(--indigo-background)",
  },
  gold: {
    name: "Gold",
    color: "var(--gold-color)",
    background: "var(--gold-background)",
  },
  teal: {
    name: "Teal",
    color: "var(--teal-color)",
    background: "var(--teal-background)",
  },
  maroon: {
    name: "Maroon",
    color: "var(--maroon-color)",
    background: "var(--maroon-background)",
  },
  lime: {
    name: "Lime",
    color: "var(--lime-color)",
    background: "var(--lime-background)",
  },
  aubergine: {
    name: "Aubergine",
    color: "var(--aubergine-color)",
    background: "var(--aubergine-background)",
  },
  coral: {
    name: "Coral",
    color: "var(--coral-color)",
    background: "var(--coral-background)",
  },
  olive: {
    name: "Olive",
    color: "var(--olive-color)",
    background: "var(--olive-background)",
  },
};
