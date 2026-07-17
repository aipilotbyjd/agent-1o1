import { useQuery } from '@tanstack/react-query';
import type { TCredentialTypeFilters } from '@/types/credentialType.type';
import { CredentialTypeService } from './credential-types.service';
import { credentialTypeKeys } from './credential-types.keys';

export const useCredentialTypes = (filters?: TCredentialTypeFilters) =>
	useQuery({
		queryKey: credentialTypeKeys.list(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => CredentialTypeService.list(filters, signal),
		staleTime: 30 * 60 * 1000,
	});

export const useCredentialType = (id: string) =>
	useQuery({
		queryKey: credentialTypeKeys.detail(id),
		queryFn: ({ signal }) => CredentialTypeService.detail(id, signal),
		enabled: !!id,
		staleTime: 30 * 60 * 1000,
	});
