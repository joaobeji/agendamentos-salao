/**
 * @file agendamentoRoutes.ts
 * @description Definição das rotas da API REST para o sistema do salão.
 */

import { Router } from "express";
import {
  listarServicos,
  criarAgendamento,
  listarAgendamentos,
  atualizarAgendamento,
  desempenhoSemanal,
  fazerLogin,
} from "../controllers/agendamentoController";

const router = Router();

router.post("/login", fazerLogin);
router.get("/servicos", listarServicos);
router.post("/agendamentos", criarAgendamento);
router.get("/agendamentos", listarAgendamentos);
router.put("/agendamentos/:id", atualizarAgendamento);
router.get("/relatorios/desempenho-semanal", desempenhoSemanal);

export default router;
