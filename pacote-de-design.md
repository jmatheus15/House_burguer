# Pacote de design: House Burguer (Nível 1, sem vídeo)

Desvio declarado: o usuário escolheu seguir sem vídeo de IA. O hero é uma montagem guiada por scroll feita em SVG e código, com as camadas do burger do próprio logo. Sem vídeo não há download pesado, então o hero de montagem roda em todas as telas; só movimento reduzido recebe o hero estático (estado final composto).

## 1. Premissa da marca

**Camada por camada.** Todo burger da House é montado na hora, uma camada de cada vez, e cada camada é uma promessa: pão selado, carne na chapa, cheddar que escorre, salada fresca, e a tampa que fecha quente. O hero monta o burger do logo enquanto a pessoa rola; o cardápio deixa ela montar o próprio pedido; o pedido sai pronto no WhatsApp.

## 2. Paleta

```css
:root{
  --canvas:#1A0D07;        /* chapa queimada, nunca preto puro */
  --panel:#26140B;         /* cartões */
  --brand:#FF4B00;         /* o laranja do logo, superfícies grandes */
  --accent:#FFC21F;        /* cheddar: só CTA, foco e a camada de queijo */
  --accent-hover:#FFD45C;
  --accent-muted:rgba(255,194,31,.22);
  --text-secondary:#CDB49C;
  --text-primary:#FFF1DC;  /* o creme do logo */
}
```

Desvio dito em voz alta: tela quase preta com acento quente é um visual proibido como reflexo, mas aqui o laranja É a marca (fundo do logo e do panfleto). Ele entra como superfície grande (seção do cardápio e painel do pedido), não como acento, e não há serifa.

## 3. Fontes

- Display: **Anton** 400 (alta e condensada como o letreiro do logo)
- Texto: **Archivo** 400, 600, 700
- Mono: **DM Mono** 400, 500 (rótulos pequenos)

## 4. Mapa de faixas (hero de 300vh, a pedido do usuário: menos rolagem)

Atualizado em 2026-10-19: o hero é o vídeo real do burger se montando (3,7 s, guiado pelo scroll) em todas as telas, celular incluído, a pedido do usuário (desvio dos cinco portões da skill: o celular baixa os 3,4 MB do vídeo). Em pé, o vídeo fica no alto e as frases embaixo; deitado, frases à esquerda e burger à direita. Só o movimento reduzido recebe o hero parado (o burger do logo em SVG, sem vídeo). O usuário achou que pedia rolagem demais: o hero caiu de 640vh para 300vh e de quatro para três faixas (15 giros de rodinha no computador, antes uns 40). As faixas ficam abaixo dos 80vh de platô da skill por escolha do usuário; cada uma segue legível por 4 a 5 giros e nenhuma é pulada em giros de 360px.

| Faixa | Intervalo | No vídeo | Texto | Entrada |
|---|---|---|---|---|
| 1 | 0.00 a 0.34 | camadas flutuando, tampa descendo | "Camada por camada." / "O burger de Coremas, montado na hora, do jeito que tem que ser." | subida por palavra, rampa de carregamento |
| 2 | 0.34 a 0.68 | as camadas se juntam | "Carne na chapa. Cheddar que escorre." / "Bacon crocante, salada fresca e o molho da casa." | deriva para baixo |
| 3 | 0.68 a 1.00 | a tampa pousa e o burger descansa | "Fechou. Bateu a fome?" / "Saiu quente da chapa. Escolhe no cardápio e manda pro nosso zap." / [Montar meu pedido] [Chamar no zap] | soco de palavra, depois subtítulo e botões em etapas |

O vídeo do cheddar (cortado em 6,9 s, antes do corte de cena) comanda o "Segura aí": segurar avança o derretimento, soltar volta.

## 5. Hero estático (movimento reduzido)

O burger completo com o letreiro, mais a faixa 6 inteira.

## 6. Abaixo da dobra

