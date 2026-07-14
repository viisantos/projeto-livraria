# Documentação Funcional da Aplicação Livraria

Esta aplicação é uma livraria digital focada em ebooks. O sistema possui backend em Laravel, frontend em React, autenticação por token JWT, controle de perfis com Spatie Permissions, checkout com Stripe, biblioteca digital, leitor PDF, favoritos, carrinho persistido, pedidos e analytics administrativo.

## Visão Geral

A aplicação atende dois perfis principais:

- **Comprador**: navega pelo catálogo, filtra livros, favorita, adiciona ebooks ao carrinho, realiza pagamento, acompanha pedidos, acessa sua biblioteca e lê os ebooks comprados.
- **Admin**: gerencia livros, autores, categorias, usuários e visualiza analytics de ecommerce com exportação para CSV/Excel/Power BI.

## Autenticação e Controle de Acesso

### Cadastro

O usuário pode criar uma conta informando nome, email, senha e confirmação de senha.

Backend:

- `POST /api/register`
- Controller: `UserController@store`

Frontend:

- `src/pages/Register.tsx`

### Login

O login autentica o usuário e retorna token JWT. O frontend salva o token e os dados do usuário no `localStorage`.

Backend:

- `POST /api/login`
- Controller: `AuthController@login`

Frontend:

- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`
- `src/api/axios.ts`

### Logout

O logout invalida a sessão no backend e remove `token` e `user` do `localStorage`.

Backend:

- `POST /api/logout`

Frontend:

- Botão `Sair` na Navbar.

### Sessão atual

Permite consultar o usuário autenticado.

Backend:

- `GET /api/me`

### Atualização e exclusão da própria conta

O comprador pode atualizar ou excluir os próprios dados.

Backend:

- `PUT /api/me`
- `DELETE /api/me`

## Perfis e Permissões

O sistema usa Spatie Permissions.

Perfis principais:

- `admin`
- `comprador`

Rotas administrativas ficam protegidas por middleware `role:admin`.

Frontend:

- `ProtectedRoute`: exige autenticação.
- `AdminRoute`: exige usuário admin.

## Catálogo de Livros

### Listagem de catálogo

O comprador e o admin podem visualizar o catálogo de ebooks.

Backend:

- `GET /api/catalogo`
- `GET /api/livros`
- Controller: `LivroController@index` e `LivroController@catalogo`

Frontend:

- `src/pages/Catalogo.tsx`

### Filtros disponíveis

O catálogo permite filtrar e ordenar livros por:

- busca textual;
- categoria;
- categoria_id;
- autor;
- autor_id;
- preço mínimo;
- preço máximo;
- disponibilidade;
- paginação;
- ordenação.

### Select de categorias no catálogo

Existe uma rota específica para o comprador carregar categorias somente no filtro do catálogo, sem liberar o CRUD administrativo.

Backend:

- `GET /api/catalogo/categorias`
- Controller: `CategoriaController@catalogo`

Frontend:

- `Catalogo.tsx` usa `/catalogo/categorias`.

### Detalhe do livro

O comprador pode ver a página de detalhe de um ebook com título, autor, categoria, descrição, preço, páginas, ISBN, capa e informações adicionais.

Backend:

- `GET /api/catalogo/livros/{livro:slug}`
- `GET /api/livros/{livro}`

Frontend:

- `src/pages/DetalheLivro.tsx`

## Favoritos

O comprador pode salvar livros como favoritos, remover favoritos, listar favoritos e verificar se um livro já está favoritado.

Backend:

- `GET /api/me/favoritos`
- `GET /api/livros/{livro}/favorito`
- `POST /api/livros/{livro}/favoritar`
- `DELETE /api/livros/{livro}/favoritar`
- Controller: `FavoritoController`

Frontend:

- `src/contexts/FavoritesContext.tsx`
- `src/pages/Favoritos.tsx`
- Botões de favorito no catálogo e detalhe do livro.

Comportamento:

- Favoritar o mesmo livro mais de uma vez não duplica registro.
- Favoritos são associados ao usuário autenticado.

## Carrinho

O carrinho foi adaptado para ecommerce de ebooks. Não existe quantidade por item, porque cada ebook é adquirido uma vez por pedido.

### Persistência por usuário

O carrinho persiste no backend e também no `localStorage` separado por usuário:

- chave local: `livraria:carrinho:usuario:{id}`

Isso evita que o carrinho de um usuário apareça para outro usuário no mesmo navegador.

### Endpoints

Backend:

- `GET /api/me/carrinho`
- `POST /api/me/carrinho/sincronizar`
- `DELETE /api/me/carrinho`
- `POST /api/livros/{livro}/carrinho`
- `DELETE /api/livros/{livro}/carrinho`
- Controller: `CarrinhoController`

Frontend:

- `src/contexts/CartContext.tsx`
- `src/pages/Carrinho.tsx`
- contador do carrinho na Navbar.

### Regras

- Carrinho é único por usuário.
- Um mesmo livro não é duplicado.
- Ao atualizar a página, o carrinho permanece.
- Ao deslogar, o carrinho sai da memória da tela, mas permanece salvo para aquele usuário.
- Ao logar novamente, o carrinho local do usuário é sincronizado com o backend.
- Ao concluir pagamento, o carrinho é limpo.

## Checkout e Pagamento

O checkout usa Stripe.

### Intenção de pagamento

Antes de exibir o formulário de cartão, o frontend solicita a criação de uma PaymentIntent.

Backend:

- `POST /api/payment/intent`
- Controller: `PagamentoController@intencaoPagamento`
- Service: `PagamentoService@processarPagamento`

### Formulário de pagamento

Frontend:

- `src/pages/CheckoutPage.tsx`
- `src/pages/CheckoutForm.tsx`

Campos do checkout:

- nome no cartão;
- número do cartão;
- validade;
- CVC;
- país ou região;
- resumo do pedido;
- total;
- estado de processamento;
- mensagem de erro;
- mensagem de sucesso.

Os campos sensíveis do cartão são processados pelo Stripe. O backend recebe apenas:

- `payment_intent_id`;
- `nome_no_cartao`;
- `pais_cartao`.

### Confirmação de pagamento

Depois do Stripe confirmar o pagamento, o frontend chama o backend para confirmar e atualizar o pedido.

Backend:

- `POST /api/payment/confirm`
- Controller: `PagamentoController@confirmarPagamento`

### Status de pagamento

Status padronizados em português:

- `pendente`
- `pago`
- `falha`

### Tratamento de falhas

O sistema trata:

- falha ao criar intenção de pagamento;
- falha ao confirmar pagamento;
- Stripe indisponível;
- pagamento não concluído;
- pedido pendente.

## Webhook Stripe

O backend possui endpoint para receber eventos do Stripe.

Backend:

- `POST /api/stripe/webhook`
- Controller: `StripeWebhookController`

Eventos tratados:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Comportamento:

- pagamento bem-sucedido atualiza pedido para `pago`;
- pagamento falho atualiza pedido para `falha`.

## Pedidos

### Histórico de pedidos

O comprador pode visualizar seus pedidos.

Backend:

- `GET /api/historico-pedidos`
- Controller: `historicoPedidos@historico_pedidos`

Frontend:

- `src/pages/historicoPedidos.tsx`

### Detalhe do pedido

O comprador pode visualizar o detalhe de um pedido específico.

Backend:

- `GET /api/pedidos/{pedido}`

Frontend:

- `src/pages/DetalhePedido.tsx`

Dados exibidos:

- status;
- total;
- data;
- itens;
- preço dos ebooks;
- capa;
- mensagens conforme status.

## Biblioteca Digital

Depois que um pedido é pago, os ebooks comprados aparecem na biblioteca do comprador.

Backend:

- `GET /api/minha-biblioteca`
- Controller: `BibliotecaController@index`

Frontend:

- `src/pages/MinhaBiblioteca.tsx`

Regras:

- mostra apenas ebooks de pedidos pagos;
- não mostra pedidos pendentes ou falhos;
- não mostra livros de outros usuários.

## Leitor de Ebook

O leitor usa PDF.js para renderizar os PDFs.

Backend:

- `GET /api/biblioteca/livros/{livro}/leitura`
- Controller: `BibliotecaController@leitura`

Frontend:

- `src/pages/LeitorEbook.tsx`

Funcionalidades:

- renderização de PDF por página;
- navegação de páginas;
- input para ir a uma página;
- zoom;
- tema claro;
- tema sépia;
- tema escuro;
- largura de área;
- marcador de página;
- destaques;
- anotações;
- cores de destaque;
- arraste do PDF com cursor de mão;
- seleção de texto preservada para destaques.

## Marcações do Ebook

As marcações são salvas no banco por usuário e livro.

Backend:

- `GET /api/biblioteca/livros/{livro}/marcacoes`
- `POST /api/biblioteca/livros/{livro}/marcacoes`
- `DELETE /api/biblioteca/marcacoes/{marcacao}`
- Controller: `EbookMarcacaoController`
- Model: `EbookMarcacao`

Tipos:

- `marcador`
- `nota`
- `destaque`

Regras:

- usuário só pode marcar livros que comprou;
- usuário só pode remover as próprias marcações;
- destaques armazenam retângulos relativos à página renderizada.

## Administração de Livros

O admin pode gerenciar livros.

Backend:

- `POST /api/livros`
- `PUT /api/livros/{livro}`
- `DELETE /api/livros/{livro}`
- Controller: `LivroController`

Frontend:

- `src/pages/Admin/Livros.tsx`
- `src/pages/Admin/NovoLivro.tsx`
- `src/pages/Admin/EditarLivro.tsx`

Campos principais:

- título;
- slug;
- descrição;
- ISBN;
- número de páginas;
- publicação;
- URL da capa;
- sobre;
- autor;
- categoria;
- preço;
- arquivo do ebook;
- formato do ebook.

Observação:

- estoque e quantidade foram removidos por se tratar de uma livraria apenas de ebooks.

## Administração de Autores

O admin pode listar, criar, editar e excluir autores.

Backend:

- `Route::apiResource('autores', AutorController::class)`

Frontend:

- `src/pages/Admin/Autores.tsx`
- `src/pages/Admin/NovoAutor.tsx`
- `src/pages/Admin/EditarAutor.tsx`

Campos:

- nome;
- sobre.

## Administração de Categorias

O admin pode listar, criar, editar e excluir categorias.

Backend:

- `Route::apiResource('categorias', CategoriaController::class)`

Frontend:

- `src/pages/Admin/Categorias.tsx`
- `src/pages/Admin/NovaCategoria.tsx`
- `src/pages/Admin/EditarCategoria.tsx`

Campos:

- nome;
- slug.

Observação:

- compradores podem apenas listar categorias via `/api/catalogo/categorias` para uso no filtro do catálogo.

## Administração de Usuários

O admin pode listar, criar, editar e excluir usuários.

Backend:

- `Route::apiResource('usuarios', UserController::class)`

Frontend:

- `src/pages/Admin/Usuarios.tsx`
- `src/pages/Admin/NovoUsuario.tsx`
- `src/pages/Admin/EditarUsuario.tsx`

Campos:

- nome;
- email;
- perfil;
- senha, quando aplicável.

## Analytics Administrativo

O admin possui dashboard de métricas de ecommerce.

Backend:

- `GET /api/admin/analytics`
- `GET /api/admin/analytics/exportar/pedidos`
- `GET /api/admin/analytics/exportar/itens`
- Controller: `AnalyticsController`

Frontend:

- `src/pages/Admin/Analytics.tsx`
- rota: `/admin/analytics`

Métricas:

- receita;
- pedidos pagos;
- ticket médio;
- itens vendidos;
- clientes pagantes;
- taxa de recompra;
- pedidos pendentes;
- pagamentos com falha;
- receita por período;
- status dos pedidos;
- livros mais vendidos;
- receita por categoria;
- clientes mais valiosos;
- pedidos recentes.

Filtros:

- data inicial;
- data final.

Gráficos:

- linha de receita;
- barras de pedidos;
- barras horizontais para rankings e categorias;
- lista de status.

## Exportações para Excel e Power BI

O analytics exporta arquivos CSV compatíveis com Excel e Power BI.

Arquivos:

- `analytics-pedidos-{inicio}-{fim}.csv`
- `analytics-itens-{inicio}-{fim}.csv`

### Pedidos CSV

Uma linha por pedido.

Colunas:

- pedido_id;
- data;
- cliente_id;
- cliente_nome;
- cliente_email;
- status;
- total;
- itens.

### Itens CSV

Uma linha por item vendido.

Colunas:

- pedido_id;
- data;
- status;
- cliente_id;
- cliente_email;
- livro_id;
- livro_titulo;
- categoria;
- autor;
- preço.

Uso recomendado:

- Excel: importar CSV para tabelas dinâmicas, gráficos, segmentações e medidas.
- Power BI: usar `itens.csv` como tabela fato principal de vendas e `pedidos.csv` como tabela complementar.

## Seeds e Dados de Demonstração

### Seeds principais

O `DatabaseSeeder` chama:

- `RolesAndPermissionsSeeder`
- `UserSeeder`
- `AutorSeeder`
- `CategoriaSeeder`
- `LivroSeeder`
- `LivrosCatalogoAtualSeeder`
- `AnalyticsPedidosSeeder`
- `LivroUserSeeder`

### Seed de livros atuais

Arquivo:

- `database/seeders/LivrosCatalogoAtualSeeder.php`

Livros inseridos:

- 1984;
- Obediência e intimidade: O segredo para uma vida plena com Deus;
- Felicidade clandestina: Edição comemorativa;
- Clean code;
- A biblioteca da Meia Noite;
- Deuses falsos;
- O Deus que destroi sonhos.

### Seed de analytics

Arquivo:

- `database/seeders/AnalyticsPedidosSeeder.php`

Gera:

- 10.000 usuários sintéticos;
- 10.000 pedidos;
- pedidos com 1 a 3 livros;
- status variados entre `pago`, `pendente` e `falha`;
- datas distribuídas no último ano.

Comando para recriar tudo:

```bash
php artisan migrate:fresh --seed
```

## Testes Automatizados

Testes relevantes adicionados:

- `tests/Feature/CarrinhoTest.php`
- `tests/Feature/FavoritoTest.php`
- `tests/Feature/BibliotecaTest.php`
- `tests/Feature/PagamentoTest.php`
- `tests/Feature/PedidoTest.php`
- `tests/Feature/AnalyticsTest.php`
- `tests/Feature/CategoriaCatalogoTest.php`

Comandos úteis:

```bash
php artisan test
php artisan test tests/Feature/CarrinhoTest.php
php artisan test tests/Feature/AnalyticsTest.php
php artisan test tests/Feature/CategoriaCatalogoTest.php
```

## Frontend

Principais tecnologias:

- React;
- TypeScript;
- Bootstrap;
- React Router;
- Axios;
- Stripe React;
- PDF.js;
- React Icons.

Principais contextos:

- `AuthContext`: autenticação e usuário logado;
- `CartContext`: carrinho persistido por usuário;
- `FavoritesContext`: favoritos.

Principais páginas públicas/autenticadas:

- Login;
- Cadastro;
- Catálogo;
- Detalhe do livro;
- Favoritos;
- Carrinho;
- Checkout;
- Histórico de pedidos;
- Detalhe do pedido;
- Minha biblioteca;
- Leitor de ebook.

Principais páginas admin:

- Livros;
- Novo livro;
- Editar livro;
- Autores;
- Novo autor;
- Editar autor;
- Categorias;
- Nova categoria;
- Editar categoria;
- Usuários;
- Novo usuário;
- Editar usuário;
- Analytics.

## Backend

Principais tecnologias:

- Laravel;
- PostgreSQL;
- JWT Auth;
- Spatie Permissions;
- Stripe PHP;
- Eloquent Resources;
- Migrations e seeders.

Principais models:

- `User`;
- `Livro`;
- `Autor`;
- `Categoria`;
- `Pedido`;
- `PedidoItems`;
- `EbookMarcacao`.

Principais services:

- `PagamentoService`;
- services de entidades administrativas, como livros, autores, categorias e usuários.

## Observações de Deploy

Esta aplicação possui duas partes:

- frontend React;
- backend Laravel com banco de dados, storage de ebooks e integração Stripe.

O frontend pode ser publicado como site estático depois de `npm run build`, desde que a variável de API aponte para o backend em produção.

O backend precisa de um ambiente com:

- PHP compatível com Laravel;
- Composer;
- PostgreSQL;
- storage persistente para arquivos de ebook;
- variáveis de ambiente;
- chave da aplicação;
- configuração de JWT;
- chaves Stripe;
- endpoint público para webhook Stripe;
- servidor web como Nginx/Apache ou plataforma Laravel-ready.

## Checklist de Deploy

### Backend

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan storage:link
```

Variáveis obrigatórias:

- `APP_KEY`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`

### Frontend

```bash
npm install
npm run build
```

Variáveis importantes:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- URL base da API no Axios ou variável equivalente.

## Limitações e Melhorias Futuras

Melhorias recomendadas:

- exportação XLSX real além de CSV;
- modelo estrela completo para Power BI com tabelas `clientes`, `livros`, `categorias`, `autores`, `pedidos` e `itens`;
- métricas de conversão por funil;
- abandono de carrinho;
- margem/lucro por ebook;
- custo por aquisição;
- relatórios agendados;
- dashboard com biblioteca gráfica dedicada;
- auditoria de ações administrativas;
- logs estruturados;
- testes e2e no frontend.
