from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db, bcrypt
from app.models import (
    Usuario,
    Senha,
    Projeto,
    Apresentacao,
    Slide,
    Templates,
    Ods,
    CampoPreenchido,
    Indicador,
)

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def _serializar_usuario(u):
    """Converte um registro Usuario do banco para dicionário JSON."""
    nomes_projetos = [p.nome for p in u.projetos] if u.projetos else []
    resumo_equipe = (
        f"{len(nomes_projetos)} pasta(s): {', '.join(nomes_projetos[:2])}"
        if nomes_projetos
        else "Sem pastas"
    )
    return {
        "id": u.id,
        "nome": u.nome or "Sem nome",
        "email": u.email or "",
        "iniciais": u.iniciais,
        "admin": bool(u.admin),
        "perfil": "Administrador" if u.admin else "Editor",
        "status_bool": bool(u.status),
        "status": "Ativo" if u.status else "Inativo",
        "equipe": resumo_equipe,
        "projetos_count": len(nomes_projetos),
    }


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
    usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
    usuarios_json = [_serializar_usuario(u) for u in usuarios]
    return render_template(
        "admin/admin_funcionarios.html",
        usuarios=usuarios,
        usuarios_json=usuarios_json,
    )


@admin_bp.route('/api/usuarios', methods=['GET'])
@login_required
def listar_usuarios_api():
    usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
    return jsonify({
        "status": "sucesso",
        "usuarios": [_serializar_usuario(u) for u in usuarios]
    })


@admin_bp.route('/usuario/criar', methods=['POST'])
@login_required
def criar_usuario():
    """Cria um novo usuário e sua credencial Bcrypt no banco PostgreSQL."""
    data = request.get_json(silent=True) or request.form

    nome = (data.get('nome') or '').strip()
    email = (data.get('email') or '').strip().lower()
    senha = (data.get('senha') or '').strip() or 'barueri123'
    perfil = (data.get('perfil') or 'Editor').strip()
    status_str = (data.get('status') or 'Ativo').strip()

    if not nome or not email:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Nome e e-mail são obrigatórios.'}), 400
        flash('Nome e e-mail são obrigatórios.', 'danger')
        return redirect(url_for('admin.usuario'))

    existente = Usuario.query.filter(db.func.lower(Usuario.email) == email).first()
    if existente:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Já existe um funcionário cadastrado com este e-mail.'}), 400
        flash('Já existe um funcionário cadastrado com este e-mail.', 'danger')
        return redirect(url_for('admin.usuario'))

    is_admin = (perfil.lower() == 'administrador')
    is_ativo = (status_str.lower() != 'inativo')

    try:
        novo_usuario = Usuario(
            nome=nome,
            email=email,
            admin=is_admin,
            status=is_ativo
        )
        db.session.add(novo_usuario)
        db.session.flush()

        senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')
        nova_senha = Senha(
            usuario_id=novo_usuario.id,
            senha=senha_hash
        )
        db.session.add(nova_senha)
        db.session.commit()

        if request.is_json:
            return jsonify({
                'status': 'sucesso',
                'mensagem': f'Funcionário "{nome}" cadastrado com sucesso no banco de dados!',
                'usuario': _serializar_usuario(novo_usuario)
            })

        flash(f'Funcionário "{nome}" cadastrado com sucesso!', 'success')
        return redirect(url_for('admin.usuario'))

    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao salvar no banco: {str(e)}'}), 500
        flash(f'Erro ao salvar no banco: {str(e)}', 'danger')
        return redirect(url_for('admin.usuario'))


@admin_bp.route('/usuario/editar/<int:id>', methods=['POST'])
@login_required
def editar_usuario(id):
    """Atualiza os dados de um funcionário existente no banco PostgreSQL."""
    u = Usuario.query.get_or_404(id)
    data = request.get_json(silent=True) or request.form

    nome = (data.get('nome') or '').strip()
    email = (data.get('email') or '').strip().lower()
    nova_senha = (data.get('senha') or '').strip()
    perfil = (data.get('perfil') or '').strip()
    status_str = (data.get('status') or '').strip()

    if not nome or not email:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Nome e e-mail são obrigatórios.'}), 400
        flash('Nome e e-mail são obrigatórios.', 'danger')
        return redirect(url_for('admin.usuario'))

    outro = Usuario.query.filter(db.func.lower(Usuario.email) == email, Usuario.id != u.id).first()
    if outro:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Este e-mail já está em uso por outro usuário.'}), 400
        flash('Este e-mail já está em uso por outro usuário.', 'danger')
        return redirect(url_for('admin.usuario'))

    try:
        u.nome = nome
        u.email = email
        if perfil:
            u.admin = (perfil.lower() == 'administrador')
        if status_str:
            u.status = (status_str.lower() == 'ativo')

        if nova_senha:
            senha_hash = bcrypt.generate_password_hash(nova_senha).decode('utf-8')
            if u.senha_obj:
                u.senha_obj.senha = senha_hash
            else:
                db.session.add(Senha(usuario_id=u.id, senha=senha_hash))

        db.session.commit()

        if request.is_json:
            return jsonify({
                'status': 'sucesso',
                'mensagem': f'Dados de "{u.nome}" atualizados no banco de dados!',
                'usuario': _serializar_usuario(u)
            })

        flash('Funcionário atualizado com sucesso!', 'success')
        return redirect(url_for('admin.usuario'))

    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao atualizar usuário: {str(e)}'}), 500
        flash(f'Erro ao atualizar usuário: {str(e)}', 'danger')
        return redirect(url_for('admin.usuario'))


@admin_bp.route('/usuario/excluir/<int:id>', methods=['POST', 'DELETE'])
@login_required
def excluir_usuario(id):
    """Remove um funcionário do banco de dados PostgreSQL."""
    u = Usuario.query.get_or_404(id)

    if current_user.is_authenticated and u.id == current_user.id:
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': 'Você não pode excluir a sua própria conta em uso.'}), 400
        flash('Você não pode excluir a sua própria conta em uso.', 'warning')
        return redirect(url_for('admin.usuario'))

    try:
        # Remove projetos/apresentações vinculados e credencial de senha antes de excluir o usuário
        for proj in list(u.projetos):
            for ap in list(proj.apresentacoes):
                for s in list(ap.slides):
                    CampoPreenchido.query.filter_by(slide_id=s.id).delete(synchronize_session=False)
                    db.session.delete(s)
                db.session.delete(ap)
            db.session.delete(proj)

        if u.senha_obj:
            db.session.delete(u.senha_obj)

        db.session.delete(u)
        db.session.commit()

        if request.is_json:
            return jsonify({'status': 'sucesso', 'mensagem': 'Funcionário removido do banco de dados!'})

        flash('Funcionário removido com sucesso!', 'success')
        return redirect(url_for('admin.usuario'))

    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'status': 'erro', 'mensagem': f'Erro ao excluir funcionário: {str(e)}'}), 500
        flash(f'Erro ao excluir funcionário: {str(e)}', 'danger')
        return redirect(url_for('admin.usuario'))


@admin_bp.route('/equipes')
@login_required
def equipes():
    try:
        usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
        usuarios_json = [_serializar_usuario(u) for u in usuarios]
    except Exception:
        usuarios = []
        usuarios_json = []
    return render_template(
        "admin/admin_equipes.html",
        usuarios=usuarios,
        usuarios_json=usuarios_json,
    )


@admin_bp.route('/fonte-de-dados')
@login_required
def fonte_dados():
    return render_template("admin/admin_fontes.html")