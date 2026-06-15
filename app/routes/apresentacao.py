from flask import Blueprint, render_template

CriarApresentacao_bp = Blueprint('CriarApresentacao', __name__)

@CriarApresentacao_bp.route('/CriarApresentacao')
def CriarApresentacao():
    return render_template("apresentacao/criar_apresentacao.html")