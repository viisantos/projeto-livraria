<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\LivroRepositoryInterface;
use App\Repositories\Contracts\CategoriaRepositoryInterface;
use App\Repositories\Contracts\AutorRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\PedidoRepositoryInterface;
use App\Repositories\LivroRepository;
use App\Repositories\CategoriaRepository;
use App\Repositories\AutorRepository;
use App\Repositories\UserRepository;
use App\Repositories\PedidoRepository;

class RepositoryServiceProvider extends ServiceProvider{
    public function register(): void {
        $this->app->bind(
            LivroRepositoryInterface::class,
            LivroRepository::class
        );
        $this->app->bind(
            CategoriaRepositoryInterface::class,
            CategoriaRepository::class
        );
        $this->app->bind(
            AutorRepositoryInterface::class,
            AutorRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        $this->app->bind(
            PedidoRepositoryInterface::class,
            PedidoRepository::class
        );

    }
}
