<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivrosCatalogoAtualSeeder extends Seeder
{
    public function run(): void
    {
        $agora = now();

        foreach ($this->categorias() as $categoria) {
            DB::table('categorias')->updateOrInsert(
                ['id' => $categoria['id']],
                [
                    ...$categoria,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]
            );
        }

        foreach ($this->autores() as $autor) {
            DB::table('autores')->updateOrInsert(
                ['id' => $autor['id']],
                [
                    ...$autor,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]
            );
        }

        foreach ($this->livros() as $livro) {
            DB::table('livros')->updateOrInsert(
                ['id' => $livro['id']],
                [
                    ...$livro,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ]
            );
        }
    }

    private function categorias(): array
    {
        return [
            ['id' => 7, 'nome' => 'Religião', 'slug' => 'religiao'],
            ['id' => 8, 'nome' => 'Ficção', 'slug' => 'ficcao'],
            ['id' => 9, 'nome' => 'Contos', 'slug' => 'contos'],
        ];
    }

    private function autores(): array
    {
        return [
            [
                'id' => 11,
                'nome' => 'Rodrigo Bibo',
                'sobre' => <<<'TXT'
Rodrigo Bibo de Aquino, 38, é casado com a Alexandra, pai da Milena e do Kalel. Atua como produtor e diretor do Bibotalk, um portal de podcasts cristãos, que inclui o BTCast, o maior podcast de teologia e bíblia do Brasil. É graduado em Teologia pela Faculdade Luterana de Teologia e Mestre em Teologia pela Faculdades Batista do Paraná.
TXT,
            ],
            [
                'id' => 12,
                'nome' => 'Timothy Keller',
                'sobre' => <<<'TXT'
TIMOTHY KELLER. Nasceu e cresceu na Pensilvânia e estudou na Bucknell University, no Gordon-Conwell Theological Seminary e no Westminster Theological Seminary. Por muitos anos, foi pastor da Redeemer Presbyterian Church, em Manhattan, igreja que fundou em 1989 com a esposa, Kathy, e seus três filhos. É autor best-seller do New York Times e escreveu vários livros, entre eles A fé na era do ceticismo, Deus na era secular, Deuses falsos, Ministérios de misericórdia, Oração e outros publicados por Vida Nova.
TXT,
            ],
            [
                'id' => 13,
                'nome' => 'Matt Haig',
                'sobre' => <<<'TXT'
Matt Haig é o autor best-seller internacional de Razões para continuar vivo - a obra autobiográfica que permaneceu na lista dos dez mais vendidos da Inglaterra por 46 semanas seguidas - , Observações sobre um planeta nervoso e seis romances para adultos, incluindo A possessão do Sr. Cave , Como parar o tempo , Os humanos , Os Radley e Sociedade dos pais mortos . Matt também escreve livros premiados para crianças e adolescentes, incluindo Floresta sombria e Um menino chamado Natal , que está sendo adaptado para o cinema. Vencedor do Prêmio Goodreads de Ficção de 2020, A biblioteca da meia-noite é seu romance mais recente e já vendeu mais de 2 milhões de exemplares no mundo todo. Seus livros já foram traduzidos para mais de 40 idiomas e venderam mais de 3 milhões de exemplares em todo o mundo. Matt está no Twitter, no instagram, no Facebook, reunindo mais de 1 milhão de seguidores.
TXT,
            ],
            [
                'id' => 14,
                'nome' => 'Robert C. Martin',
                'sobre' => <<<'TXT'
Robert Cecil Martin (conhecido popularmente como Uncle Bob) é um engenheiro de software e autor americano. Ele é um dos autores do Manifesto Ágil.
TXT,
            ],
            [
                'id' => 15,
                'nome' => 'Clarice Lispector',
                'sobre' => <<<'TXT'
Uma escritora decidida a desvendar as profundezas da alma. Essa é Clarice Lispector, que escolheu a literatura como bússola em sua busca pela essência humana. Sua tentativa de transcender o cotidiano revela-se em personagens na iminência de um milagre, uma explosão ou uma singela descoberta. Todos suscetíveis aos acontecimentos do dia a dia.

Vidas que se perdem e se encontram em labirintos formados por uma linguagem única, meticulosamente estruturada. E é por essa linguagem que Clarice Lispector constrói uma obra de caráter tão profundo quanto universal.
TXT,
            ],
            [
                'id' => 16,
                'nome' => 'Devi Titus',
                'sobre' => <<<'TXT'
Devi Titus, casada com Larry Titus há mais de 50 anos, está entre as mais reconhecidas conferencistas e escritoras cristãs da América do Norte. É comunicadora premiada pela Washington Press Women's Association e fala para centenas de milhares de pessoas todos os anos. A paixão de Devi é restaurar a dignidade e santidade do lar e ajudar homens e mulheres a viverem uma vida com propósito. Como parceiros no ministério, ela e Larry fundaram a organização internacional Kingdom Global Ministries, que visa facilitar a missão de outros ministérios ao redor do mundo. Líder de líderes, tem servido em conselhos e diversas organizações. Devi é também a fundadora da chamada Mansão Mentorial e, através desse programa, já recebeu mais de mil mulheres para se hospedarem "em sua casa" por quatro dias, a fim de ensiná-las princípios bíblicos e práticos acerca do lar. Mãe de um casal de filhos, tem seis netos e sete bisnetos. Reside em Dallas/Fort Worth - Texas (EUA) e viaja por todo o mundo para ministrar.
TXT,
            ],
            [
                'id' => 17,
                'nome' => 'George Orwell',
                'sobre' => <<<'TXT'
George Orwell nasceu Eric Arthur Blair em 25 de junho de 1903, em Bengala, Índia, onde seu pai trabalhava para o Departamento de Ópio do Serviço Público Indiano da Grã-Bretanha; estudou em instituições de elite e foi ele próprio durante cinco anos agente da polícia imperial na Birmânia; viveu com os miseráveis de Paris e Londres no final dos anos 1920; lutou pela causa republicana na Guerra Civil Espanhola ao lado de uma milícia minoritária de inspiração anarquista e trotskista, quando levou um tiro na garganta que quase lhe tirou a vida.

Morreu de tuberculose em 21 de janeiro de 1950, um ano depois de concluir 1984. Tinha apenas 46 anos.
TXT,
            ],
        ];
    }

    private function livros(): array
    {
        return [
            [
                'id' => 11,
                'categoria_id' => 7,
                'autor_id' => 11,
                'titulo' => 'O Deus que destroi sonhos',
                'slug' => 'o-deus-que-destroi-sonhos',
                'descricao' => <<<'TXT'
O Deus cristão não pode ser domesticado.

Uma tentação constante que cerca a vida cristã é a inversão do chamado: a presunção de que Deus precisa abençoar nosso caminho e seguir nossos planos e sonhos. Essa postura é enganosa e faz parecer que Deus só é fiel quando nos abençoa. Mas e se Deus derrubar o nosso sorvete, ele deixa de ser fiel? Claro que não! Ele continua sendo um Pai sábio e um Deus misericordioso mesmo em meio às nossas frustrações. Às vezes, ele só quer chamar nossa atenção para o caminho certo. Você já deve ter testemunhado gente adulta se comportando como criança por não ter a vida que pediu a Deus. É porque pediu errado!

Neste livro, Rodrigo Bibo, do podcast Bibotalk, apresenta o caminho do discipulado, o meio para “sonhar” o que Deus já planejou. Aprenda a enxergar e seguir a vontade soberana de Deus expressa em Sua Palavra, tendo uma vida de serviço dedicada a Cristo.
TXT,
                'isbn' => '978-6556891859',
                'numero_paginas' => 160,
                'publicacao' => '2021-04-30',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/91VxtptiBgL._SY466_.jpg',
                'sobre' => <<<'TXT'
O Deus cristão não pode ser domesticado.

Uma tentação constante que cerca a vida cristã é a inversão do chamado: a presunção de que Deus precisa abençoar nosso caminho e seguir nossos planos e sonhos. Essa postura é enganosa e faz parecer que Deus só é fiel quando nos abençoa. Mas e se Deus derrubar o nosso sorvete, ele deixa de ser fiel? Claro que não! Ele continua sendo um Pai sábio e um Deus misericordioso mesmo em meio às nossas frustrações. Às vezes, ele só quer chamar nossa atenção para o caminho certo. Você já deve ter testemunhado gente adulta se comportando como criança por não ter a vida que pediu a Deus. É porque pediu errado!

Neste livro, Rodrigo Bibo, do podcast Bibotalk, apresenta o caminho do discipulado, o meio para “sonhar” o que Deus já planejou. Aprenda a enxergar e seguir a vontade soberana de Deus expressa em Sua Palavra, tendo uma vida de serviço dedicada a Cristo.
TXT,
                'preco' => 30.67,
                'arquivo_ebook' => 'ebooks/ZfppCg1UXBtrMH9JYZgUYlALMyEYc5GDZISghe8a.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 12,
                'categoria_id' => 7,
                'autor_id' => 12,
                'titulo' => 'Deuses falsos',
                'slug' => 'deuses-falsos',
                'descricao' => <<<'TXT'
Sucesso, dinheiro, amor verdadeiro ― a vida perfeita. Muitos de nós depositam a fé e a esperança nessas coisas, acreditando que sejam capazes de trazer a felicidade. No fundo, porém, sabemos que nada disso pode garantir satisfação plena. Por isso não é de surpreender que nos sintamos perdidos, solitários, desencantados e ressentidos. Só o Deus verdadeiro pode satisfazer totalmente nossos desejos, e este é o momento perfeito para encontrá-lo novamente... ou, quem sabe, pela primeira vez.

Em Deuses falsos, Timothy Keller mostra que uma compreensão adequada da Bíblia revela a verdade acerca da sociedade e de nosso próprio coração. Nessa mensagem poderosa, enxergamos nossa tendência de buscar em outras coisas aquilo que só Deus pode nos dar. Também somos apresentados a um novo caminho: aquele que leva a uma esperança que não pode ser abalada pelas circunstâncias da vida.
TXT,
                'isbn' => '978-8527508797',
                'numero_paginas' => 192,
                'publicacao' => '2018-01-01',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/61QrjM65syL._SY466_.jpg',
                'sobre' => <<<'TXT'
Sucesso, dinheiro, amor verdadeiro ― a vida perfeita. Muitos de nós depositam a fé e a esperança nessas coisas, acreditando que sejam capazes de trazer a felicidade. No fundo, porém, sabemos que nada disso pode garantir satisfação plena. Por isso não é de surpreender que nos sintamos perdidos, solitários, desencantados e ressentidos. Só o Deus verdadeiro pode satisfazer totalmente nossos desejos, e este é o momento perfeito para encontrá-lo novamente... ou, quem sabe, pela primeira vez.

Em Deuses falsos, Timothy Keller mostra que uma compreensão adequada da Bíblia revela a verdade acerca da sociedade e de nosso próprio coração. Nessa mensagem poderosa, enxergamos nossa tendência de buscar em outras coisas aquilo que só Deus pode nos dar. Também somos apresentados a um novo caminho: aquele que leva a uma esperança que não pode ser abalada pelas circunstâncias da vida.
TXT,
                'preco' => 61.90,
                'arquivo_ebook' => 'ebooks/ZyhNxKumgA1AZ0DyjrqbsDUJ4mS64OvyY3fiXjB1.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 13,
                'categoria_id' => 8,
                'autor_id' => 13,
                'titulo' => 'A biblioteca da Meia Noite',
                'slug' => 'a-biblioteca-da-meia-noite',
                'descricao' => <<<'TXT'
Aos 35 anos, Nora Seed é uma mulher cheia de talentos e poucas conquistas. Arrependida das escolhas que fez no passado, ela vive se perguntando o que poderia ter acontecido caso tivesse vivido de maneira diferente. Após ser demitida e seu gato ser atropelado, Nora vê pouco sentido em sua existência e decide colocar um ponto final em tudo. Porém, quando se vê na Biblioteca da Meia-Noite, Nora ganha uma oportunidade única de viver todas as vidas que poderia ter vivido.

Neste lugar entre a vida e a morte, e graças à ajuda de uma velha amiga, Nora pode, finalmente, se mudar para a Austrália, reatar relacionamentos antigos – ou começar outros –, ser uma estrela do rock, uma glaciologista, uma nadadora olímpica... enfim, as opções são infinitas. Mas será que alguma dessas outras vidas é realmente melhor do que a que ela já tem?

Em A Biblioteca da Meia-Noite , Nora Seed se vê exatamente na situação pela qual todos gostaríamos de poder passar: voltar no tempo e desfazer algo de que nos arrependemos. Diante dessa possibilidade, Nora faz um mergulho interior viajando pelos livros da Biblioteca da Meia-Noite até entender o que é verdadeiramente importante na vida e o que faz, de fato, com que ela valha a pena ser vivida.
TXT,
                'isbn' => '978-6558380542',
                'numero_paginas' => 308,
                'publicacao' => '2021-09-27',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/81iqH8dpjuL._SY425_.jpg',
                'sobre' => <<<'TXT'
Aos 35 anos, Nora Seed é uma mulher cheia de talentos e poucas conquistas. Arrependida das escolhas que fez no passado, ela vive se perguntando o que poderia ter acontecido caso tivesse vivido de maneira diferente. Após ser demitida e seu gato ser atropelado, Nora vê pouco sentido em sua existência e decide colocar um ponto final em tudo. Porém, quando se vê na Biblioteca da Meia-Noite, Nora ganha uma oportunidade única de viver todas as vidas que poderia ter vivido.

Neste lugar entre a vida e a morte, e graças à ajuda de uma velha amiga, Nora pode, finalmente, se mudar para a Austrália, reatar relacionamentos antigos – ou começar outros –, ser uma estrela do rock, uma glaciologista, uma nadadora olímpica... enfim, as opções são infinitas. Mas será que alguma dessas outras vidas é realmente melhor do que a que ela já tem?

Em A Biblioteca da Meia-Noite , Nora Seed se vê exatamente na situação pela qual todos gostaríamos de poder passar: voltar no tempo e desfazer algo de que nos arrependemos. Diante dessa possibilidade, Nora faz um mergulho interior viajando pelos livros da Biblioteca da Meia-Noite até entender o que é verdadeiramente importante na vida e o que faz, de fato, com que ela valha a pena ser vivida.
TXT,
                'preco' => 32.33,
                'arquivo_ebook' => 'ebooks/BTJoBui3DIeKDfrhTk31ZVhLNnrTIVN4wbPaEvKa.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 14,
                'categoria_id' => 1,
                'autor_id' => 14,
                'titulo' => 'Clean code',
                'slug' => 'clean-code',
                'descricao' => <<<'TXT'
Mesmo um código ruim pode funcionar. Mas se ele não for limpo, pode acabar com uma empresa de desenvolvimento. Perdem-se a cada ano horas incontáveis e recursos importantes devido a um código mal escrito. Mas não precisa ser assim.

O renomado especialista em software, Robert C. Martin, apresenta um paradigma revolucionário com Código limpo: Habilidades Práticas do Agile Software. Martin se reuniu com seus colegas do Mentor Object para destilar suas melhores e mais ágeis práticas de limpar códigos “dinamicamente” em um livro que introduzirá gradualmente dentro de você os valores da habilidade de um profissional de softwares e lhe tornar um programador melhor –mas só se você praticar.

Que tipo de trabalho você fará? Você lerá códigos aqui, muitos códigos. E você deverá descobrir o que está correto e errado nos códigos. E, o mais importante, você terá de reavaliar seus valores profissionais e seu comprometimento com o seu ofício.

Código limpo está divido em três partes. Na primeira há diversos capítulos que descrevem os princípios, padrões e práticas para criar um código limpo.

A segunda parte consiste em diversos casos de estudo de complexidade cada vez maior. Cada um é um exercício para limpar um código – transformar o código base que possui alguns problemas em um melhor e eficiente. A terceira parte é a compensação: um único capítulo com uma lista de heurísticas e “odores” reunidos durante a criação dos estudos de caso. O resultado será um conhecimento base que descreve a forma como pensamos quando criamos, lemos e limpamos um código.

Após ler este livro os leitores saberão:

- Como distinguir um código bom de um ruim
- Como escrever códigos bons e como transformar um ruim em um bom
- Como criar bons nomes, boas funções, bons objetos e boas classes
- Como formatar o código para ter uma legibilidade máxima
- Como implementar completamente o tratamento de erro sem obscurecer a lógica
- Como aplicar testes de unidade e praticar o desenvolvimento dirigido a testes

Este livro é essencial para qualquer desenvolvedor, engenheiro de software, gerente de projeto, líder de equipes ou analistas de sistemas com interesse em construir códigos melhores.
TXT,
                'isbn' => '978-8576082675',
                'numero_paginas' => 425,
                'publicacao' => '2009-09-08',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/71QknS5fW4L._SY425_.jpg',
                'sobre' => <<<'TXT'
Mesmo um código ruim pode funcionar. Mas se ele não for limpo, pode acabar com uma empresa de desenvolvimento. Perdem-se a cada ano horas incontáveis e recursos importantes devido a um código mal escrito. Mas não precisa ser assim.

O renomado especialista em software, Robert C. Martin, apresenta um paradigma revolucionário com Código limpo: Habilidades Práticas do Agile Software. Martin se reuniu com seus colegas do Mentor Object para destilar suas melhores e mais ágeis práticas de limpar códigos “dinamicamente” em um livro que introduzirá gradualmente dentro de você os valores da habilidade de um profissional de softwares e lhe tornar um programador melhor –mas só se você praticar.

Que tipo de trabalho você fará? Você lerá códigos aqui, muitos códigos. E você deverá descobrir o que está correto e errado nos códigos. E, o mais importante, você terá de reavaliar seus valores profissionais e seu comprometimento com o seu ofício.

Código limpo está divido em três partes. Na primeira há diversos capítulos que descrevem os princípios, padrões e práticas para criar um código limpo.

A segunda parte consiste em diversos casos de estudo de complexidade cada vez maior. Cada um é um exercício para limpar um código – transformar o código base que possui alguns problemas em um melhor e eficiente. A terceira parte é a compensação: um único capítulo com uma lista de heurísticas e “odores” reunidos durante a criação dos estudos de caso. O resultado será um conhecimento base que descreve a forma como pensamos quando criamos, lemos e limpamos um código.

Após ler este livro os leitores saberão:

- Como distinguir um código bom de um ruim
- Como escrever códigos bons e como transformar um ruim em um bom
- Como criar bons nomes, boas funções, bons objetos e boas classes
- Como formatar o código para ter uma legibilidade máxima
- Como implementar completamente o tratamento de erro sem obscurecer a lógica
- Como aplicar testes de unidade e praticar o desenvolvimento dirigido a testes

Este livro é essencial para qualquer desenvolvedor, engenheiro de software, gerente de projeto, líder de equipes ou analistas de sistemas com interesse em construir códigos melhores.
TXT,
                'preco' => 73.06,
                'arquivo_ebook' => 'ebooks/Yry3hdkeNk4Cfv0k3Jc1ZCM6polTksFPkulw4aye.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 15,
                'categoria_id' => 9,
                'autor_id' => 15,
                'titulo' => 'Felicidade clandestina: Edição comemorativa',
                'slug' => 'felicidade-clandestina-edicao-comemorativa',
                'descricao' => <<<'TXT'
Desde o início, Clarice Lispector recusou a escravidão dos gêneros. Escrevia por fragmentos que depois montava. Escrevia aos arrancos, transcrevendo um ditado interior. As estruturas clássicas não faziam parte desse ditado. Seu olhar passava por cima das regras, quase voraz em sua busca da essência. Este livro bem o demonstra. É composto por contos escritos em épocas diversas da vida de Clarice. E por não contos. Muitos deles – como "Felicidade clandestina", que dá título ao livro – foram publicados no Caderno B do Jornal do Brasil. Como crônicas. Que também não eram crônicas. Convidada em 1967 para escrever no JB, Clarice deparou-se com um fazer literário novo. Logo negou os padrões vigentes: "Vamos falar a verdade: isto aqui não é crônica coisa nenhuma. Isto é apenas. Não entra em gêneros. Gêneros não me interessam mais."E "isto" era a mais pura e rica literatura. Nos contos / crônicas / textos – que eu, como subeditora do Caderno recebia semanalmente, Clarice se expunha em recordações familiares e de infância. Sua irmã Tania ainda se lembra da menina, filha de livreiro, que encontramos em "Felicidade clandestina", atormentando Clarice por conta do empréstimo de um livro. O professor de "Os desastres de Sofia" realmente percebeu o tesouro que Clarice menina escondia. E "Come, meu filho" é um claro diálogo entre a autora e seu filho. Nada diferencia esses contos, escritos para serem crônicas, de outros contos que aqui estão, escritos para serem contos e publicados anteriormente no livro A legião estrangeira. Seus textos podem ser desmontados, desfeitos em pedaços – até mesmo diferentes dos fragmentos originais – sem que se perca sua intensidade. Cada palavra ou frase dessa escritora sem igual origina-se em camadas tão fundas do ser, que traz consigo, mais do que um testemunho, a própria voltagem da vida. ― MARINA COLASANTI, Jornalista e escritora. Prêmio Jabuti para Eu sei, mas não devia e Rota de colisão.
TXT,
                'isbn' => '978-8532531735',
                'numero_paginas' => 160,
                'publicacao' => '2020-03-10',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/711lRhyTjIL._SY466_.jpg',
                'sobre' => <<<'TXT'
Desde o início, Clarice Lispector recusou a escravidão dos gêneros. Escrevia por fragmentos que depois montava. Escrevia aos arrancos, transcrevendo um ditado interior. As estruturas clássicas não faziam parte desse ditado. Seu olhar passava por cima das regras, quase voraz em sua busca da essência. Este livro bem o demonstra. É composto por contos escritos em épocas diversas da vida de Clarice. E por não contos. Muitos deles – como "Felicidade clandestina", que dá título ao livro – foram publicados no Caderno B do Jornal do Brasil. Como crônicas. Que também não eram crônicas. Convidada em 1967 para escrever no JB, Clarice deparou-se com um fazer literário novo. Logo negou os padrões vigentes: "Vamos falar a verdade: isto aqui não é crônica coisa nenhuma. Isto é apenas. Não entra em gêneros. Gêneros não me interessam mais."E "isto" era a mais pura e rica literatura. Nos contos / crônicas / textos – que eu, como subeditora do Caderno recebia semanalmente, Clarice se expunha em recordações familiares e de infância. Sua irmã Tania ainda se lembra da menina, filha de livreiro, que encontramos em "Felicidade clandestina", atormentando Clarice por conta do empréstimo de um livro. O professor de "Os desastres de Sofia" realmente percebeu o tesouro que Clarice menina escondia. E "Come, meu filho" é um claro diálogo entre a autora e seu filho. Nada diferencia esses contos, escritos para serem crônicas, de outros contos que aqui estão, escritos para serem contos e publicados anteriormente no livro A legião estrangeira. Seus textos podem ser desmontados, desfeitos em pedaços – até mesmo diferentes dos fragmentos originais – sem que se perca sua intensidade. Cada palavra ou frase dessa escritora sem igual origina-se em camadas tão fundas do ser, que traz consigo, mais do que um testemunho, a própria voltagem da vida. ― MARINA COLASANTI, Jornalista e escritora. Prêmio Jabuti para Eu sei, mas não devia e Rota de colisão.
TXT,
                'preco' => 36.48,
                'arquivo_ebook' => 'ebooks/vhBXbk5k22vaJRJp1m9UD2svrBunwW0JL7bYkZug.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 16,
                'categoria_id' => 7,
                'autor_id' => 16,
                'titulo' => 'Obediência e intimidade: O segredo para uma vida plena com Deus',
                'slug' => 'obediencia-e-intimidade-o-segredo-para-uma-vida-plena-com-deus',
                'descricao' => <<<'TXT'
"Obediência e intimidade" fala diretamente a quem busca alcançar uma vida plena como Jesus prometeu. E o caminho para viver segundo o coração de Deus passa, impreterivelmente, pela obediência à vontade do Criador.

À medida que lhe obedecemos, como consequência natural do amor que temos por ele, passo a passo crescemos em intimidade com Deus e experimentamos um relacionamento único.
TXT,
                'isbn' => '978-8543301686',
                'numero_paginas' => 110,
                'publicacao' => '2016-08-19',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/81OB1dUgHqL._SY466_.jpg',
                'sobre' => <<<'TXT'
"Obediência e intimidade" fala diretamente a quem busca alcançar uma vida plena como Jesus prometeu. E o caminho para viver segundo o coração de Deus passa, impreterivelmente, pela obediência à vontade do Criador.

À medida que lhe obedecemos, como consequência natural do amor que temos por ele, passo a passo crescemos em intimidade com Deus e experimentamos um relacionamento único.
TXT,
                'preco' => 36.48,
                'arquivo_ebook' => 'ebooks/n583WRtOSsJZDZdo9ueikDLdlVMvkMDo4TYSPBVT.pdf',
                'formato_ebook' => 'pdf',
            ],
            [
                'id' => 17,
                'categoria_id' => 8,
                'autor_id' => 17,
                'titulo' => '1984',
                'slug' => '1984',
                'descricao' => <<<'TXT'
Publicada originalmente em 1949, a distopia futurista 1984 é um dos romances mais influentes do século XX, um inquestionável clássico moderno. Lançada poucos meses antes da morte do autor, é uma obra magistral que ainda se impõe como uma poderosa reflexão ficcional sobre a essência nefasta de qualquer forma de poder totalitário.

Winston, herói de 1984 , último romance de George Orwell, vive aprisionado na engrenagem totalitária de uma sociedade completamente dominada pelo Estado, onde tudo é feito coletivamente, mas cada qual vive sozinho. Ninguém escapa à vigilância do Grande Irmão, a mais famosa personificação literária de um poder cínico e cruel ao infinito, além de vazio de sentido histórico. De fato, a ideologia do Partido dominante em Oceânia não visa nada de coisa alguma para ninguém, no presente ou no futuro. O'Brien, hierarca do Partido, é quem explica a Winston que "só nos interessa o poder em si. Nem riqueza, nem luxo, nem vida longa, nem felicidade: só o poder pelo poder, poder puro".
Quando foi publicada em 1949, essa assustadora distopia datada de forma arbitrária num futuro perigosamente próximo logo experimentaria um imenso sucesso de público. Seus principais ingredientes - um homem sozinho desafiando uma tremenda ditadura; sexo furtivo e libertador; horrores letais - atraíram leitores de todas as idades, à esquerda e à direita do espectro político, com maior ou menor grau de instrução. À parte isso, a escrita translúcida de George Orwell, os personagens fortes, traçados a carvão por um vigoroso desenhista de personalidades, a trama seca e crua e o tom de sátira sombria garantiram a entrada precoce de 1984 no restrito panteão dos grandes clássicos modernos.
TXT,
                'isbn' => '978-8535914849',
                'numero_paginas' => 416,
                'publicacao' => '2009-07-21',
                'imagem_capa' => 'https://m.media-amazon.com/images/I/819js3EQwbL._SY466_.jpg',
                'sobre' => <<<'TXT'
Publicada originalmente em 1949, a distopia futurista 1984 é um dos romances mais influentes do século XX, um inquestionável clássico moderno. Lançada poucos meses antes da morte do autor, é uma obra magistral que ainda se impõe como uma poderosa reflexão ficcional sobre a essência nefasta de qualquer forma de poder totalitário.

Winston, herói de 1984 , último romance de George Orwell, vive aprisionado na engrenagem totalitária de uma sociedade completamente dominada pelo Estado, onde tudo é feito coletivamente, mas cada qual vive sozinho. Ninguém escapa à vigilância do Grande Irmão, a mais famosa personificação literária de um poder cínico e cruel ao infinito, além de vazio de sentido histórico. De fato, a ideologia do Partido dominante em Oceânia não visa nada de coisa alguma para ninguém, no presente ou no futuro. O'Brien, hierarca do Partido, é quem explica a Winston que "só nos interessa o poder em si. Nem riqueza, nem luxo, nem vida longa, nem felicidade: só o poder pelo poder, poder puro".
Quando foi publicada em 1949, essa assustadora distopia datada de forma arbitrária num futuro perigosamente próximo logo experimentaria um imenso sucesso de público. Seus principais ingredientes - um homem sozinho desafiando uma tremenda ditadura; sexo furtivo e libertador; horrores letais - atraíram leitores de todas as idades, à esquerda e à direita do espectro político, com maior ou menor grau de instrução. À parte isso, a escrita translúcida de George Orwell, os personagens fortes, traçados a carvão por um vigoroso desenhista de personalidades, a trama seca e crua e o tom de sátira sombria garantiram a entrada precoce de 1984 no restrito panteão dos grandes clássicos modernos.
TXT,
                'preco' => 29.92,
                'arquivo_ebook' => 'ebooks/D5y63lcgA8jZVxBNm3bVwR5QWjrbBLH7JXGgdHAc.pdf',
                'formato_ebook' => 'pdf',
            ],
        ];
    }
}
