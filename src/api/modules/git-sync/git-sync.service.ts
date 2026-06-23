import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TGitSyncStatus,
	TGitSyncExportDto,
	TGitSyncImportDto,
	TGitSyncResult,
} from '@/types/gitSync.type';
import { GitSyncEndpoints as E } from './git-sync.endpoints';

export const GitSyncService = {
	status: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TGitSyncStatus>>(E.status(ws), { signal })
			.then(unwrap<TGitSyncStatus>),

	export: (ws: string, body: TGitSyncExportDto) =>
		axiosClient
			.post<TApiResponse<TGitSyncResult>>(E.export(ws), body)
			.then(unwrap<TGitSyncResult>),

	import: (ws: string, body: TGitSyncImportDto) =>
		axiosClient
			.post<TApiResponse<TGitSyncResult>>(E.import(ws), body)
			.then(unwrap<TGitSyncResult>),
};
