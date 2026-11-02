"""
Script 06: Seed da Mock Engine de Indicadores Municipais de Barueri (Conecta Barueri)
Popula a tabela 'apresentacao.indicador' com dados tratados de secretarias municipais:
- Secretarias: Inovação (CIT), Saúde, Educação, Segurança e Finanças
- Valores numéricos e unidades de medida
- Histórico temporal em JSON para renderização imediata em gráficos Chart.js!
"""
import os
import sys

# Garante acesso aos módulos da raiz 'conecta_barueri'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Indicador

INDICADORES_BARUERI = [
    {
        "secretaria": "Inovação e Tecnologia (CIT)",
        "nome_metrica": "Processos 100% Digitais (Barueri Sem Papel)",
        "valor_numerico": 98.4,
        "unidade_medida": "%",
        "historico_json": [
            {"periodo": "2023", "valor": 64.0},
            {"periodo": "2024", "valor": 81.5},
            {"periodo": "2025", "valor": 92.0},
            {"periodo": "2026", "valor": 98.4}
        ]
    },
    {
        "secretaria": "Inovação e Tecnologia (CIT)",
        "nome_metrica": "Pontos de Conexão Wi-Fi Gratuita nos Bairros",
        "valor_numerico": 185.0,
        "unidade_medida": "pontos",
        "historico_json": [
            {"periodo": "2023", "valor": 70},
            {"periodo": "2024", "valor": 110},
            {"periodo": "2025", "valor": 150},
            {"periodo": "2026", "valor": 185}
        ]
    },
    {
        "secretaria": "Saúde",
        "nome_metrica": "Consultas Médicas Realizadas na Rede Básica",
        "valor_numerico": 2.45,
        "unidade_medida": "milhões",
        "historico_json": [
            {"periodo": "2023", "valor": 1.95},
            {"periodo": "2024", "valor": 2.15},
            {"periodo": "2025", "valor": 2.30},
            {"periodo": "2026", "valor": 2.45}
        ]
    },
    {
        "secretaria": "Saúde",
        "nome_metrica": "Índice de Cobertura Vacinal Pediátrica",
        "valor_numerico": 96.8,
        "unidade_medida": "%",
        "historico_json": [
            {"periodo": "2023", "valor": 91.2},
            {"periodo": "2024", "valor": 93.5},
            {"periodo": "2025", "valor": 95.1},
            {"periodo": "2026", "valor": 96.8}
        ]
    },
    {
        "secretaria": "Educação",
        "nome_metrica": "Alunos Matriculados na Rede Municipal",
        "valor_numerico": 68.2,
        "unidade_medida": "mil alunos",
        "historico_json": [
            {"periodo": "2023", "valor": 63.5},
            {"periodo": "2024", "valor": 65.0},
            {"periodo": "2025", "valor": 66.8},
            {"periodo": "2026", "valor": 68.2}
        ]
    },
    {
        "secretaria": "Educação",
        "nome_metrica": "Escolas com Laboratórios Maker e Robótica",
        "valor_numerico": 74.0,
        "unidade_medida": "escolas",
        "historico_json": [
            {"periodo": "2023", "valor": 22},
            {"periodo": "2024", "valor": 45},
            {"periodo": "2025", "valor": 62},
            {"periodo": "2026", "valor": 74}
        ]
    },
    {
        "secretaria": "Segurança Urbana",
        "nome_metrica": "Câmeras Inteligentes Conectadas ao COI",
        "valor_numerico": 620.0,
        "unidade_medida": "câmeras",
        "historico_json": [
            {"periodo": "2023", "valor": 310},
            {"periodo": "2024", "valor": 440},
            {"periodo": "2025", "valor": 550},
            {"periodo": "2026", "valor": 620}
        ]
    },
    {
        "secretaria": "Finanças e Planejamento",
        "nome_metrica": "Investimento Municipal em Modernização Tecnológica",
        "valor_numerico": 142.5,
        "unidade_medida": "R$ Milhões",
        "historico_json": [
            {"periodo": "2023", "valor": 85.0},
            {"periodo": "2024", "valor": 105.2},
            {"periodo": "2025", "valor": 128.0},
            {"periodo": "2026", "valor": 142.5}
        ]
    }
]

def rodar_seed_indicadores():
    app = create_app()
    with app.app_context():
        # Garante que a tabela apresentacao.indicador exista antes da consulta
        db.create_all()

        print("=" * 60)
        print("📊 [06/07] SEMEANDO MOCK DE INDICADORES MUNICIPAIS...")
        print("=" * 60)

        for dados in INDICADORES_BARUERI:
            indicador = Indicador.query.filter_by(
                secretaria=dados["secretaria"],
                nome_metrica=dados["nome_metrica"]
            ).first()

            if not indicador:
                indicador = Indicador(
                    secretaria=dados["secretaria"],
                    nome_metrica=dados["nome_metrica"],
                    valor_numerico=dados["valor_numerico"],
                    unidade_medida=dados["unidade_medida"],
                    historico_json=dados["historico_json"]
                )
                db.session.add(indicador)
                print(f"✨ Indicador criado: [{dados['secretaria']}] {dados['nome_metrica']} -> {dados['valor_numerico']} {dados['unidade_medida']}")
            else:
                indicador.valor_numerico = dados["valor_numerico"]
                indicador.unidade_medida = dados["unidade_medida"]
                indicador.historico_json = dados["historico_json"]
                print(f"🔄 Indicador atualizado: [{dados['secretaria']}] {dados['nome_metrica']}")

        db.session.commit()
        print("✅ Indicadores municipais tratados e prontos para o preenchimento dinâmico!")
        print("=" * 60 + "\n")

if __name__ == '__main__':
    rodar_seed_indicadores()
