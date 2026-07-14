import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TGitSyncExportDto, TGitSyncImportDto } from '@/types/gitSync.type';
import { GitSyncService } from './git-sync.service';
import { gitSyncKeys } from './git-sync.keys';

export const useGitSyncStatus = (ws: string) =>
	useQuery({
		queryKey: gitSyncKeys.status(ws),
		queryFn: ({ signal }) => GitSyncService.status(ws, signal),
		enabled: !!ws,
	});

export const useGitSyncExport = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TGitSyncExportDto) => GitSyncService.export(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: gitSyncKeys.all(ws) });
			notify.success('Exported to Git');
		},
		onError: notify.fromError('Git export failed'),
	});
};

export const useGitSyncImport = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TGitSyncImportDto) => GitSyncService.import(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: gitSyncKeys.all(ws) });
			qc.invalidateQueries({ queryKey: ['workflows', ws] });
			notify.success('Imported from Git');
		},
		onError: notify.fromError('Git import failed'),
	});
};
