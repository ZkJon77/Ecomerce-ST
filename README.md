# Silver Tintas — Next.js

Loja restilizada para bater com a referência visual (header navy,
seção "O que procura?", "Mais Vendidos", "Categoria de Tintas",
banner da loja física, banner de cores e footer com marcas).

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000

### Configuração do Mercado Pago

1. Crie uma conta no Mercado Pago e gere um token de acesso do Checkout Pro.
2. Copie o conteúdo de `.env.example` para `.env.local` e preencha a variável:

```env
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_DO_MERCADO_PAGO
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. O checkout usa a rota `/api/checkout/create-payment` para criar a preferência e redirecionar o usuário para a página de pagamento do Mercado Pago.

### Configuração do Supabase

1. No painel do Supabase, abra **SQL Editor > New query**.
2. Abra [supabase_setup.sql](./supabase_setup.sql), copie todo o conteúdo e execute uma vez. O script cria as tabelas, importa o catálogo de exemplo e configura RLS para permitir leitura pública do catálogo sem permitir escrita pública nos pedidos.
3. Em **Project Settings > API**, copie a Project URL, a chave `anon`/publishable e a chave `service_role`/secret para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SECRETA_DO_SERVIDOR
```

Nunca use a chave `service_role` no navegador nem com prefixo `NEXT_PUBLIC_`. Depois de alterar `.env.local`, reinicie o servidor local.

### Webhook do Mercado Pago

Para confirmar pagamentos automaticamente, configure a URL pública do projeto em:

```text
https://SEU_DOMINIO.com/api/webhooks/payment
```

No Mercado Pago, vincule essa URL em "Webhooks" para receber eventos de pagamento. A rota atualiza o status do pedido quando o Mercado Pago confirma o pagamento.

Em desenvolvimento local, `localhost` não é acessível pelo Mercado Pago. O checkout cria a preferência sem URLs de retorno/webhook; para testar o retorno automático, use um túnel HTTPS público e configure `NEXT_PUBLIC_APP_URL` com essa URL. Em produção, configure essa variável com o domínio HTTPS do site.

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
