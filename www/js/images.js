/* Imágenes de la Official Roots of Pacha Wiki (rootsofpacha.wiki.gg).
   Las que aparecen en IMG_LOCAL (img-index.js) van incluidas en la app, en la carpeta img/,
   y funcionan sin conexión. El resto se piden a la wiki cuando hay internet.
   Si una imagen no carga, se muestra la inicial del nombre. Las imágenes del juego
   son propiedad de sus autores (Soda Den). */

const WIKI_IMG_BASE = 'https://rootsofpacha.wiki.gg/wiki/Special:FilePath/';

function wikiUrl(file) {
  if (typeof IMG_LOCAL !== 'undefined' && IMG_LOCAL.has(file)) return 'img/' + file.replace(/[^A-Za-z0-9._-]/g, '_');
  return WIKI_IMG_BASE + encodeURIComponent(file.replace(/ /g, '_'));
}

const ROOTS_EN = ['Beets', 'Garlic', 'Carrot', 'Potato', 'Onion', 'Cassava', 'Kohlrabi', 'Orange Carrot', 'Shallot', 'Sweet Potato'];
const MEATS_EN = ['Red Meat', 'White Meat', 'Beans'];
const ANY_ICON = {
  'Fish': 'Water Animal L', 'Water Animal': 'Water Animal L', 'River Fish': 'Fish L', 'Ocean Fish': 'Fish L',
  'Animal Meat': 'Meat L', 'Animal Gelatin': 'Gelatin L', 'Ore': 'Copper', 'Medicinal Plants': 'Wild Flower L'
};

function isFishName(n) { return typeof FISH !== 'undefined' && FISH.some(f => f.name === n); }

/* Nombre del archivo de la wiki para un objeto (tal como aparece en los regalos). */
function itemIconFile(en) {
  let n = en.replace(/ \((W|D)\)$/, '');
  if (n.startsWith('Any ')) {
    const rest = n.slice(4);
    return (ANY_ICON[rest] || rest + ' L') + '.png';
  }
  const direct = {
    'Pomegranate Juice': 'Pomegranate Juice', 'Tomato Juice': 'Tomato Juice', 'Wild Honey': 'Wild Honey',
    'Beans Plant Meat': 'Plant Meat', 'Smoked Beans': 'Smoked Plant Meat', 'Dried Beans': 'Dried Plant Meat',
    'Wild Raisins': 'Raisins', 'Ostrich Egg Mayo': 'Mayo', 'Ostrich Egg Mayonnaise': 'Mayo',
    'Wheat Flour': 'Wheat Flour', 'Teff Flour': 'Teff Flour', 'Juice': 'Juice', 'Dried Fruit': 'Dried Fruit'
  };
  if (direct[n]) return direct[n] + '.png';
  const ends = (s) => n.endsWith(s);
  if (ends(' Jam')) return 'Jam.png';
  if (ends(' Soap')) return 'Soap.png';
  if (ends(' Juice')) return 'Juice.png';
  if (ends(' Vinegar')) return 'Vinegar.png';
  if (ends(' Mead')) return 'Mead.png';
  if (ends(' Mulled Wine') || n === 'Mulled Wine') return 'Mulled Wine.png';
  if (n.startsWith('Aged ') && ends(' Wine')) return 'Aged Wine.png';
  if (ends(' Wine')) return 'Wine.png';
  if (ends(' Beer')) return 'Beer.png';
  if (ends(' Oil')) return 'Oil.png';
  if (ends(' Lard')) return 'Lard.png';
  if (ends(' Butter')) return 'Butter.png';
  if (ends(' Sour Cream')) return 'Sour Cream.png';
  if (ends(' Honey')) return 'Honey.png';
  if (ends(' Flour')) return 'Flour.png';
  if (ends(' Cheese') && n !== 'Ibex Milk Cheese') {
    if (n.startsWith('Aged ')) return 'Aged Cheese.png';
    if (n.includes('Herb')) return 'Herb Cheese.png';
    if (n.startsWith('Mushroom')) return 'Mushroom Cheese.png';
    return 'Cheese.png';
  }
  if (n.startsWith('Dried ')) {
    const b = n.slice(6);
    if (isFishName(b) || ['Red Meat', 'White Meat', 'Sponge', 'Yellow Tomato', 'Stargazer'].includes(b)) return n + '.png';
    return 'Dried Fruit.png';
  }
  if (n.startsWith('Pickled ')) {
    const b = n.slice(8);
    if (isFishName(b) || ['Oysters', 'Chitons', 'Sponge'].includes(b)) return 'Pickled Fish.png';
    if (ROOTS_EN.includes(b)) return 'Pickled Root.png';
    if (MEATS_EN.includes(b)) return 'Pickled Meat.png';
    return 'Pickled Vegetable.png';
  }
  if (n.startsWith('Fermented ')) {
    const b = n.slice(10);
    if (isFishName(b) || ['Oysters', 'Sponge'].includes(b)) return 'Fermented Fish.png';
    if (['Wild Rice', 'Millet', 'Amaranth', 'Rice', 'Wheat', 'Corn'].includes(b)) return 'Fermented Grain.png';
    return 'Fermented Vegetable.png';
  }
  return n + '.png';
}

function villagerIconFile(v) { return v.name + '.png'; }
function villagerPortraitFile(v) { return v.name + ' Portrait.png'; }
