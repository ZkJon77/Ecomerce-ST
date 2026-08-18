# Silver Tintas — Next.js

Loja restilizada para bater com a referência visual (header navy,
seção "O que procura?", "Mais Vendidos", "Categoria de Tintas",
banner da loja física, banner de cores e footer com marcas).

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Deploy no Vercel

### Opção A — CLI (mais rápido)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Rode o comando `vercel --prod` de dentro da pasta do projeto. Ele
detecta o framework automaticamente (Next.js), builda e te dá uma
URL pública `https://seu-projeto.vercel.app` em poucos minutos.

### Opção B — Dashboard (com Git)

1. Suba esta pasta para um repositório no GitHub/GitLab/Bitbucket.
2. Em https://vercel.com/new, importe o repositório.
3. O Vercel detecta "Next.js" automaticamente — não precisa mudar
   nada nas configurações de build.
4. Clique em "Deploy".

## O que mudou nesta rodada

- Header: removida a pill "Cor" e a barra de abas fixa; navegação
  agora fica dentro do menu hambúrguer (Início, Produtos, Kits,
  Calculadora, Simulador, Consultar Cor, Entrega).
- "O que procura?": ícones trocados de emoji para ícones de linha
  (lucide-react), quadrado cinza-azulado como na referência.
- Seção de destaques renomeada para "Mais Vendidos", com preço e
  estrelas na mesma linha do card.
- Nova seção "Categoria de Tintas" com chips em grade 2×3 (a
  primeira ativa, como no print).
- Banner "conheça nossa loja física" agora tem título fora do card
  e mostra o horário de funcionamento completo.
- Banner de cores redesenhado: roda de cores + moldura de foto,
  pill "busque seu tom" no canto superior direito, barra inferior
  com frase em itálico e seta.
- Footer reorganizado em layout horizontal (logo + tagline + redes
  sociais à esquerda, colunas de links à direita), tagline ajustada
  para "Qualidade que pinta confiança."
- Removidas as seções que não apareciam na referência (tira de
  ícones "Calculadora/Simulador/Kits/Entrega" logo abaixo do hero,
  e "Dicas dos especialistas").

## Build validado

`npm run build` compila sem erros de tipo, lint ou build (testado
neste ambiente — apenas o carregamento das fontes Google via
`next/font` precisa de acesso à internet, que existe normalmente
em produção/Vercel).
