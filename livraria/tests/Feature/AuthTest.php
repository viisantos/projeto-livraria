<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
//use Tests\TestCase;
use Tests\Feature\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    /*
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }*/

    public function test_usuario_pode_se_registrar(): void {
        $response = $this->postJson('/api/register', [
            'name'     => 'Maria Silva',
            'email'    => 'maria@email.com',
            'password' => '12345678',
            'password_confirmation' => '12345678'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                    'status',
                    'user' => ['id', 'nome', 'email'],
                    'authorisation' => ['token', 'type'],
                 ]);
        $this->assertDatabaseHas('users', ['email' => 'maria@email.com']);
    }

    public function test_registro_falha_com_email_duplicado(){
        User::factory()->create(['email' => 'maria@email.com']);
        $response = $this->postJson('/api/register', [
            'name'   => 'Maria Silva',
            'email'  => 'maria@email.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_registro_falha_sem_campos_obrigatorios(): void {
        $response = $this->postJson('/api/register', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_usuario_pode_fazer_login(): void{
        User::factory()->create([
            'email' => 'maria@email.com',
            'password' => bcrypt('12345678')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'maria@email.com',
            'password' => '12345678'
        ]);

        $response->assertStatus(200)->assertJsonStructure([
            'authorisation' => ['token', 'type'],
        ]);
    }

    public function test_usuario_autenticado_pode_fazer_logout(){
        $auth = $this->loginComoComprador();
        $response = $this->postJson(
            '/api/logout',
            [],
            $this->headerComToken($auth['token'])
        );
        $response->assertStatus(200);
    }

    public function test_logout_falha_sem_token(){
        $response = $this->postJson('/api/logout');
        $response->assertStatus(401);
    }

    public function test_usuario_autenticado_pode_ver_seus_dados(){
        $auth = $this->loginComoComprador();
        $response = $this->getJson(
            '/api/me',
            $this->headerComToken($auth['token'])
        );

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $auth['user']->email]);
    }
}
