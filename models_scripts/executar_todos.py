"""
Orquestrador Mestre: Executar Todos os Scripts e Seeds do Banco (Conecta Barueri)
Executa a sequência completa de inicialização e carga inicial do banco de dados na ordem ideal de dependência:
1. 01_criar_banco.py        -> Schemas e tabelas
2. 02_seed_usuarios.py      -> Admin e Servidor de teste (Bcrypt)
3. 03_seed_templates.py     -> 8 Templates homologados de slide
4. 04_seed_ods.py           -> 17 ODS da ONU com CDN Wikimedia
5. 05_seed_apresentadores.py-> Catálogo de autoridades (CIT/Barueri)
6. 06_seed_indicadores.py   -> Mock de Indicadores tratados municipais
7. 07_seed_projeto_vitrine.py-> Projeto e apresentação vitrine da banca
"""
import os
import sys
import importlib.util

# Garante acesso aos módulos da raiz 'conecta_barueri'
DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.abspath(os.path.join(DIRETORIO_ATUAL, '..'))
sys.path.insert(0, DIRETORIO_RAIZ)

ETAPAS = [
    ("01_criar_banco.py", "criar_banco", "1. Schemas e Tabelas"),
    ("02_seed_usuarios.py", "rodar_seed_usuarios", "2. Usuários de Teste"),
    ("03_seed_templates.py", "rodar_seed_templates", "3. 8 Templates Homologados"),
    ("04_seed_ods.py", "rodar_seed_ods", "4. 17 ODS da ONU"),
    ("05_seed_apresentadores.py", "rodar_seed_apresentadores", "5. Catálogo de Apresentadores"),
    ("06_seed_indicadores.py", "rodar_seed_indicadores", "6. Indicadores Municipais"),
    ("07_seed_projeto_vitrine.py", "rodar_seed_projeto_vitrine", "7. Projeto Vitrine da Banca")
]

def carregar_e_executar(arquivo_nome, funcao_nome):
    caminho = os.path.join(DIRETORIO_ATUAL, arquivo_nome)
    spec = importlib.util.spec_from_file_location(arquivo_nome[:-3], caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    funcao = getattr(modulo, funcao_nome)
    funcao()

def executar_tudo():
    print("\n" + "=" * 70)
    print("🚀 INICIANDO CARGA COMPLETA DO BANCO DE DADOS — CONECTA BARUERI")
    print("=" * 70)

    sucessos = 0
    falhas = 0

    for arquivo, funcao, rotulo in ETAPAS:
        try:
            print(f"\n▶️  Executando: {rotulo} ({arquivo})...")
            carregar_e_executar(arquivo, funcao)
            sucessos += 1
        except Exception as e:
            print(f"❌ Erro ao executar {arquivo}: {e}")
            falhas += 1

    print("\n" + "=" * 70)
    print(f"🏁 RESUMO DA EXECUÇÃO: {sucessos} concluídas com sucesso | {falhas} falhas.")
    if falhas == 0:
        print("🎉 O banco de dados está 100% configurado, populado e pronto para a Banca!")
    else:
        print("⚠️ Verifique as mensagens de erro acima para corrigir pendências.")
    print("=" * 70 + "\n")

if __name__ == '__main__':
    executar_tudo()
