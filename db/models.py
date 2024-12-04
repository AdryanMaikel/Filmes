from typing import Union

from sqlalchemy import Column, Integer, String
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


base.metadata.create_all(engine)
