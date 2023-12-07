const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "dw9Uv3" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "dw9Uv3" }
};

hashPassword = bcrypt.hashSync("123", 10);

const users = {
  "dw9Uv3": {
    id: "dw9Uv3",
    email: "louis.k.hu@gmail.com",
    password: hashPassword
  }
};

const generateRandomString = (urlDB) => {
  const id = Math.random().toString(20).substr(2, 6);
  if (urlDB[id]) {
    return generateRandomString(urlDB);
  }
  return id;
};

const userLookupByEmail = (email, userDB) => {
  for (user in userDB) {
    if (userDB[user].email === email) {
      return userDB[user];
    }
  }
  return null;
};

const urlsForUser = (id, urlDB) => {
  let list = {};
  for (entry in urlDB) {
    if (urlDB[entry].userID === id) {
      list[entry] = urlDB[entry];
    }
  }
  return list;
};

const matchUrlIdUserId = (req, urlDB) => {
  if (urlDB[req.params.id].userID === req.session.user_id) {
    return true;
  }
  return false;
};

const sendNotLoggedIn = (res) => {
  res.status(401);
  return res.send("You are not logged in!");
};

const sendUnauthorized = (res) => {
  res.status(401);
  return res.send("You are not authorized to view or change this short URL");
};

const sendShortURLNotExist = (res) => {
  res.status(404);
  return res.send("Short URL ID does not exist!");
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["thisisalongsecretkey"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
  const id = req.session.user_id;
  if (!id) {
    return sendNotLoggedIn(res);
  };
  const list = urlsForUser(id, urlDatabase);
  const templateVars = { urls: list, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  };
  const templateVars = { user: users[id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return sendNotLoggedIn(res);
  }
  if (!urlDatabase[req.params.id]) {
    return sendShortURLNotExist(res);
  }
  if (urlDatabase[req.params.id].userID !== user_id) { // if short url id does not match logged in user id
    return sendUnauthorized(res);
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return sendShortURLNotExist(res);
  }
  res.redirect(`${urlDatabase[req.params.id].longURL}`);
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  if (id) { 
    return res.redirect("/urls");
  };
  const templateVars = { user: users[id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  if (id) {
   return res.redirect("/urls");
  };
  const templateVars = { user: users[id] };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return sendNotLoggedIn(res);
  };
  id = generateRandomString(urlDatabase);
  urlDatabase[id] = { longURL: req.body.longURL, userID: user_id };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return sendNotLoggedIn(res);
  }  
  if (!urlDatabase[req.params.id]) {
    return sendShortURLNotExist(res);
  }
  if (!matchUrlIdUserId(req, urlDatabase)) {
    return sendUnauthorized(res);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return sendNotLoggedIn(res);
  }
  if (!urlDatabase[req.params.id]) {
    return sendShortURLNotExist(res);
  }
  if (!matchUrlIdUserId(req, urlDatabase)) {
    return sendUnauthorized(res);
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  user = userLookupByEmail(req.body.email, users);
  if (!user) { // if user is null (cannot be found)
    return res.sendStatus(403);
  };
  const passwordMatch = bcrypt.compareSync(req.body.password, user.password);
  if (user && !passwordMatch) { // if user is found and password does NOT match
    return res.sendStatus(403);
  }
  req.session.user_id = user.id; // user is found and password does match, set the user_id cookie with their id
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || userLookupByEmail(req.body.email, users)) {
    return res.sendStatus(400);
  };
  id = generateRandomString(urlDatabase);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[id] = { id, email: req.body.email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});