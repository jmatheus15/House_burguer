/* Monta a mensagem do pedido para o WhatsApp. Preços sempre em centavos. */
(function (root) {
  var fmt = function (c) { return 'R$ ' + (c / 100).toFixed(2).replace('.', ','); };

  function total(items) {
    return items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function buildMessage(o) {
    var lines = ['Olá, House Burguer! Quero fazer um pedido:', ''];
    o.items.forEach(function (i) { lines.push(i.qty + 'x ' + i.name + ': ' + fmt(i.price * i.qty)); });
    lines.push('', 'Total: ' + fmt(total(o.items)), 'Nome: ' + o.name);
    lines.push(o.mode === 'retirada' ? 'Retirada no balcão' : 'Entrega: ' + o.address);
    lines.push('Pagamento: ' + o.pay);
    if (o.obs) lines.push('Obs: ' + o.obs);
    return lines.join('\n');
  }

  function waLink(phone, msg) {
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
  }

  var api = { fmt: fmt, total: total, buildMessage: buildMessage, waLink: waLink };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Pedido = api;
})(this);
