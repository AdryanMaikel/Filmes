from sqlalchemy.exc import SQLAlchemyError

from .database import Session
from .models import User


def check_login(username: str, password: str) -> bool:
    credentials = {"username": username, "password": password}
    with Session() as session:
        return bool(session.query(User).filter_by(**credentials).first())
    return False


def include(username: str) -> bool:
    with Session() as session:
        return bool(session.query(User).filter_by(username=username).all())
    return False


def get() -> list[User]:
    with Session() as session:
        users = session.query(User).order_by(User.username).all()
    return users


def add(user: dict[str, str]) -> tuple[str, int]:
    username = user.get("username", "").strip()
    password = user.get("password", "").strip()
    if not username:
        return "Nome de usuario inválido.", 400
    if not password:
        return "Senha inválida.", 400

    credentials = {"username": username, "password": password}

    with Session() as session:
        try:
            new_user = User(**credentials)
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            return f"Usuário {new_user} adicionado com sucesso.", 200
        except SQLAlchemyError as error:
            session.rollback()
            return f"Erro no banco: {error}.", 500
        except Exception as error:
            session.rollback()
            return f"Erro desconhecido: {error}.", 400
    return "Algo deu errado", 400


def delete(user: dict[str, str]) -> tuple[str, int]:
    user_id = user.get("id", "")
    if not user_id:
        return "Id não encontrado.", 400
    with Session() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return f"Usuário com id: {user_id} não encontrado.", 400
        try:
            session.delete(user)
            session.commit()
            return f"{user} deletado com sucesso!", 200
        except Exception:
            session.rollback()
            return f"Falha ao deletar o usuário: {user_id}.", 400
    return "Algo deu errado", 400


def edit(new_user: dict[str, str]) -> tuple[str, int]:
    user_id = new_user.get("id", "")
    if not user_id:
        return "Id não encontrado.", 400

    username = new_user.get("username", "")
    if not username:
        return "Nome inválido.", 400

    password = new_user.get("password", "")
    if not password:
        return "Senha inválida.", 400

    with Session() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return f"Usuário com id: {user_id} não encontrado.", 400
        try:
            user.username = username
            session.commit()
            return "Sucesso", 200
        except Exception:
            session.rollback()
            return f"Falha ao editar o usuário: {user_id}.", 400
    return "Algo deu errado", 400
