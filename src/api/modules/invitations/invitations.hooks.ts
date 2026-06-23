import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import { InvitationService } from './invitations.service';
import { userInvitationKeys } from './invitations.keys';

export const useAcceptInvitation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (token: string) => InvitationService.accept(token),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: userInvitationKeys.all() });
			qc.invalidateQueries({ queryKey: ['workspaces'] });
			notify.success('Invitation accepted');
		},
		onError: notify.fromError('Failed to accept invitation'),
	});
};

export const useDeclineInvitation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (token: string) => InvitationService.decline(token),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: userInvitationKeys.all() });
			notify.success('Invitation declined');
		},
		onError: notify.fromError('Failed to decline invitation'),
	});
};
