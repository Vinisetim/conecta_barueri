from flask import Blueprint, render_template

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/visao-geral')
def visao_geral():
    return render_template("admin/administracao.html")

@admin_bp.route('/usuario')
def usuario():
    return render_template("admin/admin_funcionarios.html")

@admin_bp.route('/equipes')
def equipes():
    return render_template("admin/admin_equipes.html")

@admin_bp.route('/projetos')
def projetos():
    return render_template("admin/admin_projetos.html")

@admin_bp.route('/fonte-de-dados')
def fonte_dados():
    return render_template("admin/admin_fontes.html")