// Cada cor tem um símbolo próprio para quem tem daltonismo distinguir os contêineres.

export interface CargoColor {
  fill: string;
  ink: string;
  symbol: keyof typeof SYMBOLS;
}

export const SYMBOLS = {
  circle: '<circle cx="6" cy="6" r="4.4"/>',
  triangle: '<path d="M6 1.2 11 10.4H1z"/>',
  square: '<rect x="1.8" y="1.8" width="8.4" height="8.4"/>',
  diamond: '<path d="M6 .6 11.4 6 6 11.4.6 6z"/>',
  star: '<path d="m6 .6 1.7 3.5 3.8.5-2.8 2.6.7 3.8L6 9.2 2.6 11l.7-3.8L.5 4.6l3.8-.5z"/>',
  plus: '<path d="M4.4 1h3.2v3.4H11v3.2H7.6V11H4.4V7.6H1V4.4h3.4z"/>',
  hex: '<path d="M3.2 1.2h5.6L11.6 6l-2.8 4.8H3.2L.4 6z"/>',
  x: '<path d="M2.2.8 6 4.6 9.8.8l1.4 1.4L7.4 6l3.8 3.8-1.4 1.4L6 7.4l-3.8 3.8L.8 9.8 4.6 6 .8 2.2z"/>',
  ring: '<circle cx="6" cy="6" r="3.7" fill="none" stroke="currentColor" stroke-width="2.4"/>',
};

export const COLORS: CargoColor[] = [
  { fill: '#d9473a', ink: 'rgba(255,255,255,.9)', symbol: 'circle' },
  { fill: '#3c72db', ink: 'rgba(255,255,255,.9)', symbol: 'triangle' },
  { fill: '#e9c43f', ink: 'rgba(40,28,0,.75)', symbol: 'square' },
  { fill: '#3e9d5c', ink: 'rgba(255,255,255,.9)', symbol: 'diamond' },
  { fill: '#8150c8', ink: 'rgba(255,255,255,.9)', symbol: 'star' },
  { fill: '#ee8a2a', ink: 'rgba(50,20,0,.75)', symbol: 'plus' },
  { fill: '#e15b9e', ink: 'rgba(255,255,255,.9)', symbol: 'hex' },
  { fill: '#cdd4d6', ink: 'rgba(10,30,40,.75)', symbol: 'x' },
  { fill: '#8b5a3a', ink: 'rgba(255,255,255,.88)', symbol: 'ring' },
];
