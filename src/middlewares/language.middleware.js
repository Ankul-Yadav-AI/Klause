export const languageMiddleware = (req, res, next) => {
  const lang =
    req.headers["accept-language"] ||
    req.query.lang ||
    "en";

  req.lang = ["en", "hi", "de", "fr", "es", "it"].includes(lang) ? lang : "en";
  next();
};
