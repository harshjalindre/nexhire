import type { FastifyRequest } from "fastify";

export interface PaginationParams { page: number; limit: number; skip: number; }
export function getPagination(req: FastifyRequest): PaginationParams { const query = req.query as Record<string, string>; const page = Math.max(1, parseInt(query.page || "1")); const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20"))); return { page, limit, skip: (page - 1) * limit }; }
export function paginatedResponse<T>(data: T[], total: number, pagination: PaginationParams) { return { data, total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) }; }
