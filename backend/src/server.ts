import express from "express";
import cors from "cors";
import { initDatabase } from "./models/databaseModel";
import agendamentoRoutes from "./routes/agendamentoRoutes";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rota de Boas-vindas
app.get("/", (req, res) => {
  res.json({
    message: "API do Salão da Cabeleleila Leila rodando com sucesso!",
  });
});

// Registrar rotas do sistema
app.use("/api", agendamentoRoutes);

// Inicializa o banco de dados SQLite e sobe o servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar o banco de dados:", err);
  });
