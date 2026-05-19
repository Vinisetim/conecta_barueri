CREATE SCHEMA apresentacao;
CREATe SCHEMA login;

CREATE TABLE login.usuario(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(255),
	email TEXT,
	admin BOOLEAN
)

SELECT * FROM usuario;


INSERT INTO login.usuario (
	nome,
	email,
	admin
)
VALUES(
	'Admin',
	'admin@gmail.com',
	TRUE
);

INSERT INTO login.usuario (
	nome,
	email,
	admin
)
VALUES(
	'Vinicin MD',
	'admin@gmail.com',
	TRUE
);



CREATE TABLE login.senha(
	usuario_id INTEGER  PRIMARY KEY,
	senha varchar(255),

	FOREIGN KEY (usuario_id)
		REFERENCES login.usuario (id)
		ON UPDATE CASCADE
);

SELECT * FROM senha;


SELECT * 
	FROM login.usuario
	JOIN login.senha ON senha.usuario_id = usuario.id
	ORDER BY usuario.nome DESC

		
INSERT INTO login.senha (usuario_id, senha) VALUES(1,'aaaaaa');
INSERT INTO login.senha (usuario_id, senha) VALUES(2,'bbbbbb');


CREATE TABLE apresentacao.categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL
);

SELECT * FROM apresentacao.categoria 

INSERT INTO apresentacao.categoria (nome) VALUES('Saude');
INSERT INTO apresentacao.categoria (nome) VALUES('Social');
INSERT INTO apresentacao.categoria (nome) VALUES('Segurança');
INSERT INTO apresentacao.categoria (nome) VALUES('Educação');
INSERT INTO apresentacao.categoria (nome) VALUES('Economia');
INSERT INTO apresentacao.categoria (nome) VALUES('Meio Abiente')

CREATE TABLE apresentacao.salvar_apresentacao (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER ,
    usuario_id INTEGER ,
    nome VARCHAR(255),
    dados_salvos VARCHAR(255),


	FOREIGN KEY (usuario_id)
		REFERENCES login.usuario (id)
		ON UPDATE CASCADE,

	FOREIGN KEY (categoria_id)
		REFERENCES apresentacao.categoria (id)
		ON UPDATE CASCADE
);


SELECT * FROM apresentacao.salvar_apresentacao
INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id, nome, dados_salvos) VALUES(2,1,'Social','aaaaa')
INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id, nome, dados_salvos) VALUES(6,2,'Para encher linguiça','bbbbbbb')


SELECT  login.usuario.id as id,login.usuario.nome as Nome,
		apresentacao.categoria.nome as "Nome da categoria", 
		apresentacao.salvar_apresentacao.nome as "Nome do projeto", apresentacao.salvar_apresentacao.dados_salvos as Salvo
	FROM apresentacao.salvar_apresentacao
	LEFT JOIN apresentacao.categoria ON apresentacao.categoria.id = apresentacao.salvar_apresentacao.categoria_id
	LEFT JOIN login.usuario ON login.usuario.id =apresentacao.salvar_apresentacao.usuario_id
		


	

	



	