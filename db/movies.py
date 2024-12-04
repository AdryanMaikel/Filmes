from sqlalchemy.exc import SQLAlchemyError

from .database import Session
from .models import Movie


def get() -> list[Movie]:
    with Session() as session:
        movies = session.query(Movie).order_by(Movie.name).all()
    return movies


def add(movie: dict[str, str | int]) -> tuple[str, int]:
    movie_name = movie.get("name", "").strip()
    if not movie_name:
        return "Nome do filme é obrigatório.", 400
    with Session() as session:
        try:
            new_movie = Movie(**movie)
            session.add(new_movie)
            session.commit()
            session.refresh(new_movie)
            return f"Filme '{new_movie.name}' adicionado com sucesso!", 200
        except SQLAlchemyError as error:
            session.rollback()
            print(error)
            return f"Erro no banco: {error}.", 500
        except Exception as error:
            session.rollback()
            return f"Erro desconhecido: {error}.", 400
    return "Algo deu errado.", 400


def delete(movie: dict[str, str | int]) -> tuple[str, int]:
    movie_id = movie.get("id", "")
    if not movie_id:
        return "Id não pode ser nulo.", 400
    with Session() as session:
        movie = session.query(Movie).filter_by(id=movie_id).first()
        if not movie:
            return "Filme não encontrado", 404
        try:
            session.delete(movie)
            session.commit()
            return f"Filme '{movie.name}' deletado com sucesso!", 200
        except SQLAlchemyError as error:
            session.rollback()
            return f"Erro no banco: {error}", 500
        except Exception as error:
            session.rollback()
            return f"Erro desconhecido: {error}", 400
    return "Algo deu errado.", 400


def edit(new_movie: dict[str, str | int]) -> tuple[str, int]:
    movie_id = new_movie.get("id", "")
    if not movie_id:
        return "Id não pode ser nulo.", 400
    if not new_movie.get("name", ""):
        return "Nome do filme não pode ser nulo.", 400
    with Session() as session:
        movie = session.query(Movie).filter_by(id=movie_id).first()
        if not movie:
            return "Filme não encontrado.", 404
        try:
            for key, value in new_movie.items():
                if hasattr(movie, key):
                    setattr(movie, key, value)
            session.commit()
            return f"Filme '{movie.name}' editado com sucesso!", 200
        except SQLAlchemyError as error:
            session.rollback()
            return f"Erro no banco: {error}", 500
        except Exception as error:
            session.rollback()
            return f"Erro desconhecido: {error}", 400
    return "Algo deu errado.", 400
