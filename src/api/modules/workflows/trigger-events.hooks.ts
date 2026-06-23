import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import { TriggerEventService } from './trigger-events.service';
import { workflowKeys } from './workflows.keys';

export const useTriggerEvents = (ws: string, triggerId: string, params?: TListParams) =>
	useQuery({
		queryKey: workflowKeys.triggerEvents(ws, triggerId),
		queryFn: ({ signal }) => TriggerEventService.list(ws, triggerId, params, signal),
		enabled: !!ws && !!triggerId,
	});

export const useReplayTriggerEvent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ triggerId, eventId }: { triggerId: string; eventId: string }) =>
			TriggerEventService.replay(ws, triggerId, eventId),
		onSuccess: (_data, { triggerId }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.triggerEvents(ws, triggerId) });
			notify.success('Event replayed');
		},
		onError: notify.fromError('Failed to replay event'),
	});
};
