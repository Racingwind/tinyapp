const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "dw9Uv3": {
    id: "dw9Uv3",
    email: "louis.k.hu@gmail.com",
    password: "123"
  }
};

const generateRandomString = () => {
  const id = Math.random().toString(20).substr(2, 6);
  if (urlDatabase[id]) {
    return generateRandomString();
  }
  return id;
};

const userLookup = (email) => {
  for (user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const loggedIn = (cookies) => {
  if (cookies["user_id"]) {
    return true;
  }
  return false;
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b> World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  res.redirect(`${urlDatabase[req.params.id]}`);
});

app.get("/register", (req, res) => {
  if (loggedIn(req.cookies)) {
    return res.redirect("/urls");
   };
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (loggedIn(req.cookies)) {
   return res.redirect("/urls");
  };
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  user = userLookup(req.body.email);
  if (!user) { // if user is null (cannot be found)
    return res.sendStatus(403);
  };
  if (user && user.password !== req.body.password) { // if user is found and password does NOT match
    res.sendStatus(403);
  }
  res.cookie("user_id", user.id); // user is found and password does match, set the user_id cookie with their id
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || userLookup(req.body.email)) {
    return res.sendStatus(400);
  };
  id = generateRandomString();
  users[id] = { id, email: req.body.email, password: req.body.password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});