import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	TUpdateMemberRoleDto,
	TSendInvitationDto,
	TWorkspaceSettings,
} from '@/types/workspace.type';
import {
	WorkspaceMemberService,
	WorkspaceInvitationService,
	WorkspaceSettingsService,
} from './workspace-members.service';
import { workspaceKeys } from '../workspaces/workspaces.keys';
import { memberKeys, invitationKeys, workspaceSettingsKeys } from './workspace-members.keys';

// ── Members ──────────────────────────────────────────────
export const useFetchMembers = (ws: string) =>
	useQuery({
		queryKey: memberKeys.list(ws),
		queryFn: ({ signal }) => WorkspaceMemberService.list(ws, signal),
		enabled: !!ws,
	});

export const useUpdateMemberRole = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ user, body }: { user: string | number; body: TUpdateMemberRoleDto }) =>
			WorkspaceMemberService.updateRole(ws, user, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: memberKeys.all(ws) });
			notify.success('Role updated');
		},
		onError: notify.fromError('Failed to update role'),
	});
};

export const useRemoveMember = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (user: string | number) => WorkspaceMemberService.remove(ws, user),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: memberKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success('Member removed');
		},
		onError: notify.fromError('Failed to remove member'),
	});
};

export const useLeaveWorkspace = (ws: string) =>
	useMutation({
		mutationFn: () => WorkspaceMemberService.leave(ws),
		onSuccess: () => notify.success('Left workspace'),
		onError: notify.fromError('Failed to leave workspace'),
	});

export const useTransferOwnership = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (userId: string | number) =>
			WorkspaceMemberService.transferOwnership(ws, userId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: memberKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success('Ownership transferred successfully');
		},
		onError: notify.fromError('Failed to transfer ownership'),
	});
};

// ── Invitations ──────────────────────────────────────────
export const useFetchInvitations = (ws: string) =>
	useQuery({
		queryKey: invitationKeys.list(ws),
		queryFn: ({ signal }) => WorkspaceInvitationService.list(ws, signal),
		enabled: !!ws,
	});

export const useSendInvitation = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TSendInvitationDto) => WorkspaceInvitationService.send(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: invitationKeys.all(ws) });
			notify.success('Invitation sent');
		},
		onError: notify.fromError('Failed to send invitation'),
	});
};

export const useCancelInvitation = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invitationId: string) => WorkspaceInvitationService.cancel(ws, invitationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: invitationKeys.all(ws) });
			notify.success('Invitation cancelled');
		},
		onError: notify.fromError('Failed to cancel invitation'),
	});
};

// ── Settings ─────────────────────────────────────────────
export const useFetchWorkspaceSettings = (ws: string) =>
	useQuery({
		queryKey: workspaceSettingsKeys.detail(ws),
		queryFn: ({ signal }) => WorkspaceSettingsService.fetch(ws, signal),
		enabled: !!ws,
	});

export const useUpdateWorkspaceSettings = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<TWorkspaceSettings>) =>
			WorkspaceSettingsService.update(ws, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workspaceSettingsKeys.all(ws) });
			notify.success('Settings updated');
		},
		onError: notify.fromError('Failed to update settings'),
	});
};
