import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TCredentialType, TCredentialTypeFilters } from '@/types/credentialType.type';
import { CredentialTypeEndpoints as E } from './credential-types.endpoints';

type TCredentialTypeWire = Partial<TCredentialType> & {
	id: string;
	name: string;
	type?: string;
	key?: string;
	auth_type?: string;
	oauth?: unknown;
	fields?: TCredentialType['fields_schema'];
	schema?: TCredentialType['fields_schema'];
};

const normalizeCredentialType = (item: TCredentialTypeWire): TCredentialType => ({
	id: item.id,
	type: item.type ?? item.key ?? item.id,
	name: item.name,
	description: item.description ?? '',
	icon: item.icon ?? '',
	color: item.color ?? '#6D28D9',
	auth_type: item.auth_type ?? (item.oauth_config || item.oauth ? 'oauth' : 'api_key'),
	fields_schema: item.fields_schema ??
		item.schema ??
		item.fields ?? {
			required: [],
			properties: {},
		},
	oauth_config: item.oauth_config ?? null,
	docs_url: item.docs_url ?? null,
});

export const CredentialTypeService = {
	list: (filters?: TCredentialTypeFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TCredentialTypeWire[]>>(E.list, { params: filters, signal })
			.then(unwrap<TCredentialTypeWire[]>)
			.then((items) => items.map(normalizeCredentialType)),

	detail: (id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TCredentialTypeWire>>(E.detail(id), { signal })
			.then(unwrap<TCredentialTypeWire>)
			.then(normalizeCredentialType),
};
