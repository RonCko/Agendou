// src/middlewares/auth.js
export function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash("error", "Você precisa fazer login.");
  return res.redirect("/login");
}

export function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.tipo === "admin") return next();
  req.flash("error", "Acesso negado.");
  return res.redirect("/");
}
