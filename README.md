# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product


!["screenshot of urls list"](https://github.com/Racingwind/tinyapp/blob/master/docs/urls-page.PNG?raw=true)
!["screenshot of an url entry"](https://github.com/Racingwind/tinyapp/blob/master/docs/shorturl-entry.PNG?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features

- The web application includes a login and register page.
- It allows creation of new shorthand urls and only shows / allows updates to short url entries that belongs to the currently logged in user.
- It also follows best security practice and encrypts all passwords and cookies!