1. **A casa** (foto real com brasas): rótulo "Feito em Coremas". Título "Na chapa, na hora, no capricho." Texto: "A House Burguer é a casa do burger caprichado em Coremas. Pão macio, carne prensada na chapa, cheddar derretendo pelos lados e bacon crocante. Você pede pelo zap e a gente monta o seu, camada por camada." Etiquetas: "Pão selado", "Blend na chapa", "Cheddar cremoso".
2. **Cardápio** (fundo laranja): rótulo "Escolhe e adiciona", aviso "Preços de exemplo". Burgers: House Clássico, Duplo Bacon ("O da foto"), Smash Coremas, Chicken House, Monstro da Casa. Acompanhamentos: Batata da Casa, Onion Rings. Bebidas: Refri lata, Suco natural. (Itens e preços provisórios, trocar pelos reais.)
3. **Momento interativo, "Segura aí."**: "Aperta e segura o botão pra derreter o cheddar." Botão "Segure pra derreter". Ao completar: "Isso. É assim que sai daqui." Etiquetas "Feito na hora", "Cheddar de verdade", "Chega quente". Botão "Quero um desses".
4. **Como pedir**: 1 "Escolhe" / "Monta seu pedido aqui no site em dois minutos." 2 "Manda no zap" / "O pedido vai escrito pro nosso WhatsApp. É só apertar enviar." 3 "Chega quente" / "A gente confirma, prepara na hora e manda pra você."
5. **Dúvidas** (objeções da pesquisa: frio, demora, faltando coisa, sem resposta):
   - "Vocês entregam no meu bairro?" / "Entregamos em Coremas. Manda o endereço no zap e a gente confirma na hora se chega aí."
   - "Chega quente mesmo?" / "A gente só monta o seu quando o pedido entra, e embala bem fechado pra viagem."
   - "E se faltar alguma coisa?" / "O pedido vai escrito no zap, item por item. A gente confere a lista antes de fechar a embalagem."
   - "Como eu pago?" / "Pix, cartão ou dinheiro. Você escolhe no pedido e, se precisar de troco, avisa na observação."
   - "Dá pra tirar ou trocar ingrediente?" / "Dá. Escreve na observação, tipo sem cebola ou molho à parte."
   - "Posso buscar no balcão?" / "Pode. Escolhe Retirada no pedido e a gente avisa quando estiver pronto."
6. **Pedido** (a única chamada para ação): "Bateu a fome?" Campos: Seu nome, Entrega ou Retirada, Endereço, Pagamento (Pix, Cartão, Dinheiro), Observação (placeholder "Sem cebola, troco pra 50, molho à parte"). Botão "Enviar pedido no WhatsApp". Microtexto: "O pedido abre no WhatsApp da House Burguer. Você confere e aperta enviar." Sucesso: "Pedido pronto no seu WhatsApp. Se não abriu, toque aqui." Destino: link wa.me para (83) 9 9633-0716 com a mensagem escrita.
7. **Rodapé**: logo, "House Burguer. Coremas, Paraíba.", WhatsApp, #HouseBurguer. Marca real, sem declaração de ficção. Sem depoimentos inventados.

## 7. Camada vetorial

- O burger do logo em SVG, camada por camada, caindo com o scroll (o elemento assinatura).
- A cúpula do logo se traçando quando a tampa cai.
- Fundo fixo: fileiras de "#HOUSEBURGUER" vazado derivando devagar (90 a 120s), mais grão.
- Brasas subindo em volta da foto; linha que se traça entre os passos; chama tremulando nas dúvidas.

## 8. Engenharia

Loop rAF normalizado por dt que descansa, escritas no DOM por delta, faixas com smoothstep e platôs, divisão de texto com gerador de semente, movimento reduzido ao vivo nas duas direções, entradas por IntersectionObserver com atrasos aposentados, pausa em aba escondida, overflow-x clip.

## 9. Gate de texto

Zero travessões, zero palavras de estoque, varredura de sinais de IA antes de alguém ver.
