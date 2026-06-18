import type { TListParams } from '@/api/core';

export const credentialTypeKeys = {
	all: () => ['credential-types'] as const,
	list: (params?: TListParams) => ['credential-types', 'list', params] as const,
	detail: (id: string) => ['credential-types', 'detail', id] as const,
};
