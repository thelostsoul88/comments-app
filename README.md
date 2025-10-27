### Comments App

## Описание проекта

# Comments App — это полнофункциональное веб-приложение для добавления и отображения комментариев с возможностью:

отвечать на другие комментарии (вложенные цепочки);

прикладывать изображения или текстовые файлы;

использовать разрешённые HTML-теги в тексте;

проходить CAPTCHA при добавлении комментариев;

просматривать файлы с визуальными эффектами (lightbox);

сортировать, фильтровать и валидировать данные;

использовать безопасную ORM и защиту от XSS/SQL-инъекций.

Приложение реализовано в виде SPA (Single Page Application) на React + Express + PostgreSQL, полностью контейнеризировано в Docker и соответствует всем пунктам тестового задания.

## Технологии:

# Frontend:

React (Vite), Axios, Lightbox, Toastify

# Backend:

ExpressJS, TypeORM, Multer, Sharp

# База данных:

PostgreSQL (через ORM)

# Контейнеризация:

Docker, docker-compose

# Realtime WebSocket:

(Socket.io)

# Валидация и защита:

Joi, sanitize-html, регулярные выражения

# Капча:

PNG CAPTCHA (node-captcha)

## Основной функционал:

# Добавление комментария

Пользователь заполняет форму:

User Name — только латиница и цифры (обязательно)

E-mail — формат email (обязательно)

Home page — ссылка, опционально

CAPTCHA — изображение с символами, обязательное поле

Text — само сообщение (разрешены только <a>, <i>, <strong>, <code>)

Комментарии проходят серверную и клиентскую валидацию.

# Вложения

Можно прикрепить изображение (.jpg, .png, .gif) до 320×240

При превышении размера — происходит автоматическое масштабирование.

Можно прикрепить текстовый файл .txt до 100 КБ

Все файлы сохраняются на сервере и отображаются с эффектом lightbox при просмотре.

# Отображение комментариев

Заглавные комментарии отображаются в виде таблицы.

Возможна сортировка по:

имени пользователя (A–Z / Z–A);

email (A–Z / Z–A);

дате добавления (по возрастанию / убыванию).

По умолчанию используется сортировка LIFO (новые первыми).

Комментарии пагинированы по 25 штук на страницу.

Вложенные ответы отображаются каскадно под родительским комментарием.

# Защита

SQL-инъекции: предотвращены через ORM (TypeORM и параметризованные запросы).

XSS: разрешены только безопасные теги; выполняется HTML-санация.

Проверка XHTML — закрытие тегов, валидная структура.

CAPTCHA — защита от ботов и спама.

# Клиентская логика (AJAX):

Все действия выполняются без перезагрузки страницы (fetch/AJAX).

Есть панель форматирования [i] [strong] [code] [a].

Встроена валидация данных (email, captcha, размер файлов).

Реализованы визуальные эффекты: плавные переходы, lightbox, уведомления Toastify.

Возможность вложенных ответов (комментарии к комментариям).

Опциональный предпросмотр сообщения.

## Структура проекта

comments-app/
│
├── backend/
│ ├── src/
│ │ ├── entities/ # TypeORM Entities (User, Comment, File)
│ │ ├── routes/ # Express маршруты API
│ │ ├── utils/ # Капча, загрузка файлов, санитизация
│ │ ├── db.js # Подключение TypeORM + PostgreSQL
│ │ └── server.js # Точка входа
│ ├── Dockerfile
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Компоненты React (CommentTable, Form, Lightbox)
│ │ ├── services/ # API-запросы
│ │ ├── styles/ # CSS
│ │ └── main.jsx
│ ├── Dockerfile
│ └── vite.config.js
│
├── docs/
│ ├── schema.mysql.sql # Схема БД (MySQL)
│ └── schema.png # Диаграмма для MySQL Workbench
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md

## Запуск проекта

1. Клонирование
   git clone https://github.com/thelostsoul88/comments-app.git
   cd comments-app

2. Настройка .env

Пример:

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=comments
POSTGRES_HOST=db
POSTGRES_PORT=5432

BACKEND_PORT=3000
FRONTEND_PORT=5173

SHOW_MESSAGE_PREVIEW=false
VITE_SHOW_MESSAGE_PREVIEW=${SHOW_MESSAGE_PREVIEW}

3. Запуск в Docker
   docker compose up --build

# После запуска:

Frontend: http://localhost:5173

Backend (API): http://localhost:3000/api
