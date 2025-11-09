// src/server.js
import app from "./app.js";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
