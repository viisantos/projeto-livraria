<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LivroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('livros')->insert([
            [
                'id' => 1,
                'categoria_id' => 3,
                'titulo' => 'Acessibilidade na Web',
                'slug' => 'acessibilidade-na-web',
                'descricao' => 'Boas práticas para construir sites e aplicações acessíveis',
                'isbn' => '978-65-86110-10-4',
                'numero_paginas' => 246,
                'publicacao' => '2020-04-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/acessibilidade.png',
                'autor_id' => 1,
                'sobre' => 'Acessibilidade na Web consiste na eliminação de barreiras de acesso em páginas e aplicações digitais para que pessoas com deficiência tenham autonomia na rede. Na verdade, acessibilidade na web beneficia todas as pessoas...'
            ],
            [
                'id' => 2,
                'categoria_id' => 3,
                'titulo' => 'Angular 11 e Firebase',
                'slug' => 'angular11-e-firebase',
                'descricao' => 'Construindo uma aplicação integrada com a plataforma do Google',
                'isbn' => '978-85-7254-036-0',
                'numero_paginas' => 163,
                'publicacao' => '2019-11-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/angular.png',
                'autor_id' => 2,
                'sobre' => 'No desenvolvimento de aplicações web e mobile, há disponível uma quantidade expressiva de linguagens...'
            ],
            [
                'id' => 3,
                'categoria_id' => 1,
                'titulo' => 'Arquitetura de software distribuído',
                'slug' => 'arquitetura-de-software-distribuído',
                'descricao' => 'Boas práticas para um mundo de microsserviços',
                'isbn' => '978-65-86110-86-9',
                'numero_paginas' => 138,
                'publicacao' => '2021-10-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/arquitetura.png',
                'autor_id' => 3,
                'sobre' => 'Com constantes evoluções, adições de novas funcionalidades e integrações com outros sistemas...'
            ],
            [
                'id' => 4,
                'categoria_id' => 3,
                'titulo' => 'Bootstrap 4',
                'slug' => 'bootstrap-4',
                'descricao' => 'Conheça a biblioteca front-end mais utilizada no mundo',
                'isbn' => '978-85-94188-60-1',
                'numero_paginas' => 172,
                'publicacao' => '2018-05-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/bootstrap4.png',
                'autor_id' => 4,
                'sobre' => 'Fazer um site elegante nunca foi tão fácil...'
            ],
            [
                'id' => 5,
                'categoria_id' => 3,
                'titulo' => 'Cangaceiro JavaScript',
                'slug' => 'cangaceiro-javascript',
                'descricao' => 'Uma aventura no sertão da programação',
                'isbn' => '978-85-94188-00-7',
                'numero_paginas' => 502,
                'publicacao' => '2017-08-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/cangaceirojavascript.png',
                'autor_id' => 5,
                'sobre' => 'Talvez nenhuma outra linguagem tenha conseguido invadir o coletivo imaginário...'
            ],
            [
                'id' => 6,
                'categoria_id' => 3,
                'titulo' => 'CSS Eficiente',
                'slug' => 'css-eficiente',
                'descricao' => 'Técnicas e ferramentas que fazem a diferença nos seus estilos',
                'isbn' => '978-85-5519-076-6',
                'numero_paginas' => 144,
                'publicacao' => '2015-06-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/css.png',
                'autor_id' => 6,
                'sobre' => 'Quando aprendemos a trabalhar com CSS, frequentemente nos pegamos perdidos...'
            ],
            [
                'id' => 7,
                'categoria_id' => 3,
                'titulo' => 'Introdução à Web Semântica',
                'slug' => 'introducao-a-web-semantica',
                'descricao' => 'A inteligência da informação',
                'isbn' => '978-85-94188-06-9',
                'numero_paginas' => 170,
                'publicacao' => '2017-09-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/websemantica.png',
                'autor_id' => 7,
                'sobre' => 'Por que precisamos da Web Semântica? A Web de hoje não é suficiente?...'
            ],
            [
                'id' => 8,
                'categoria_id' => 1,
                'titulo' => 'Apache Kafka e Spring Boot',
                'slug' => 'apache-kafka-e-spring-boot',
                'descricao' => 'Comunicação assíncrona entre microsserviços',
                'isbn' => '978-65-86110-98-2',
                'numero_paginas' => 189,
                'publicacao' => '2022-01-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/kafka.png',
                'autor_id' => 8,
                'sobre' => 'Pensar em comunicação assíncrona entre microsserviços é um caminho interessante...'
            ],
            [
                'id' => 9,
                'categoria_id' => 1,
                'titulo' => 'Construindo APIs REST com Node.js',
                'slug' => 'construindo-apis-rest-com-nodejs',
                'descricao' => '',
                'isbn' => '978-85-5519-150-3',
                'numero_paginas' => 187,
                'publicacao' => '2016-01-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/node.png',
                'autor_id' => 9,
                'sobre' => 'Hoje em dia, é muito comum criar aplicações client-side para web e mobile...'
            ],
            [
                'id' => 10,
                'categoria_id' => 3,
                'titulo' => 'Guia prático de TypeScript',
                'slug' => 'guia-pratico-de-typescript',
                'descricao' => 'Melhore suas aplicações JavaScript',
                'isbn' => '978-65-86110-77-7',
                'numero_paginas' => 178,
                'publicacao' => '2021-07-01',
                'imagem_capa' => 'https://raw.githubusercontent.com/viniciosneves/alurabooks/curso-novo/public/imagens/livros/typescript.png',
                'autor_id' => 10,
                'sobre' => 'O TypeScript adiciona tipagem estática ao JavaScript, ajudando a evitar erros...'
            ]
        ]);
    }
}
