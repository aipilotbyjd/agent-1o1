import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TArtifactFilters } from '@/types/artifact.type';
import { ArtifactService } from './artifacts.service';
import { artifactKeys } from './artifacts.keys';

export const useArtifacts = (ws: string, filters?: TArtifactFilters) =>
	useQuery({
		queryKey: artifactKeys.list(ws, filters),
		queryFn: ({ signal }) => ArtifactService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useArtifact = (ws: string, artifactId: string) =>
	useQuery({
		queryKey: artifactKeys.detail(ws, artifactId),
		queryFn: ({ signal }) => ArtifactService.detail(ws, artifactId, signal),
		enabled: !!ws && !!artifactId,
	});

export const useDeleteArtifact = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (artifactId: string) => ArtifactService.remove(ws, artifactId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: artifactKeys.all(ws) });
			notify.success('Artifact deleted');
		},
		onError: notify.fromError('Failed to delete artifact'),
	});
};

export const useDownloadArtifact = (ws: string) =>
	useMutation({
		mutationFn: ({ artifactId, filename }: { artifactId: string; filename: string }) =>
			ArtifactService.download(ws, artifactId, filename),
		onError: notify.fromError('Failed to download artifact'),
	});
