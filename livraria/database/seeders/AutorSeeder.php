<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Autor;

class AutorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         Autor::insert([
            [
                'id' => 1,
                'nome' => 'Reinaldo Ferraz',
                'sobre' => 'Formado em desenho e computação gráfica e pós-graduado em design de hipermídia pela Universidade Anhembi Morumbi em São Paulo. Trabalha com desenvolvimento web desde 1998. Coordena as iniciativas de acessibilidade na Web do NIC.br e projetos relacionados a Open Web Platform, Digital Publishing e Web das Coisas. Representante do NIC.br em grupos de trabalho do W3C internacional em Acessibilidade na Web, Digital Publishing e Web das Coisas. Apaixonado por acessibilidade, usabilidade, padrões web, HTML, CSS e café sem açúcar.'
            ],
            [
                'id' => 2,
                'nome' => 'Kheronn Khennedy Machado',
                'sobre' => 'Kheronn Khennedy Machado é professor da rede pública estadual do Paraná. Atua na formação de professores para uso de tecnologia em sala de aula. Desenvolve desde 2007 aplicações para web e mobile, tendo recentemente focado em soluções que utilizam Javascript. Possui Mestrado em Informática pela UFPR e Graduação em Processamento de Dados pela Fatec Ourinhos.'
            ],
            [
                'id' => 3,
                'nome' => 'Flávio Lisboa',
                'sobre' => 'Flávio Gomes da Silva Lisboa é bacharel em Ciência da Computação, especialista em tecnologia Java, certificado como engenheiro e arquiteto em PHP e Zend Framework e mestrando em Tecnologia e Sociedade. Tem experiência como programador e como gestor de projeto de software. É professor de disciplinas de programação orientada a objetos, testes unitários e frameworks de desenvolvimento.'
            ],
            [
                'id' => 4,
                'nome' => 'Natan Souza',
                'sobre' => 'Natan Souza é front-end designer no grupo Caelum desde 2015, e instrutor dos cursos presenciais de front-end e UX.'
            ],
            [
                'id' => 5,
                'nome' => 'Flávio Almeida',
                'sobre' => 'Flávio Almeida é desenvolvedor e instrutor na Caelum. Possui mais de 14 anos de experiência na área de desenvolvimento.'
            ],
            [
                'id' => 6,
                'nome' => 'Tárcio Zemel',
                'sobre' => 'Tárcio Zemel trabalha com desenvolvimento web há 15 anos e é sócio-fundador da empresa webfatorial.'
            ],
            [
                'id' => 7,
                'nome' => 'Diego Eis',
                'sobre' => 'Diego Eis é apaixonado por internet e fundador do Tableless.'
            ],
            [
                'id' => 8,
                'nome' => 'Eduardo Felipe Zambom Santana',
                'sobre' => 'Eduardo Felipe Zambom Santana tem mais de 15 anos de experiência em Engenharia de Software.'
            ],
            [
                'id' => 9,
                'nome' => 'Caio Ribeiro Pereira',
                'sobre' => 'Caio Ribeiro Pereira é desenvolvedor desde 2008, focado em JavaScript, React e Node.js.'
            ],
            [
                'id' => 10,
                'nome' => 'Thiago da Silva Adriano',
                'sobre' => 'Thiago da Silva Adriano é Microsoft MVP e Engenheiro de Software.'
            ],
        ]);
    }
}
