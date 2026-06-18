import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TInvitation } from '@/types/invitation.type';
import { InvitationEndpoints as E } from './invitations.endpoints';

export const InvitationService = {
	accept: (token: string) =>
		axiosClient.post<TApiResponse<TInvitation>>(E.accept(token)).then(unwrap<TInvitation>),

	decline: (token: string) =>
		axiosClient.post<TApiResponse<TInvitation>>(E.decline(token)).then(unwrap<TInvitation>),
};
