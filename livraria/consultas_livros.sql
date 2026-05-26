SELECT id, autor_id, titulo, slug, descricao, isbn, numero_paginas, publicacao, imagem_capa, sobre, created_at, updated_at, categoria_id, preco, estoque
	FROM public.livros;
	
UPDATE livros
SET preco = ROUND((RANDOM() * 30 + 20)::numeric, 2)
WHERE id IN (1,2,3,4,5,6,7,8,9,10,11);

SELECT setval(
    pg_get_serial_sequence('livros', 'id'),
    COALESCE(MAX(id), 1)
)
FROM livros;