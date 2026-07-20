import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TArtifact, TArtifactFilters } from '@/types/artifact.type';
import { ArtifactEndpoints as E } from './artifacts.endpoints';

export const ArtifactService = {
	list: (ws: string, filters?: TArtifactFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TArtifact[]>>(E.list(ws), { params: filters, signal })
			.then(unwrap<TArtifact[]>),

	detail: (ws: string, artifactId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TArtifact>>(E.detail(ws, artifactId), { signal })
			.then(unwrap<TArtifact>),

	remove: (ws: string, artifactId: string) =>
		axiosClient.delete(E.delete(ws, artifactId)).then(() => undefined),

	download: async (ws: string, artifactId: string, filename: string) => {
		const response = await axiosClient.get(E.download(ws, artifactId), { responseType: 'blob' });
		const url = URL.createObjectURL(response.data as Blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	},
};
