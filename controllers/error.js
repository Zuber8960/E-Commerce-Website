exports.get404 = (req, res, next) => {
  res.status(404).send(`<html>Go to frontend Page ==> <a href=http://${req.host}:4000/store.html>Click me</a></html>`);
};
