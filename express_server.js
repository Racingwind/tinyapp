const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, userLookupByEmail, urlsForUser, matchUrlIdUserId, sendNotLoggedIn, sendUnauthorized, sendShortURLNotExist } = require("./helpers");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "dw9Uv3" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "dw9Uv3" }
};

const hashPassword = bcrypt.hashSync("123", 10);

const users = {
  "dw9Uv3": {
    id: "dw9Uv3",
    email: "louis.k.hu@gmail.com",
    password: hashPassword
  }
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
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => { // shows a list of urls that has user id matching to logged in user
  const id = req.session.user_id;
  if (!id) {
    return sendNotLoggedIn(res);
  }
  const list = urlsForUser(id, urlDatabase);
  const templateVars = { urls: list, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // shows a form to enter data for creating new short url
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // show a page with specified short url if its user id matches to logged in user
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

app.get("/u/:id", (req, res) => { // redirects to the long url the shorthand represents
  if (!urlDatabase[req.params.id]) {
    return sendShortURLNotExist(res);
  }
  res.redirect(`${urlDatabase[req.params.id].longURL}`);
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[id] };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => { // this route handles creating new short urls
  const user_id = req.session.user_id;
  if (!user_id) {
    return sendNotLoggedIn(res);
  }
  // create new short url entry by generating an unique id
  const id = generateRandomString(urlDatabase);
  urlDatabase[id] = { longURL: req.body.longURL, userID: user_id };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => { // this route handles deleting short urls
  if (!req.session.user_id) { // user not logged in
    return sendNotLoggedIn(res);
  }
  if (!urlDatabase[req.params.id]) { // short url id not found
    return sendShortURLNotExist(res);
  }
  if (!matchUrlIdUserId(req, urlDatabase)) { // short url user id not match user id
    return sendUnauthorized(res);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { // this route handles updating short urls.
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

app.post("/login", (req, res) => { // this route handles login requests
  const user = userLookupByEmail(req.body.email, users);
  if (!user) { // if user is null (cannot be found)
    res.status(403);
    return res.send("Account does not exist");
  }
  const passwordMatch = bcrypt.compareSync(req.body.password, user.password);
  if (user && !passwordMatch) { // if user is found and password does NOT match
    res.status(403);
    return res.send("Invalid password");
  }
  req.session.user_id = user.id; // user is found and password does match, set the user_id cookie with their id
  res.redirect("/urls");
});

app.post("/logout", (req, res) => { // this route handles logout requests
  req.session = null; // removes user id cookie
  res.redirect("/login");
});

app.post("/register", (req, res) => { // this route handles registeration requests
  if (userLookupByEmail(req.body.email, users)) {
    res.status(403);
    return res.send("An account with this email already exist");
  }  
  if (req.body.email === "" || req.body.password === "") {
    res.status(403);
    return res.send("Email or password field cannot be empty");
  }
  // create new user by generating a new ID and encrypt the password
  const id = generateRandomString(urlDatabase);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[id] = { id, email: req.body.email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});