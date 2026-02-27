# -*- coding: utf-8 -*-
"""Модели БД: User, Article, Comment."""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """Пользователь (автор статей)."""
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(256), unique=True, nullable=False)
    hashed_password = db.Column(db.String(256), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

    articles = db.relationship("Article", backref="author", lazy="dynamic")

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


class Article(db.Model):
    """Статья."""
    __tablename__ = "articles"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category = db.Column(db.String(64), nullable=False, default="general")

    comments = db.relationship("Comment", backref="article", lazy="dynamic", cascade="all, delete-orphan")


class Comment(db.Model):
    """Комментарий к статье."""
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    article_id = db.Column(db.Integer, db.ForeignKey("articles.id"), nullable=False)
    author_name = db.Column(db.String(128), nullable=False)
