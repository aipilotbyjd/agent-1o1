import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	ICredential,
	ICredentialDetail,
	ICreateCredentialDto,
	IUpdateCredentialDto,
	ICredentialFilters,
	IOAuthAuthResponse,
	IOAuthProvider,
	IOAuthResult,
	IShareCredentialDto,
	IStartOAuthDto,
	IUpdateSharingScopeDto,
} from '@/types/credential.type';
import { CredentialEndpoints as E, OAuthEndpoints as O } from './credentials.endpoints';

type TCredentialWire = Partial<ICredential> & {
	id: string;
	name: string;
	credential_type_id?: string;
	credential_type?: {
		id?: string;
		type?: string;
		name?: string;
	};
};

const normalizeCredential = (item: TCredentialWire): ICredential => ({
	...item,
	id: item.id,
	name: item.name,
	type:
		item.type ??
		item.credential_type?.type ??
		item.credential_type_id ??
		item.credential_type?.id ??
		'unknown',
	created_at: item.created_at ?? new Date().toISOString(),
	updated_at: item.updated_at ?? item.created_at ?? new Date().toISOString(),
});

export const CredentialService = {
	list: (ws: string, filters?: ICredentialFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TCredentialWire[]>>(E.list(ws), { params: filters, signal })
			.then(unwrap<TCredentialWire[]>)
			.then((items) => items.map(normalizeCredential)),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ICredentialDetail>>(E.detail(ws, id), { signal })
			.then(unwrap<ICredentialDetail>),

	create: (ws: string, body: ICreateCredentialDto) =>
		axiosClient
			.post<TApiResponse<TCredentialWire>>(E.create(ws), body)
			.then(unwrap<TCredentialWire>)
			.then(normalizeCredential),

	update: (ws: string, id: string, body: IUpdateCredentialDto) =>
		axiosClient
			.put<TApiResponse<ICredential>>(E.update(ws, id), body)
			.then(unwrap<ICredential>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	test: (ws: string, id: string) =>
		axiosClient
			.post<TApiResponse<{ success: boolean; message: string }>>(E.test(ws, id))
			.then(unwrap<{ success: boolean; message: string }>),

	refreshToken: (ws: string, id: string) =>
		axiosClient
			.post<TApiResponse<ICredential>>(E.refreshToken(ws, id))
			.then(unwrap<ICredential>),

	share: (ws: string, id: string, body: IShareCredentialDto) =>
		axiosClient
			.post<TApiResponse<ICredential>>(E.share(ws, id), body)
			.then(unwrap<ICredential>),

	unshare: (ws: string, id: string, userId: string) =>
		axiosClient.delete(E.unshare(ws, id, userId)).then(() => undefined),

	updateSharingScope: (ws: string, id: string, body: IUpdateSharingScopeDto) =>
		axiosClient
			.patch<TApiResponse<ICredential>>(E.sharingScope(ws, id), body)
			.then(unwrap<ICredential>),
};

export const OAuthService = {
	providers: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IOAuthProvider[]>>(O.providers(), { signal })
			.then(unwrap<IOAuthProvider[]>),

	getAuthorizeUrl: (ws: string, params: string | IStartOAuthDto) =>
		axiosClient
			.post<
				TApiResponse<IOAuthAuthResponse>
			>(O.authorizeUrl(ws), typeof params === 'string' ? { credential_type: params, credential_id: null } : params)
			.then(unwrap<IOAuthAuthResponse>),

	initiate: (ws: string, body: IStartOAuthDto) =>
		axiosClient
			.post<TApiResponse<IOAuthAuthResponse>>(O.initiate(ws), body)
			.then(unwrap<IOAuthAuthResponse>),
};

const OAUTH_POPUP_FEATURES = 'width=600,height=700,left=400,top=100,scrollbars=yes,resizable=yes';

export const connectOAuthCredential = async (
	workspaceId: string,
	credentialType: string,
	existingCredentialId?: string | null,
): Promise<IOAuthResult> => {
	const { authorization_url } = await OAuthService.initiate(workspaceId, {
		credential_type: credentialType,
		credential_id: existingCredentialId ?? null,
	});

	const popup = window.open(authorization_url, 'oauth_connect', OAUTH_POPUP_FEATURES);

	if (!popup) {
		throw new Error('Popup blocked. Please allow popups and try again.');
	}

	return new Promise((resolve, reject) => {
		const cleanup = () => {
			clearInterval(closedTimer);
			clearTimeout(timeoutTimer);
			window.removeEventListener('message', onMessage);
		};

		const closedTimer = window.setInterval(() => {
			if (popup.closed) {
				cleanup();
				reject(new Error('Popup closed before completing authorization.'));
			}
		}, 500);

		const timeoutTimer = window.setTimeout(
			() => {
				cleanup();
				popup.close();
				reject(new Error('OAuth timed out. Please try again.'));
			},
			15 * 60 * 1000,
		);

		function onMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
			if (event.data?.type !== 'OAUTH_COMPLETE') return;

			cleanup();

			const result: IOAuthResult = {
				success: event.data.success === true,
				credentialId: event.data.credentialId ?? null,
				credentialType: event.data.credentialType ?? null,
				stateToken: event.data.stateToken ?? null,
				error: event.data.error ?? null,
			};

			if (result.success) {
				resolve(result);
			} else {
				reject(new Error(result.error ?? 'OAuth authorization failed.'));
			}
		}

		window.addEventListener('message', onMessage);
	});
};
