import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import { VectorStoreEndpoints as E } from './vector-store.endpoints';

export interface IVectorStoreIngestDto {
	collection: string;
	documents: Array<{
		id?: string;
		content: string;
		metadata?: Record<string, unknown>;
	}>;
}

export interface IVectorStoreIngestResult {
	ingested: number;
	collection: string;
	[key: string]: unknown;
}

export interface IVectorStoreQueryDto {
	collection: string;
	query: string;
	top_k?: number;
	filter?: Record<string, unknown>;
}

export interface IVectorStoreMatch {
	id: string;
	score: number;
	content: string;
	metadata?: Record<string, unknown>;
}

export interface IVectorStoreQueryResult {
	matches: IVectorStoreMatch[];
	[key: string]: unknown;
}

export const VectorStoreService = {
	ingest: (ws: string, body: IVectorStoreIngestDto) =>
		axiosClient
			.post<TApiResponse<IVectorStoreIngestResult>>(E.ingest(ws), body)
			.then(unwrap<IVectorStoreIngestResult>),

	query: (ws: string, body: IVectorStoreQueryDto) =>
		axiosClient
			.post<TApiResponse<IVectorStoreQueryResult>>(E.query(ws), body)
			.then(unwrap<IVectorStoreQueryResult>),
};
