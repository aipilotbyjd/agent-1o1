import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	TCreateLogStreamingConfigDto,
	TUpdateLogStreamingConfigDto,
} from '@/types/logStreaming.type';
import { LogStreamingService } from './log-streaming.service';
import { logStreamingKeys } from './log-streaming.keys';

export const useLogStreamingConfigs = (ws: string) =>
	useQuery({
		queryKey: logStreamingKeys.list(ws),
		queryFn: ({ signal }) => LogStreamingService.list(ws, signal),
		enabled: !!ws,
	});

export const useLogStreamingConfig = (ws: string, id: string) =>
	useQuery({
		queryKey: logStreamingKeys.detail(ws, id),
		queryFn: ({ signal }) => LogStreamingService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCreateLogStreamingConfig = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateLogStreamingConfigDto) => LogStreamingService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: logStreamingKeys.all(ws) });
			notify.success('Log stream created');
		},
		onError: notify.fromError('Failed to create log stream'),
	});
};

export const useUpdateLogStreamingConfig = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateLogStreamingConfigDto }) =>
			LogStreamingService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: logStreamingKeys.all(ws) });
			notify.success('Log stream updated');
		},
		onError: notify.fromError('Failed to update log stream'),
	});
};

export const useDeleteLogStreamingConfig = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => LogStreamingService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: logStreamingKeys.all(ws) });
			notify.success('Log stream deleted');
		},
		onError: notify.fromError('Failed to delete log stream'),
	});
};
