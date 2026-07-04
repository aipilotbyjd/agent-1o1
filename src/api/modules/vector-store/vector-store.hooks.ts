import { useMutation } from '@tanstack/react-query';
import { notify } from '@/api/core';
import { VectorStoreService } from './vector-store.service';
import type { IVectorStoreIngestDto, IVectorStoreQueryDto } from './vector-store.service';

export const useVectorStoreIngest = (ws: string) =>
	useMutation({
		mutationFn: (body: IVectorStoreIngestDto) => VectorStoreService.ingest(ws, body),
		onSuccess: () => notify.success('Documents ingested'),
		onError: notify.fromError('Failed to ingest documents'),
	});

export const useVectorStoreQuery = (ws: string) =>
	useMutation({
		mutationFn: (body: IVectorStoreQueryDto) => VectorStoreService.query(ws, body),
		onError: notify.fromError('Vector search failed'),
	});
