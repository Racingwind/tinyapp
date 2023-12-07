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

module.exports = { generateRandomString, userLookupByEmail, urlsForUser, matchUrlIdUserId, sendNotLoggedIn, sendUnauthorized, sendShortURLNotExist };