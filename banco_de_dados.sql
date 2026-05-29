CREATE SCHEMA apresentacao;
CREATe SCHEMA login;

DROP TABLE login.usuario
CREATE TABLE login.usuario(
	id SERIAL PRIMARY KEY NOT NULL,
	nome VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	admin BOOLEAN,
	equipe_id integer NOT NULL,


	FOREIGN KEY (equipe_id)
		REFERENCES apresentacao.equipes (equipes_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)



/* SELECT usuario */
SELECT * FROM usuario;

SELECT * FROM login.usuario
/* UPDATE usuario */
UPDATE login.usuario
	SET equipe_id = 2
WHERE id = 2;



/* INSERT usuario */
INSERT INTO login.usuario (nome,email,admin,equipe_id) VALUES('Admin','admin@gmail.com',TRUE,1);
INSERT INTO login.usuario (nome, email, admin, equipe_id) VALUES('Vinicin MD', 'vinicin@gmail.com', TRUE,2)





DROP TABLE login.senha; 
CREATE TABLE login.senha(
	usuario_id INTEGER  PRIMARY KEY NOT NULL,
	senha varchar(255) NOT NULL,

	FOREIGN KEY (usuario_id)
		REFERENCES login.usuario (id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)

/* SELECT SEN */
SELECT * FROM senha;


SELECT * 
	FROM login.usuario
	JOIN login.senha ON senha.usuario_id = usuario.id
	ORDER BY usuario.nome DESC

	UPDATE usuario
		SET id = 5
		WHERE id = 3;
		


INSERT INTO login.senha (usuario_id, senha) VALUES(7,'aaaaaa');
INSERT INTO login.senha (usuario_id, senha) VALUES(8,'bbbbbb');





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





DROP TABLE apresentacao.salvar_apresentacao 
CREATE TABLE apresentacao.salvar_apresentacao (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
	equipes_id INTEGER NOT NULL,
    nome VARCHAR(255) NOT NULL,
    dados_salvos VARCHAR(255) NOT NULL,


	FOREIGN KEY (usuario_id)
		REFERENCES login.usuario (id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,

	FOREIGN KEY (categoria_id)
		REFERENCES apresentacao.categoria (id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,


	FOREIGN KEY (equipes_id)
		REFERENCES apresentacao.equipes (equipes_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE


)



INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id,equipes_id, nome, dados_salvos) VALUES(2,7,1,'Social','aaaaa');
INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id,equipes_id, nome, dados_salvos) VALUES(3,7,1,'Encher linguiça','aaaaa');
INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id,equipes_id, nome, dados_salvos) VALUES(5,8,2,'Encher linguiça1','aaaaa');
INSERT INTO apresentacao.salvar_apresentacao ( categoria_id, usuario_id,equipes_id, nome, dados_salvos) VALUES(1,8,2,'Encher linguiça2','CCCCCC')

SELECT  login.usuario.id as id,login.usuario.nome as Nome,
		apresentacao.categoria.nome as "Nome da categoria", 
		apresentacao.salvar_apresentacao.nome as "Nome do projeto", apresentacao.salvar_apresentacao.dados_salvos as Salvo,
		equipes_id as Equipe
	FROM apresentacao.salvar_apresentacao
	LEFT JOIN apresentacao.categoria ON apresentacao.categoria.id = apresentacao.salvar_apresentacao.categoria_id
	LEFT JOIN login.usuario ON login.usuario.id =apresentacao.salvar_apresentacao.usuario_id
	

SELECT login.usuario.id as id,login.usuario.nome as Nome,
		apresentacao.categoria.nome as "Nome da categoria", 
		apresentacao.salvar_apresentacao.nome as "Nome do projeto", apresentacao.salvar_apresentacao.dados_salvos as Salvo,
		equipes_id as Equipe
	FROM apresentacao.salvar_apresentacao
	LEFT JOIN apresentacao.categoria ON apresentacao.categoria.id = apresentacao.salvar_apresentacao.categoria_id
	LEFT JOIN login.usuario ON login.usuario.id =apresentacao.salvar_apresentacao.usuario_id
	WHERE equipes_id = 2
	


DROP TABLE apresentacao.equipes
CREATE TABLE apresentacao.equipes(
	equipes_id iNTEGER PRIMARY KEY UNIQUE,
	nome VARCHAR(255) NOT NULL
)

INSERT INTO apresentacao.equipes (equipes_id,nome) VALUES(1,'teste')
INSERT INTO apresentacao.equipes (equipes_id,nome) VALUES(2,'Segunda equipe')

SELECT * FROM apresentacao.equipes



	



	