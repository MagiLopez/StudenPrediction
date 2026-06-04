import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
})

export async function registrarYPredict(data) {
  const response = await api.post("/api/v1/register-predict", data)
  return response.data
}

export async function getHistorial(pagina = 1, porPagina = 20) {
  const response = await api.get("/api/v1/estudiantes", { params: { pagina, por_pagina: porPagina } })
  return response.data
}

export async function getEstudianteDetalle(id) {
  const response = await api.get(`/api/v1/estudiantes/${id}`)
  return response.data
}

export async function predictBatch(students) {
  const response = await api.post("/api/v1/predict/batch", { students })
  return response.data
}

export async function getIndicadores() {
  const response = await api.get("/api/v1/dashboard/indicadores")
  return response.data
}

export default api