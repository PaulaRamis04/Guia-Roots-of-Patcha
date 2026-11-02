/* Traducción orientativa de nombres de objetos (inglés de la wiki → español).
   Los nombres oficiales del juego en español pueden variar; en Ajustes se puede
   elegir ver los nombres originales en inglés. */

const ITEM_ES = {
  'Mango': 'Mango', 'Poached Egg': 'Huevo escalfado', 'Hot Chocolate': 'Chocolate caliente',
  'Mango Juice (W)': 'Zumo de mango (silvestre)', 'Pomegranate Juice': 'Zumo de granada',
  'Pomegranate Juice (D)': 'Zumo de granada (domesticada)', 'Stone': 'Piedra', 'Wood': 'Madera',
  'Hardwood': 'Madera dura', 'Flint': 'Sílex', 'Obsidian': 'Obsidiana', 'Copper': 'Cobre',
  'Tin': 'Estaño', 'Iron': 'Hierro', 'Silver': 'Plata', 'Gold': 'Oro', 'Coal': 'Carbón',
  'Amethyst': 'Amatista', 'Peridot': 'Peridoto', 'Sapphire': 'Zafiro', 'Agate': 'Ágata',
  'Beryl': 'Berilo', 'Jasper': 'Jaspe', 'Sardius': 'Sardio', 'Horns': 'Cuernos', 'Bones': 'Huesos',
  'Ostrich Egg': 'Huevo de avestruz', 'Ostrich Feather': 'Pluma de avestruz',
  'Junglefowl Feather': 'Pluma de gallina de la jungla', 'Ibex Milk': 'Leche de íbice',
  'Ibex Milk Cheese': 'Queso de íbice', 'Aged Ibex Milk Cheese': 'Queso de íbice añejo',
  'Ibex Milk Herb Cheese': 'Queso de íbice a las hierbas', 'Mushroom Ibex Milk Cheese': 'Queso de íbice con setas',
  'Ibex Milk Sour Cream': 'Nata agria de íbice', 'Red Meat': 'Carne roja', 'White Meat': 'Carne blanca',
  'Dried Red Meat': 'Carne roja seca', 'Smoked Red Meat': 'Carne roja ahumada',
  'Dried White Meat': 'Carne blanca seca', 'Smoked White Meat': 'Carne blanca ahumada',
  'Fertilizer': 'Fertilizante', 'Plant Fiber': 'Fibra vegetal', 'Hay Bale': 'Bala de heno',
  'Horse Manure': 'Estiércol de caballo', 'Poop': 'Excremento', 'Banana': 'Plátano', 'Fig': 'Higo',
  'Cherry': 'Cereza', 'Cherries': 'Cerezas', 'Blackcurrant': 'Grosella negra', 'Avocado': 'Aguacate', 'Avocado (D)': 'Aguacate (domesticado)',
  'Citron': 'Cidra', 'Alma': 'Alma', 'Vanilla Bean': 'Vaina de vainilla', 'Cacao Bean': 'Grano de cacao', 'Cacao': 'Cacao',
  'White Strawberry': 'Fresa blanca', 'White Eggplant': 'Berenjena blanca', 'Red Cabbage': 'Lombarda',
  'Muscovado Sugar': 'Azúcar moscabado', 'Wheat Bread': 'Pan de trigo', 'Mango Lassi': 'Lassi de mango',
  'Sundried Tomato': 'Tomate secado al sol', 'Wild Honey': 'Miel silvestre', 'Sauerkraut': 'Chucrut',
  'Guanaco Fur': 'Pelaje de guanaco', 'Guanaco Fur Yarn': 'Hilo de guanaco', 'Bison Fur': 'Pelaje de bisonte',
  'Boar Fur': 'Pelaje de jabalí', 'Boar Fur Yarn': 'Hilo de jabalí', 'Mouflon Wool': 'Lana de muflón',
  'Sheep Wool': 'Lana de oveja', 'Bear Claw': 'Garra de oso', 'Dried Sponge': 'Esponja seca',
  'Almond Milk': 'Leche de almendra', 'Almond Milk Cheese': 'Queso de almendra', 'Almond Milk Butter': 'Mantequilla de almendra',
  'Coconut Milk': 'Leche de coco', 'Coconut Milk Butter': 'Mantequilla de coco', 'Olive Oil': 'Aceite de oliva',
  'Sesame Oil': 'Aceite de sésamo', 'Black Sesame Oil': 'Aceite de sésamo negro', 'Sunflower Oil': 'Aceite de girasol',
  'Avocado Oil': 'Aceite de aguacate', 'Plant Meat': 'Carne vegetal', 'Beans Plant Meat': 'Carne vegetal de judías',
  'Beans Plant Meat (D)': 'Carne vegetal de judías (domesticada)', 'Smoked Beans': 'Judías ahumadas',
  'Smoked Plant Meat': 'Carne vegetal ahumada', 'Dried Beans': 'Judías secas', 'Roasted Fish': 'Pescado asado',
  'Roast Meat': 'Carne asada', 'Meat Stew': 'Estofado de carne', 'Potato Salad': 'Ensalada de patata',
  'Pineapple Pizza': 'Pizza de piña', 'Pizza': 'Pizza', 'Spaghetti': 'Espaguetis', 'Hummus': 'Hummus',
  'Wheat Flour': 'Harina de trigo', 'Wheat Flour (D)': 'Harina de trigo (domesticado)', 'Teff Flour': 'Harina de teff',
  'Amaranth Flour': 'Harina de amaranto', 'Corn Flour': 'Harina de maíz', 'Wheat Beer': 'Cerveza de trigo',
  'Rye Beer': 'Cerveza de centeno', 'Wild Rye Beer': 'Cerveza de centeno silvestre', 'Wild Rice Beer': 'Cerveza de arroz silvestre',
  'Mulled Wine': 'Vino especiado', 'Raisins': 'Pasas', 'Raisins (W)': 'Pasas (silvestres)', 'Wild Raisins': 'Pasas silvestres',
  'Wild Raisins (W)': 'Pasas silvestres', 'Dried Fruit': 'Fruta seca', 'Juice': 'Zumo', 'Soapsuds': 'Espuma de jabón',
  'Grapes (W)': 'Uvas (silvestres)', 'Olive (W)': 'Aceituna (silvestre)', 'Tomato (D)': 'Tomate (domesticado)',
  'Broccoli (W)': 'Brócoli (silvestre)', 'Oats Cheese': 'Queso de avena', 'Oats Milk Cheese': 'Queso de leche de avena',
  'Almond Cheese': 'Queso de almendra', 'Fried Eggs': 'Huevos fritos', 'Fruit Platter': 'Bandeja de fruta',
  'Fried Cheese Curd': 'Queso frito', 'Steamed Vegetables': 'Verduras al vapor', 'Roasted Vegetables': 'Verduras asadas',
  'Onion Soup': 'Sopa de cebolla', 'Beer Battered Onion Rings': 'Aros de cebolla rebozados', 'Crab Cakes': 'Pastelitos de cangrejo',
  'Fish Taco': 'Taco de pescado', 'Fish Larb': 'Larb de pescado', 'Sushi': 'Sushi', 'Popcorn': 'Palomitas',
  'Pumpkin Pie': 'Tarta de calabaza', 'Fruit Crumble': 'Crumble de fruta', 'Berry Tart': 'Tarta de frutos rojos',
  'Mushroom Tart': 'Tarta de setas', 'Stuffed Dates': 'Dátiles rellenos', 'Stuffed Figs': 'Higos rellenos',
  'Stuffed Peppers': 'Pimientos rellenos', 'Meat Filled Squash': 'Calabaza rellena de carne', 'Cassava Cake': 'Pastel de yuca',
  'Lentil Pie': 'Pastel de lentejas', 'Seaweed Salad': 'Ensalada de algas', 'Calamari Salad': 'Ensalada de calamar',
  'Cole Slaw': 'Ensalada de col', 'Kale Crisps': 'Chips de col rizada', 'Banana Chips': 'Chips de plátano',
  'Tomato Bisque': 'Crema de tomate', 'Tomato Carpaccio': 'Carpaccio de tomate', 'Dried Yellow Tomato': 'Tomate amarillo seco',
  'Roasted Tromboncino': 'Tromboncino asado', 'Spicy Cauliflower Wings': 'Alitas de coliflor picantes',
  'Pineapple Chicken': 'Pollo con piña', 'Arroz Con Leche': 'Arroz con leche', 'Porridge': 'Gachas', 'Granola': 'Granola',
  'Dumplings': 'Empanadillas al vapor', 'Empanadas': 'Empanadas', 'Buns': 'Bollos', 'Marzipan': 'Mazapán',
  'Parfait': 'Parfait', 'Couscous': 'Cuscús', 'Ramen': 'Ramen', 'Curry': 'Curry', 'Kefir Pancakes': 'Tortitas de kéfir',
  'Pomegranate Toast': 'Tostada de granada', 'Fig and Goats Cheese Pizza': 'Pizza de higo y queso de cabra',
  'Ostrich Egg Mayonnaise': 'Mayonesa de huevo de avestruz', 'Ostrich Egg Mayo': 'Mayonesa de huevo de avestruz',
  'Tomato Honey': 'Miel de tomate', 'Strawberry Honey': 'Miel de fresa', 'Sunflower Mead': 'Hidromiel de girasol',
  'Pineapple Mead': 'Hidromiel de piña', 'Pumpkin Mead': 'Hidromiel de calabaza', 'Sesame Mead': 'Hidromiel de sésamo',
  'Pineapple Mead Vinegar': 'Vinagre de hidromiel de piña', 'Broccoli Vinegar': 'Vinagre de brócoli',
  'Citron Vinegar': 'Vinagre de cidra', 'Cabbage Vinegar': 'Vinagre de repollo', 'Red Meat Lard': 'Manteca de carne roja',
  'White Meat Lard': 'Manteca de carne blanca', 'Oil Cake': 'Torta de aceite', 'Ibon\'s Traveling Cakes': 'Pasteles de viaje de Ibon',
  'Mediterranean Grilled Fish': 'Pescado a la mediterránea', 'Pasta of the Sea': 'Pasta marinera',
  'Medicinal Plants': 'Plantas medicinales', 'Oysters': 'Ostras', 'Wild Grapes': 'Uvas silvestres',
  'Wild Fennel': 'Hinojo silvestre', 'Blue Corn Tortillas': 'Tortillas de maíz azul',
  'Strawberry Mulled Wine': 'Vino especiado de fresa', 'Fermented Wild Rice': 'Arroz silvestre fermentado',
  'Dragonfly': 'Libélula', 'Silk Moth': 'Polilla de la seda', 'Mole Cricket': 'Grillo topo',
  'Peacock Butterfly': 'Mariposa pavo real', 'Orchid Mantis': 'Mantis orquídea', 'Rainbow Grasshopper': 'Saltamontes arcoíris',
  'Panda Ant': 'Hormiga panda', 'Tree Hopper': 'Membrácido', 'Spiny Flower': 'Mantis flor espinosa',
  'Jumping Weevil': 'Gorgojo saltarín', 'Flan': 'Flan', 'Tamales': 'Tamales', 'Falafel': 'Falafel'
};

