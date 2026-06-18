import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	ICredentialFilters,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	IShareCredentialDto,
	IUpdateSharingScopeDto,
	IStartOAuthDto,
} from '@/types/credential.type';
import { CredentialService, OAuthService, connectOAuthCredential } from './credentials.service';
import { credentialKeys, oauthKeys } from './credentials.keys';
import { authKeys } from '../auth/auth.keys';

// ── Credentials ───────────────────────────────────────────
export const useCredentials = (ws: string, filters?: ICredentialFilters) =>
	useQuery({
		queryKey: credentialKeys.list(ws, filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => CredentialService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useCredential = (ws: string, id: string) =>
	useQuery({
		queryKey: credentialKeys.detail(ws, id),
		queryFn: ({ signal }) => CredentialService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCreateCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateCredentialDto) => CredentialService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			qc.invalidateQueries({ queryKey: authKeys.user() });
			notify.success('Credential created');
		},
		onError: notify.fromError('Failed to create credential'),
	});
};

export const useUpdateCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateCredentialDto }) =>
			CredentialService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success('Credential updated');
		},
		onError: notify.fromError('Failed to update credential'),
	});
};

export const useDeleteCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => CredentialService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success('Credential deleted');
		},
		onError: notify.fromError('Failed to delete credential'),
	});
};

export const useTestCredential = (ws: string) =>
	useMutation({
		mutationFn: (id: string) => CredentialService.test(ws, id),
		onSuccess: (r) => (r.success ? notify.success(r.message) : notify.error(r.message)),
	});

export const useRefreshCredentialToken = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => CredentialService.refreshToken(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success('Credential refreshed');
		},
		onError: notify.fromError('Failed to refresh credential'),
	});
};

export const useShareCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IShareCredentialDto }) =>
			CredentialService.share(ws, id, body),
		onSuccess: (_, { body }) => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success(
				body.is_shared ? 'Credential shared with workspace' : 'Credential unshared',
			);
		},
		onError: notify.fromError('Failed to update sharing'),
	});
};

export const useUnshareCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, userId }: { id: string; userId: string }) =>
			CredentialService.unshare(ws, id, userId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success('Access revoked');
		},
		onError: notify.fromError('Failed to revoke access'),
	});
};

export const useUpdateSharingScope = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateSharingScopeDto }) =>
			CredentialService.updateSharingScope(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			notify.success('Sharing scope updated');
		},
		onError: notify.fromError('Failed to update sharing scope'),
	});
};

// ── OAuth ─────────────────────────────────────────────────
export const useOAuthProviders = () =>
	useQuery({
		queryKey: oauthKeys.providers(),
		queryFn: ({ signal }) => OAuthService.providers(signal),
	});

export const useGetOAuthAuthorizeUrl = (ws: string) =>
	useMutation({
		mutationFn: (params: string | IStartOAuthDto) => OAuthService.getAuthorizeUrl(ws, params),
		onError: notify.fromError('Failed to start OAuth flow'),
	});

export const useStartOAuth = (ws: string) =>
	useMutation({
		mutationFn: (body: IStartOAuthDto) => OAuthService.initiate(ws, body),
		onError: notify.fromError('Failed to start OAuth flow'),
	});

export const useConnectOAuthCredential = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			credentialType,
			credentialId,
		}: {
			credentialType: string;
			credentialId?: string | null;
		}) => connectOAuthCredential(ws, credentialType, credentialId),
		onSuccess: (result) => {
			qc.invalidateQueries({ queryKey: credentialKeys.all(ws) });
			qc.invalidateQueries({ queryKey: authKeys.user() });
			notify.success(`${result.credentialType ?? 'Integration'} connected`);
		},
		onError: notify.fromError('OAuth connection failed'),
	});
};
