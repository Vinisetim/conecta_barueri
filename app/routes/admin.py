from flask import Blueprint, render_template
from flask_login import login_required
from app.models import (
    Usuario,
    Projeto,
    Apresentacao,
    Slide,
    Templates,
    Ods,
    CampoPreenchido,
    Indicador,
)

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/visao-geral')
@login_required
def visao_geral():
    usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
    projetos = Projeto.query.order_by(Projeto.id.desc()).all()
    apresentacoes = Apresentacao.query.order_by(Apresentacao.data_criacao.desc()).all()
    indicadores = Indicador.query.order_by(Indicador.id.asc()).all()

    total_usuarios = len(usuarios)
    usuarios_ativos = sum(1 for u in usuarios if u.status)
    usuarios_admins = sum(1 for u in usuarios if u.admin)

    total_projetos = len(projetos)
    total_apresentacoes = len(apresentacoes)
    total_slides = Slide.query.count()
    total_templates = Templates.query.count()
    total_ods = Ods.query.count()
    total_campos = CampoPreenchido.query.count()
    total_indicadores = len(indicadores)
    secretarias_conectadas = len({ind.secretaria for ind in indicadores if ind.secretaria})

    return render_template(
        "admin/administracao.html",
        usuarios=usuarios,
        projetos=projetos,
        apresentacoes=apresentacoes,
        indicadores=indicadores,
        total_usuarios=total_usuarios,
        usuarios_ativos=usuarios_ativos,
        usuarios_admins=usuarios_admins,
        total_projetos=total_projetos,
        total_apresentacoes=total_apresentacoes,
        total_slides=total_slides,
        total_templates=total_templates,
        total_ods=total_ods,
        total_campos=total_campos,
        total_indicadores=total_indicadores,
        secretarias_conectadas=secretarias_conectadas,
    )


@admin_bp.route('/usuario')
@login_required
def usuario():
    return render_template("admin/admin_funcionarios.html")


@admin_bp.route('/equipes')
@login_required
def equipes():
    return render_template("admin/admin_equipes.html")


@admin_bp.route('/fonte-de-dados')
@login_required
def fonte_dados():
    return render_template("admin/admin_fontes.html")