const ANY_ES = {
  'Bugs': 'bicho', 'Shell': 'concha', 'Fish': 'pez', 'River Fish': 'pez de río', 'Ocean Fish': 'pez de mar',
  'Water Animal': 'animal acuático', 'Gemstone': 'gema', 'Honey': 'miel', 'Mead': 'hidromiel', 'Wine': 'vino',
  'Aged Wine': 'vino añejo', 'Mulled Wine': 'vino especiado', 'Beer': 'cerveza', 'Mushroom': 'seta', 'Soap': 'jabón',
  'Yarn': 'hilo', 'Fur': 'pelaje', 'Jam': 'mermelada', 'Smoked Fish': 'pescado ahumado', 'Dried Fish': 'pescado seco',
  'Pickled Fish': 'pescado encurtido', 'Fermented Fish': 'pescado fermentado', 'Flour': 'harina', 'Oil': 'aceite',
  'Vinegar': 'vinagre', 'Cheese': 'queso', 'Aged Cheese': 'queso añejo', 'Herb Cheese': 'queso a las hierbas',
  'Mushroom Cheese': 'queso con setas', 'Mayo': 'mayonesa', 'Butter': 'mantequilla', 'Milk': 'leche', 'Ore': 'mineral',
  'Grain': 'cereal', 'Juice': 'zumo', 'Medicinal Plants': 'planta medicinal', 'Wild Flower': 'flor silvestre',
  'Dishes': 'plato cocinado', 'Pickled Vegetable': 'verdura encurtida', 'Pickled Root': 'raíz encurtida',
  'Pickled Meat': 'carne encurtida', 'Pickled Egg': 'huevo encurtido', 'Fermented Vegetable': 'verdura fermentada',
  'Fermented Grain': 'cereal fermentado', 'Plant Meat': 'carne vegetal', 'Animal Meat': 'carne animal',
  'Dried Meat': 'carne seca', 'Smoked Meat': 'carne ahumada', 'Lard': 'manteca', 'Sour Cream': 'nata agria',
  'Egg': 'huevo', 'Feather': 'pluma', 'Bread': 'pan', 'Root': 'raíz', 'Wheat': 'trigo', 'Rice': 'arroz', 'Almond': 'almendra',
  'Animal Gelatin': 'gelatina animal'
};

