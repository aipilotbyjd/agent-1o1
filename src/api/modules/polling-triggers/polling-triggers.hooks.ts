import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TUpdatePollingTriggerDto } from '@/types/pollingTrigger.type';
import { PollingTriggerService } from './polling-triggers.service';
import { pollingTriggerKeys } from './polling-triggers.keys';

export const usePollingTriggers = (ws: string) =>
	useQuery({
		queryKey: pollingTriggerKeys.list(ws),
		queryFn: ({ signal }) => PollingTriggerService.list(ws, signal),
		enabled: !!ws,
	});

export const usePollingTrigger = (ws: string, id: string) =>
	useQuery({
		queryKey: pollingTriggerKeys.detail(ws, id),
		queryFn: ({ signal }) => PollingTriggerService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useUpdatePollingTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdatePollingTriggerDto }) =>
			PollingTriggerService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: pollingTriggerKeys.all(ws) });
			notify.success('Polling trigger updated');
		},
		onError: notify.fromError('Failed to update polling trigger'),
	});
};

export const useDeletePollingTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => PollingTriggerService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: pollingTriggerKeys.all(ws) });
			notify.success('Polling trigger deleted');
		},
		onError: notify.fromError('Failed to delete polling trigger'),
	});
};
