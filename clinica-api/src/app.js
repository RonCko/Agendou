// src/app.js
import express from "express";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import { engine } from "express-handlebars";

// rotas MVC
import mvcRoutes from "./routes/mvcRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Handlebars com helper "eq"
app.engine("handlebars", engine({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  helpers: {
    eq: (a, b) => a === b
  }
}));

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// session
app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard_cat",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
}));
app.use(flash());

app.engine("handlebars", engine({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  helpers: {
    ifEquals: (a, b, options) => {
      return a == b ? options.fn(this) : options.inverse(this);
    }
  }
}));


// tornar flash e user acessíveis nas views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// rotas MVC
app.use("/", mvcRoutes);

export default app;
