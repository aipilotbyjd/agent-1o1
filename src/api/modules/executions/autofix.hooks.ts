import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import { AutofixService } from './autofix.service';
import { executionKeys } from './executions.keys';

export const useExecutionAutofix = (ws: string, executionId: string) =>
	useQuery({
		queryKey: executionKeys.autofix(ws, executionId),
		queryFn: ({ signal }) => AutofixService.list(ws, executionId, signal),
		enabled: !!ws && !!executionId,
	});

export const useDiagnoseExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (executionId: string) => AutofixService.diagnose(ws, executionId),
		onSuccess: (_data, executionId) => {
			qc.invalidateQueries({ queryKey: executionKeys.autofix(ws, executionId) });
			notify.success('Fix suggestions generated');
		},
		onError: notify.fromError('Failed to diagnose execution'),
	});
};

export const useApplyFixSuggestion = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ executionId, fixId }: { executionId: string; fixId: string }) =>
			AutofixService.apply(ws, executionId, fixId),
		onSuccess: (_data, { executionId }) => {
			qc.invalidateQueries({ queryKey: executionKeys.autofix(ws, executionId) });
			notify.success('Fix applied');
		},
		onError: notify.fromError('Failed to apply fix'),
	});
};

export const useDismissFixSuggestion = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ executionId, fixId }: { executionId: string; fixId: string }) =>
			AutofixService.dismiss(ws, executionId, fixId),
		onSuccess: (_data, { executionId }) => {
			qc.invalidateQueries({ queryKey: executionKeys.autofix(ws, executionId) });
		},
		onError: notify.fromError('Failed to dismiss fix'),
	});
};
