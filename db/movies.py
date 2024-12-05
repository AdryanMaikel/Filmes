
from sqlalchemy.exc import SQLAlchemyError

from .database import Session
from .models import Movie

# def mount_player_drive(drive_id: str) -> str:
#     return f"https://drive.google.com/file/d/{drive_id}/view"


def get(to_dict: bool) -> list[Movie] | list[dict]:
    """Retorna a lista de filmes ordenados por nome."""
    with Session() as session:
        movies = session.query(Movie).\
            order_by(Movie.name, Movie.sequence).all()
    if not to_dict:
        return movies
    return [movie.to_dict() for movie in movies]


def add(movie: dict[str, str]) -> tuple[str, int]:
    """Adiciona um novo filme."""
    name = movie.get("name", "").strip()
    if not name:
        return "Nome do filme inválido.", 400

    try:
        with Session() as session:
            new_movie = Movie(**movie)
            session.add(new_movie)
            session.commit()
            session.refresh(new_movie)
            return f"Filme '{new_movie}' adicionado com sucesso.", 200
    except SQLAlchemyError as error:
        return f"Erro no banco: {error}.", 500
    except Exception as error:
        return f"Erro desconhecido: {error}.", 400
    return "Algo deu errado.", 400


def delete(movie: dict[str, str]) -> tuple[str, int]:
    """Deleta um filme pelo ID."""
    movie_id = movie.get("id", "")
    if not movie_id:
        return "ID do filme não encontrado.", 400

    with Session() as session:
        movie = session.query(Movie).filter_by(id=movie_id).first()
        if not movie:
            return f"Filme com ID {movie_id} não encontrado.", 404
        try:
            session.delete(movie)
            session.commit()
            return f"Filme '{movie.name}' deletado com sucesso.", 200
        except Exception as error:
            session.rollback()
            return f"Falha ao deletar o filme: {error}.", 400
    return "Algo deu errado.", 400


def edit(new_movie: dict[str, str]) -> tuple[str, int]:
    """Edita um filme existente."""
    movie_id = new_movie.get("id", "")
    if not movie_id:
        return "ID do filme não encontrado.", 400

    with Session() as session:
        movie = session.query(Movie).filter_by(id=movie_id).first()
        if not movie:
            return f"Filme com ID {movie_id} não encontrado.", 404
        try:
            for key, value in new_movie.items():
                if hasattr(movie, key) and key != "id":
                    setattr(movie, key, value)
            session.commit()
            return f"Filme '{movie}' editado com sucesso.", 200
        except Exception as error:
            session.rollback()
            return f"Falha ao editar o filme: {error}.", 400
    return "Algo deu errado.", 400
