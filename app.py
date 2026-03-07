# -*- coding: utf-8 -*-
import os
import re
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, render_template, request, url_for, redirect, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from sqlalchemy import or_
import bleach

from models import db, User, Article, Comment

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///blog.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", "False") == "True"
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "15")))
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", "7")))

DEFAULT_PER_PAGE = 5
ARTICLE_CATEGORIES = ["general", "python", "flask", "web", "news"]

db.init_app(app)
jwt = JWTManager(app)

app.config["WTF_CSRF_CHECK_DEFAULT"] = False
csrf = CSRFProtect(app)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
).split(",")
CORS(app, supports_credentials=True, origins=cors_origins)

login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Войдите, чтобы создать или редактировать статью."


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.template_global()
def is_today(d):
    if d is None:
        return False
    if hasattr(d, "date"):
        d = d.date()
    return d == date.today()


def sanitize_html(text):
    if not text:
        return ""
    allowed_tags = ["b", "i", "u", "em", "strong", "p", "br", "img", "a", "h1", "h2", "h3", "h4", "ul", "ol", "li", "span", "div"]
    allowed_attrs = {
        "img": ["src", "alt", "style", "width", "height"],
        "a": ["href", "target", "rel", "title"],
        "*": ["style"]
    }
    return bleach.clean(text, tags=allowed_tags, attributes=allowed_attrs, strip=True).strip()


def init_db():
    with app.app_context():
        db.create_all()
        if User.query.first() is None:
            u1 = User(name="Админ", email="admin@blog.local")
            u1.set_password("admin")
            u2 = User(name="Автор", email="author@blog.local")
            u2.set_password("author")
            u3 = User(name="Редактор", email="editor@blog.local")
            u3.set_password("editor")
            db.session.add_all([u1, u2, u3])
            db.session.commit()

        if Article.query.count() == 0:
            try:
                import json
                with open('habr_articles.json', 'r', encoding='utf-8') as f:
                    articles_data = json.load(f)
                
                # Assign random users
                users = User.query.all()
                import random
                
                for data in articles_data:
                    u = random.choice(users)
                    a = Article(
                        title=data['title'],
                        text=data['text'],
                        category=data['category'],
                        user_id=u.id
                    )
                    db.session.add(a)
                db.session.commit()
            except Exception as e:
                print("Failed to load habr_articles.json:", e)



@app.route("/")
def index():
    page = request.args.get("page", 1, type=int)
    if page < 1:
        page = 1
    pagination = Article.query.order_by(Article.created_date.desc()).paginate(
        page=page, per_page=DEFAULT_PER_PAGE
    )
    return render_template("index.html", articles=pagination.items, pagination=pagination)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/feedback", methods=["GET", "POST"])
def feedback():
    errors = {}
    data = {}
    if request.method == "POST":
        name = sanitize_html(request.form.get("name", "").strip())
        email = sanitize_html(request.form.get("email", "").strip())
        message = sanitize_html(request.form.get("message", "").strip())
        if not name:
            errors["name"] = "Имя обязательно для заполнения."
        if not email:
            errors["email"] = "Email обязателен для заполнения."
        elif "@" not in email or "." not in email:
            errors["email"] = "Введите корректный email."
        if not message:
            errors["message"] = "Сообщение обязательно для заполнения."
        if not errors:
            return render_template("feedback.html", submitted=True, data={"name": name, "email": email, "message": message})
        data = {"name": name, "email": email, "message": message}
    return render_template("feedback.html", errors=errors, data=data)


@app.route("/articles")
def articles_list():
    page = request.args.get("page", 1, type=int)
    q = request.args.get("q", "").strip()
    if page < 1:
        page = 1
    query = Article.query.order_by(Article.created_date.desc())
    if q:
        query = query.filter(
            or_(Article.title.ilike(f"%{q}%"), Article.text.ilike(f"%{q}%"))
        )
    pagination = query.paginate(page=page, per_page=10)
    return render_template(
        "articles_list.html",
        articles=pagination.items,
        category=None,
        pagination=pagination,
        search_query=q,
    )


@app.route("/articles/<category>")
def articles_by_category(category):
    if category not in ARTICLE_CATEGORIES:
        return render_template("articles_list.html", articles=[], category=category, invalid_category=True), 404
    page = request.args.get("page", 1, type=int)
    if page < 1:
        page = 1
    query = Article.query.filter_by(category=category).order_by(Article.created_date.desc())
    pagination = query.paginate(page=page, per_page=10)
    return render_template(
        "articles_list.html",
        articles=pagination.items,
        category=category,
        pagination=pagination,
    )


@app.route("/news/<int:id>")
def article(id):
    article_obj = Article.query.get_or_404(id)
    comments = article_obj.comments.order_by(Comment.date.asc()).all()
    return render_template("article.html", article=article_obj, comments=comments)


