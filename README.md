# Новостник

Веб-приложение на Flask.

## Запуск

```bash
pip install -r requirements.txt
python app.py
```

При первом запуске создаётся БД `blog.db` и добавляются тестовые пользователи (admin@blog.local / admin, author@blog.local / author) и несколько статей.

Откройте в браузере: http://127.0.0.1:5000/

---

## Лаба 2

| Пункт | Описание |
|-------|----------|
| **A** | Главная, маршруты `/about`, `/contact` |
| **B** | Базовый шаблон `base.html` с меню и блоками |
| **C** | CSS, логотип на всех страницах |
| **D** | Форма `/feedback` с валидацией, GET/POST |
| **E** | Маршрут `/news/<id>` |
| **F** | Меню со ссылками на все страницы |
| **G** | Список статей на главной |
| **H** | Значок «Новое!» для статей за сегодня |

---

## Лаба 3

### A. Модели
- **User**: id, name, email, hashed_password, created_date
- **Article**: id, title, text, created_date, user_id, category
- Связь один ко многим: автор → статьи

### B. CRUD статей
- **GET/POST** `/create-article` — форма создания (выбор автора из БД)
- **GET/POST** `/edit-article/<id>` — страница редактирования
- **POST** `/delete-article/<id>` — удаление статьи

### C. Фильтрация
- **GET** `/articles` — список всех статей
- **GET** `/articles/<category>` — статьи по категории (general, python, flask, web, news); неверная категория → 404

### D. Комментарии
- Модель **Comment**: id, text, date, article_id, author_name
- Форма добавления комментария на странице статьи
- Вывод всех комментариев к статье

### E. Аутентификация
- **GET/POST** `/register` — регистрация
- **GET/POST** `/login` — вход, **GET** `/logout` — выход
- Создавать и редактировать статьи могут только авторизованные пользователи

## Маршруты

| Маршрут | Описание |
|---------|----------|
| `/` | Главная (последние статьи) |
| `/articles` | Все статьи |
| `/articles/<category>` | Статьи по категории |
| `/news/<id>` | Страница статьи + комментарии |
| `/create-article` | Создать статью (только для авторизованных) |
| `/edit-article/<id>` | Редактировать (только для авторизованных) |
| `/delete-article/<id>` | POST: удалить статью |
| `/register`, `/login`, `/logout` | Регистрация и вход |
| `/about`, `/contact`, `/feedback` | О проекте, контакты, обратная связь |

### Лаба 4: API, пагинация, поиск

| Маршрут | Описание |
|---------|----------|
| `GET /api/articles` | Список статей (JSON). Параметры: `page`, `per_page`, `q` (поиск) |
| `GET /api/articles/<id>` | Одна статья (JSON) |
| `POST /api/articles` | Создать статью (JSON, только для авторизованных) |
| `PUT /api/articles/<id>` | Обновить статью (только для авторизованных) |
| `DELETE /api/articles/<id>` | Удалить статью (только для авторизованных) |

- **Пагинация**: на главной (5 статей на страницу) и на `/articles` (10 на страницу). Параметр `?page=2`.
- **Поиск**: на странице «Статьи» поле поиска по заголовку и тексту (`?q=...`).

---

## Лаба 5: JWT

- **Эндпоинты токенов:**
  - `POST /api/auth/login` — тело: `{ "email", "password" }` → `{ access_token, refresh_token, user }`
  - `POST /api/auth/refresh` — заголовок `Authorization: Bearer <refresh_token>` → `{ access_token }`
- **Проверка JWT:** запросы к `POST/PUT/DELETE /api/articles` принимают либо сессию (веб), либо заголовок `Authorization: Bearer <access_token>`.
- **Срок жизни:** access — 15 мин, refresh — 7 дней.
- Дополнительно для фронтенда: `GET /api/auth/me`, `POST /api/auth/register`, `GET/POST /api/articles/<id>/comments`.

---

## Лаба 6: Фронтенд (Vue 3 SPA)

В папке `frontend/` — отдельное приложение на Vue 3 + Vite.

- **Без UI-библиотек** — свои стили в `src/assets/style.css`.
- **Авторизация по JWT:** логин/регистрация, хранение access/refresh в localStorage, автоматическое обновление access по refresh при 401.
- **Страницы:** главная (список статей, поиск, пагинация), статья (комментарии, форма комментария), вход, регистрация, создание/редактирование статьи (для авторизованных).
- **Линтер и форматер:** ESLint (`npm run lint`) и Prettier (`npm run format`) в `frontend/`.

### Запуск фронтенда

```bash
# Бэкенд (в корне проекта)
pip install -r requirements.txt
python app.py

# Фронтенд (в другом терминале)
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173 — запросы к `/api` проксируются на http://127.0.0.1:5000.
