import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import { ReplayPackService } from './replay-packs.service';
import { executionKeys } from './executions.keys';

export const useReplayPacks = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: executionKeys.replayPacks(ws),
		queryFn: ({ signal }) => ReplayPackService.list(ws, params, signal),
		enabled: !!ws,
	});

export const useCreateReplayPack = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ executionId, body }: { executionId: string; body?: { name?: string } }) =>
			ReplayPackService.create(ws, executionId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.replayPacks(ws) });
			notify.success('Replay pack saved');
		},
		onError: notify.fromError('Failed to save replay pack'),
	});
};

export const useReplayFromPack = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (replayPackId: string) => ReplayPackService.replay(ws, replayPackId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Replay started');
		},
		onError: notify.fromError('Failed to replay'),
	});
};
