exports.get404 = (req, res, next) => {
  res.status(404).send(`<html><title>Error Page</title>Oops ! go to Homepage <a href=http://${req.host}:4000/store.html><button>Click here</button></a></html>`);
};
