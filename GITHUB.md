# Как залить проект на GitHub

## 1. Создайте репозиторий на GitHub

1. Зайдите на https://github.com/new
2. Укажите имя репозитория (например, `webchik-laba2` или `novostnik`)
3. **Не** ставьте галочки "Add a README" и "Add .gitignore" — репозиторий должен быть пустым
4. Нажмите **Create repository**

## 2. Выполните команды в терминале

Откройте терминал в папке проекта `laba2` и выполните по порядку:

```bash
# Инициализация репозитория
git init

# Добавить все файлы (исключения — в .gitignore)
git add .

# Первый коммит
git commit -m "Новостник: лабы 2–6 — Flask, API, JWT, React"

# Замените YOUR_USERNAME и YOUR_REPO на свои (например: ilaar/webchik-laba2)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Основная ветка (если GitHub просит main)
git branch -M main

# Отправка на GitHub
git push -u origin main
```

## 3. Если GitHub запросит логин/пароль

- **Пароль** от аккаунта GitHub больше не подходит для `git push`.
- Используйте **Personal Access Token**:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token, отметьте `repo`
  3. Скопируйте токен и введите его вместо пароля при `git push`

Либо настройте **SSH** и добавьте remote так:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Повторные заливки (после изменений)

```bash
git add .
git commit -m "Описание изменений"
git push
```
