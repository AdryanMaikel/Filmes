from typing import Union

from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import declarative_base

from .database import engine

base = declarative_base()


class User(base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f'id="{self.id}" username="{self.username}"'

    def to_dict(self) -> dict[str, Union[str, int]]:
        return {
            "id": self.id,
            "username": self.username
        }


class Movie(base):
    __tablename__ = "movie"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    dubbed = Column(Boolean, nullable=True)
    sequence = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)
    id_drive = Column(String, nullable=True)
    player = Column(String, nullable=True)
    quality = Column(Integer, nullable=True)
    genre = Column(String, nullable=True)
    synopsis = Column(Text, nullable=True)
    image = Column(String, nullable=True)

    def __repr__(self):
        if not self.sequence:
            return f"{self.name}"
        return f"{self.name} {self.sequence}"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "dubbed": self.dubbed,
            "sequence": self.sequence,
            "year": self.year,
            "id_drive": self.id_drive,
            "player": self.player,
            "quality": self.quality,
            "genre": self.genre,
            "synopsis": self.synopsis,
            "image": self.image
        }


base.metadata.create_all(engine)