(function buildFromData() {
  CROPS.forEach(c => { ITEM_ES[c.en] = c.name; });
  TREES.forEach(t => { ITEM_ES[t.en] = t.name; });
  GATHER.forEach(g => { ITEM_ES[g.en] = g.name; });
})();

const PREFIX_ES = [
  [' Jam', 'Mermelada de '], [' Soap', 'Jabón de '], [' Juice', 'Zumo de '], [' Wine', 'Vino de '],
  [' Mead', 'Hidromiel de '], [' Vinegar', 'Vinagre de ']
];
const ADJ_ES = [
  ['Dried ', ' sec'], ['Smoked ', ' ahumad'], ['Pickled ', ' encurtid'], ['Fermented ', ' fermentad'],
  ['Aged ', ' añej']
];

function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

function translateItem(en) {
  if (ITEM_ES[en]) return ITEM_ES[en];
  if (en.startsWith('Any ')) {
    const rest = en.slice(4);
    if (ANY_ES[rest]) return 'Cualquier ' + ANY_ES[rest];
    if (ITEM_ES[rest]) return 'Cualquier ' + lowerFirst(ITEM_ES[rest]);
    return null;
  }
  for (const [suffix, pre] of PREFIX_ES) {
    if (en.endsWith(suffix)) {
      const base = en.slice(0, -suffix.length);
      const b = ITEM_ES[base] || ITEM_ES[base + 's'] || (base === 'Grape' ? 'Uvas' : null);
      if (b) return pre + lowerFirst(b);
    }
  }
  for (const [pre, adj] of ADJ_ES) {
    if (en.startsWith(pre)) {
      const base = en.slice(pre.length);
      const b = translateItem(base) || (FISH.some(f => f.name === base) ? base : null);
      if (b) return b + agree(adj, b);
    }
  }
  return null;
}

/* Concordancia sencilla: «Granada seca», «Uvas secas», «Mango seco». */
function agree(stem, noun) {
  const head = noun.split(' ')[0].toLowerCase();
  const plural = /s$/.test(head);
  const fem = /as?$/.test(head) && head !== 'alma';
  return stem + (fem ? 'a' : 'o') + (plural ? 's' : '');
}
