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

Para conferir se as variáveis necessárias estão preenchidas sem exibir os valores:

```bash
npm run setup:check
```

O comando verifica o `.env.local` e informa o que ainda falta. Ele não executa SQL nem valida as credenciais diretamente nos serviços.



### Configuração do Supabase

1. Em **Project Settings > API**, copie a Project URL e a chave pública `anon`/publishable para `.env.local`. A variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` aceita a chave pública `sb_publishable_`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

2. Em **Authentication > URL Configuration**, configure:
   - **Site URL** com a URL principal do site (por exemplo, `http://localhost:3000` durante o desenvolvimento).
   - **Redirect URLs** com `http://localhost:3000/login` e a URL de produção terminada em `/login` (por exemplo, `https://seu-dominio.com/login`).
3. Em **Authentication > Providers**, deixe **Email** habilitado. O cadastro envia um link de confirmação para `/login`; o login só funciona depois da confirmação se a confirmação de e-mail estiver habilitada.
4. Reinicie o servidor local depois de salvar o `.env.local`. No Vercel, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis de ambiente de **Production** e faça um novo deploy.
5. Para configurar o banco, os perfis de usuário e os pedidos da loja, abra **SQL Editor > New query** e execute o conteúdo de [supabase_setup.sql](./supabase_setup.sql). O script cria automaticamente um perfil com o nome informado no cadastro, restringe cada usuário ao próprio perfil e também preenche perfis para contas que já existiam. Na Vercel, configure `SUPABASE_URL` (ou `NEXT_PUBLIC_SUPABASE_URL`) e uma chave secreta (`SUPABASE_SECRET_KEY`, preferida, ou `SUPABASE_SERVICE_ROLE_KEY`, legada) somente no servidor. Nunca use a chave secreta com prefixo `NEXT_PUBLIC_`.

Nunca use a chave `service_role` no navegador nem com prefixo `NEXT_PUBLIC_`. A autenticação básica usa Supabase Auth e não exige executar o SQL de catálogo/pedidos.

### Webhook do Mercado Pago

Para confirmar pagamentos automaticamente, configure a URL pública do projeto em:

```text
https://SEU_DOMINIO.com/api/webhooks/payment
```

No Mercado Pago, vincule essa URL em "Webhooks" para receber eventos de pagamento. A rota atualiza o status do pedido quando o Mercado Pago confirma o pagamento.

O checkout valida os preços no servidor e só cria o pagamento depois que o pedido pode ser salvo no Supabase. Em desenvolvimento local, `localhost` não é acessível pelo Mercado Pago. A preferência é criada sem URLs de retorno/webhook; para testar o retorno automático, use um túnel HTTPS público e configure `NEXT_PUBLIC_APP_URL` com essa URL. Em produção, configure essa variável com o domínio HTTPS do site. Configure também `MP_WEBHOOK_SECRET` com a assinatura secreta da configuração de Webhooks do Mercado Pago.

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
