// Rode com: node testes/pedido.test.js
const assert = require('node:assert');
const P = require('../site/assets/pedido.js');

const items = [
  { name: 'Duplo Bacon', price: 3290, qty: 2 },
  { name: 'Refri lata', price: 600, qty: 1 }
];
assert.strictEqual(P.total(items), 7180);
assert.strictEqual(P.fmt(7180), 'R$ 71,80');
assert.strictEqual(P.fmt(1990), 'R$ 19,90');

const entrega = P.buildMessage({ items, name: 'Ana', mode: 'entrega', address: 'Rua A, 10', pay: 'Pix', obs: 'sem cebola' });
assert.ok(entrega.includes('2x Duplo Bacon: R$ 65,80'));
assert.ok(entrega.includes('Total: R$ 71,80'));
assert.ok(entrega.includes('Entrega: Rua A, 10'));
assert.ok(entrega.endsWith('Obs: sem cebola'));

const retirada = P.buildMessage({ items, name: 'Ana', mode: 'retirada', address: '', pay: 'Dinheiro', obs: '' });
assert.ok(retirada.includes('Retirada no balcão'));
assert.ok(!retirada.includes('Obs:'));

const link = P.waLink('5583996330716', 'Olá & tchau');
assert.strictEqual(link, 'https://wa.me/5583996330716?text=Ol%C3%A1%20%26%20tchau');

console.log('pedido: ok');
