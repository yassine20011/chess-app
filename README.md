# chess-app

## Introduction

The idea behind this project is to create a chess game that can be played by two players. The game will be implemented in using Laravel and React.js, along with Inertia.js. if unfamiliar with inertia.js is, you can find more information about it [here](https://inertiajs.com/).

I am creating this project, first of all, because I love playing chess. Secondly, i want to learn more about Laravel and explore Websockets. I'll be using Laravel broadcasting to implement the real-time functionality of the game, and I will use react.js just because i used to it.

The first move ♟️ is to create a conceptual plan for the project. you can find the conception below [here](#conception-of-the-project).

**What is inertia.js?**

Inertia.js lets you quickly build modern single-page React, Vue and Svelte apps using classic server-side routing and controllers. It provides the best of both worlds by giving you the simplicity of classic server-driven apps with the performance of single-page apps.

If you are reading this and you want to test the project, you can clone the project and run the following commands:

```bash
git clone https://github.com/yassine20011/chess-app.git
```

Then you need to install the dependencies:

```bash
composer install
npm install
```

Then you need to create a `.env` file and add the following content:

```bash
cp .env.example .env
```

You will find a `docker-compose` file in the project, you can use it to run postgresql database, you can run the following command to start the database:

```bash
docker compose up -d
```

Then you need to run the migrations:

```bash
php artisan migrate
```

Then you can run the project using the following command:

```
php artisan serve
```

You are not done yet, you need to run the following commands to start the websockets server and the queue listener:

```bash
php artisan reverb:start
# and open a new terminal and run the following command
php artisan queue:listen
# finally open a new terminal and run the following command
npm run dev
```

# Conception of the project

## Use case diagram

<center>
    <img src="use-case-diagram.svg" alt="Use case diagram" width="900" height="900"/>
</center>

## Class diagram

<center>
    <img src="class-diagram.svg" alt="Class diagram" width="900" height="900"/>
</center>

## Sequence diagram

<center>
    <img src="sequence-diagram.svg" alt="Sequence diagram" width="900" height="900"/>
</center>

## Activity Diagram

<center>
    <img src="activity-diagram.svg" alt="Activity diagram" width="900" height="900"/>
</center>
