from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db, bcrypt
from app.models import Pasta, Projeto, Apresentacao, Slide, Senha

app_bp = Blueprint('app', __name__)

@app_bp.route('/home')
def home():
    """Rota principal pós-login"""
    return render_template('home/home.html')

@app_bp.route('/perfil')
@login_required
def perfil():
    """
    Rota da página de Perfil do Usuário autenticado.
    Carrega os dados pessoais do usuário logado no banco de dados,
    suas estatísticas de uso (pastas/projetos, apresentações e slides) e projetos recentes.
    """
    pastas_usuario = Pasta.query.filter_by(usuario_id=current_user.id).order_by(Pasta.id.desc()).all()
    pasta_ids = [p.id for p in pastas_usuario]

    if pasta_ids:
        apresentacoes_usuario = Apresentacao.query.filter(
            Apresentacao.pasta_id.in_(pasta_ids)
        ).order_by(Apresentacao.data_criacao.desc()).all()
        apresentacao_ids = [ap.id for ap in apresentacoes_usuario]
        total_slides = Slide.query.filter(Slide.apresentacao_id.in_(apresentacao_ids)).count() if apresentacao_ids else 0
    else:
        apresentacoes_usuario = []
        total_slides = 0

    return render_template(
        'auth/perfil.html',
        usuario=current_user,
        pastas=pastas_usuario,
        projetos=pastas_usuario,  # Compatibilidade com templates
        apresentacoes=apresentacoes_usuario,
        total_projetos=len(pastas_usuario),
        total_pastas=len(pastas_usuario),
        total_apresentacoes=len(apresentacoes_usuario),
        total_slides=total_slides
    )

@app_bp.route('/perfil/atualizar', methods=['POST'])
@login_required
def atualizar_perfil():
    """
    Permite ao usuário autenticado atualizar seu nome, e-mail e opcionalmente sua senha no banco de dados.
    """
    nome = (request.form.get('nome') or '').strip()
    email = (request.form.get('email') or '').strip().lower()
    nova_senha = (request.form.get('nova_senha') or '').strip()

    if not nome or not email:
        flash('Nome e e-mail são obrigatórios.', 'danger')
        return redirect(url_for('app.perfil'))

    try:
        current_user.nome = nome
        current_user.email = email

        if nova_senha:
            if len(nova_senha) < 4:
                flash('A nova senha deve ter pelo menos 4 caracteres.', 'warning')
                return redirect(url_for('app.perfil'))
            senha_hash = bcrypt.generate_password_hash(nova_senha).decode('utf-8')
            if current_user.senha_obj:
                current_user.senha_obj.senha = senha_hash
            else:
                nova_credencial = Senha(usuario_id=current_user.id, senha=senha_hash)
                db.session.add(nova_credencial)

        db.session.commit()
        flash('Suas informações de perfil foram atualizadas com sucesso!', 'success')
    except Exception as e:
        db.session.rollback()
        print(f"[ERRO AO ATUALIZAR PERFIL]: {e}")
        flash('Ocorreu um erro ao atualizar o perfil no banco de dados.', 'danger')

    return redirect(url_for('app.perfil'))