@app.route("/news/<int:id>/comment", methods=["POST"])
def add_comment(id):
    article_obj = Article.query.get_or_404(id)
    text = sanitize_html(request.form.get("text", "").strip())
    author_name = sanitize_html(request.form.get("author_name", "").strip())
    if not text:
        flash("Введите текст комментария.", "error")
        return redirect(url_for("article", id=id))
    if not author_name:
        flash("Укажите имя.", "error")
        return redirect(url_for("article", id=id))
    c = Comment(text=text, author_name=author_name, article_id=id)
    db.session.add(c)
    db.session.commit()
    flash("Комментарий добавлен.", "success")
    return redirect(url_for("article", id=id))


@app.route("/create-article", methods=["GET", "POST"])
@login_required
def create_article():
    if request.method == "POST":
        title = sanitize_html(request.form.get("title", "").strip())
        text = sanitize_html(request.form.get("text", "").strip())
        category = sanitize_html(request.form.get("category", "general").strip()) or "general"
        if category not in ARTICLE_CATEGORIES:
            category = "general"
        if not title:
            flash("Введите заголовок.", "error")
            return redirect(url_for("create_article"))
        if not text:
            flash("Введите текст статьи.", "error")
            return redirect(url_for("create_article"))
        try:
            user_id = int(request.form.get("author_id", 0))
        except (TypeError, ValueError):
            user_id = current_user.id
        author = User.query.get(user_id)
        if not author:
            user_id = current_user.id
        a = Article(title=title, text=text, user_id=user_id, category=category)
        db.session.add(a)
        db.session.commit()
        flash("Статья создана.", "success")
        return redirect(url_for("article", id=a.id))
    users = User.query.all()
    return render_template("create_article.html", users=users, categories=ARTICLE_CATEGORIES)


@app.route("/edit-article/<int:id>", methods=["GET", "POST"])
@login_required
def edit_article(id):
    article_obj = Article.query.get_or_404(id)
    if request.method == "POST":
        article_obj.title = sanitize_html(request.form.get("title", "").strip()) or article_obj.title
        article_obj.text = sanitize_html(request.form.get("text", "").strip()) or article_obj.text
        category = sanitize_html(request.form.get("category", "").strip())
        if category in ARTICLE_CATEGORIES:
            article_obj.category = category
        db.session.commit()
        flash("Статья сохранена.", "success")
        return redirect(url_for("article", id=id))
    return render_template("edit_article.html", article=article_obj, categories=ARTICLE_CATEGORIES)


@app.route("/delete-article/<int:id>", methods=["POST"])
@login_required
def delete_article(id):
    article_obj = Article.query.get_or_404(id)
    db.session.delete(article_obj)
    db.session.commit()
    flash("Статья удалена.", "success")
    return redirect(url_for("articles_list"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("index"))
    if request.method == "POST":
        name = sanitize_html(request.form.get("name", "").strip())
        email = sanitize_html(request.form.get("email", "").strip())
        password = request.form.get("password", "")
        if not name or not email or not password:
            flash("Заполните все поля.", "error")
            return redirect(url_for("register"))
        if User.query.filter_by(email=email).first():
            flash("Такой email уже зарегистрирован.", "error")
            return redirect(url_for("register"))
        u = User(name=name, email=email)
        u.set_password(password)
        db.session.add(u)
        db.session.commit()
        login_user(u)
        flash("Регистрация успешна.", "success")
        return redirect(url_for("index"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("index"))
    if request.method == "POST":
        email = sanitize_html(request.form.get("email", "").strip())
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            flash("Вы вошли в систему.", "success")
            next_url = request.args.get("next") or url_for("index")
            return redirect(next_url)
        flash("Неверный email или пароль.", "error")
    return render_template("login.html")


@app.route("/logout")
def logout():
    logout_user()
    flash("Вы вышли из системы.", "info")
    return redirect(url_for("index"))


@app.route("/api/feedback", methods=["POST"])
def api_feedback():
    data = request.get_json(silent=True) or {}
    name = sanitize_html((data.get("name") or "").strip())
    email = sanitize_html((data.get("email") or "").strip())
    message = sanitize_html((data.get("message") or "").strip())
    if not name:
        return jsonify({"error": "Имя обязательно для заполнения."}), 400
    if not email:
        return jsonify({"error": "Email обязателен для заполнения."}), 400
    if "@" not in email or "." not in email:
        return jsonify({"error": "Введите корректный email."}), 400
    if not message:
        return jsonify({"error": "Сообщение обязательно для заполнения."}), 400
    return jsonify({"message": "Спасибо! Ваше сообщение отправлено.", "data": {"name": name, "email": email, "message": message}}), 201


def article_to_dict(a):
    return {
        "id": a.id,
        "title": a.title,
        "text": a.text,
        "created_date": a.created_date.isoformat() if a.created_date else None,
        "user_id": a.user_id,
        "category": a.category,
        "author_name": a.author.name if a.author else None,
    }


@app.route("/api/auth/login", methods=["POST"])
def api_auth_login():
    data = request.get_json(silent=True) or {}
    email = sanitize_html((data.get("email") or "").strip())
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "email и password обязательны"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Неверный email или пароль"}), 401
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
    })


