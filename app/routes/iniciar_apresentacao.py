from flask import Blueprint, render_template

iniciar_apresentacao_bp = Blueprint(
    'iniciar_apresentacao',
    __name__
)


@iniciar_apresentacao_bp.route('/iniciar-apresentacao')
def iniciar_apresentacao():

    return render_template(
        'apresentacao/iniciar_apresentacao.html'
    )