@app.route("/api/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def api_auth_refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    return jsonify({"access_token": access_token})


@app.route("/api/auth/me", methods=["GET"])
@jwt_required(optional=True)
def api_auth_me():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"user": None}), 200
    user = User.query.get(user_id)
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": {"id": user.id, "name": user.name, "email": user.email}})


@app.route("/api/auth/register", methods=["POST"])
def api_auth_register():
    data = request.get_json(silent=True) or {}
    name = sanitize_html((data.get("name") or "").strip())
    email = sanitize_html((data.get("email") or "").strip())
    password = data.get("password") or ""
    if not name or not email or not password:
        return jsonify({"error": "name, email и password обязательны"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Такой email уже зарегистрирован"}), 400
    u = User(name=name, email=email)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    access_token = create_access_token(identity=str(u.id))
    refresh_token = create_refresh_token(identity=str(u.id))
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"id": u.id, "name": u.name, "email": u.email},
    }), 201


def get_api_user():
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id is not None:
            u = User.query.get(user_id)
            if u:
                return u
    except Exception:
        pass
    return current_user if current_user.is_authenticated else None


@app.route("/api/articles", methods=["GET"])
def api_articles_list():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 50)
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    if page < 1:
        page = 1
    query = Article.query.order_by(Article.created_date.desc())
    if category and category in ARTICLE_CATEGORIES:
        query = query.filter_by(category=category)
    if q:
        query = query.filter(
            or_(Article.title.ilike(f"%{q}%"), Article.text.ilike(f"%{q}%"))
        )
    pagination = query.paginate(page=page, per_page=per_page)
    return jsonify({
        "articles": [article_to_dict(a) for a in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    })


@app.route("/api/articles/<int:id>", methods=["GET"])
def api_article_get(id):
    a = Article.query.get_or_404(id)
    return jsonify(article_to_dict(a))


def comment_to_dict(c):
    return {
        "id": c.id,
        "text": c.text,
        "date": c.date.isoformat() if c.date else None,
        "article_id": c.article_id,
        "author_name": c.author_name,
    }


@app.route("/api/articles/<int:id>/comments", methods=["GET"])
def api_article_comments(id):
    Article.query.get_or_404(id)
    comments = Comment.query.filter_by(article_id=id).order_by(Comment.date.asc()).all()
    return jsonify({"comments": [comment_to_dict(c) for c in comments]})


@app.route("/api/articles/<int:id>/comments", methods=["POST"])
def api_article_add_comment(id):
    Article.query.get_or_404(id)
    data = request.get_json(silent=True) or {}
    text = sanitize_html((data.get("text") or "").strip())
    author_name = sanitize_html((data.get("author_name") or "").strip())
    if not text:
        return jsonify({"error": "text обязателен"}), 400
    if not author_name:
        return jsonify({"error": "author_name обязателен"}), 400
    c = Comment(text=text, author_name=author_name, article_id=id)
    db.session.add(c)
    db.session.commit()
    return jsonify(comment_to_dict(c)), 201


@app.route("/api/articles", methods=["POST"])
def api_article_create():
    user = get_api_user()
    if not user:
        return jsonify({"error": "Требуется авторизация"}), 401
    data = request.get_json(silent=True) or {}
    title = sanitize_html((data.get("title") or "").strip())
    text = sanitize_html((data.get("text") or "").strip())
    category = sanitize_html((data.get("category") or "general").strip())
    if category not in ARTICLE_CATEGORIES:
        category = "general"
    if not title or not text:
        return jsonify({"error": "title и text обязательны"}), 400
    a = Article(title=title, text=text, user_id=user.id, category=category)
    db.session.add(a)
    db.session.commit()
    return jsonify(article_to_dict(a)), 201


@app.route("/api/articles/<int:id>", methods=["PUT"])
def api_article_update(id):
    user = get_api_user()
    if not user:
        return jsonify({"error": "Требуется авторизация"}), 401
    a = Article.query.get_or_404(id)
    data = request.get_json(silent=True) or {}
    if data.get("title") is not None:
        a.title = sanitize_html((data["title"] or "").strip()) or a.title
    if data.get("text") is not None:
        a.text = sanitize_html((data["text"] or "").strip()) or a.text
    if data.get("category") in ARTICLE_CATEGORIES:
        a.category = data["category"]
    db.session.commit()
    return jsonify(article_to_dict(a))


@app.route("/api/articles/<int:id>", methods=["DELETE"])
def api_article_delete(id):
    user = get_api_user()
    if not user:
        return jsonify({"error": "Требуется авторизация"}), 401
    a = Article.query.get_or_404(id)
    db.session.delete(a)
    db.session.commit()
    return "", 204


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
