import { useAuth } from '@/context/authContext';
import { useUploadAvatar } from '@/api/modules/auth';
import { useCreateWorkspace, useSwitchWorkspace } from '@/api/modules/workspaces';
import { useSendInvitation } from '@/api/modules/workspace-members';
import { useOnboardingStore } from '../_context/OnboardingStore.context';
import { parseEmails, isValidEmail } from '../_helper/onboarding.helper';
import { useOnboardingNavigation } from './useOnboardingNavigation.hook';

export const useOnboardingSubmit = () => {
	const { userData, refreshCurrentUser } = useAuth();
	const uploadAvatar = useUploadAvatar();
	const createWorkspace = useCreateWorkspace();
	const switchWorkspace = useSwitchWorkspace();
	const { state, dispatch } = useOnboardingStore();
	const { advanceStep } = useOnboardingNavigation();

	const {
		currentStep,
		workspaceName,
		workspaceCreated,
		inviteEmails,
		inviteRole,
		inviteMessage,
		invitesSent,
		createdWorkspaceId,
		avatarUrl,
	} = state;

	const sendInvitation = useSendInvitation(createdWorkspaceId);

	const parsedInviteEmails = parseEmails(inviteEmails);
	const validInviteEmails = parsedInviteEmails.filter(isValidEmail);
	const hasValidEmails = validInviteEmails.length > 0;

	const handleFileSelect = async (file: File) => {
		if (!file) return;
		if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result)
				dispatch({ type: 'SET_FIELD', payload: { avatarUrl: e.target.result as string } });
		};
		reader.readAsDataURL(file);
		dispatch({ type: 'SET_FIELD', payload: { avatarUrl: state.avatarUrl } });
		try {
			await uploadAvatar.mutateAsync(file);
			await refreshCurrentUser();
		} catch {
			dispatch({ type: 'SET_FIELD', payload: { avatarUrl: userData?.avatar ?? null } });
		}
	};

	const handleNextStep = async () => {
		// Step 2: Create workspace (required)
		if (currentStep === 1) {
			if (workspaceCreated) {
				advanceStep();
				return;
			}
			if (!workspaceName.trim()) return;
			dispatch({ type: 'SET_FIELD', payload: {} });
			try {
				const workspace = await createWorkspace.mutateAsync({ name: workspaceName.trim() });
				await switchWorkspace.mutateAsync(workspace.id);
				await refreshCurrentUser();
				dispatch({
					type: 'SET_FIELD',
					payload: { workspaceCreated: true, createdWorkspaceId: workspace.id },
				});
			} catch {
				return;
			}
		}

		// Step 3: Invite team (optional — send if emails present, then advance)
		if (currentStep === 2 && hasValidEmails && !invitesSent) {
			try {
				await Promise.all(
					validInviteEmails.map((email) =>
						sendInvitation.mutateAsync({
							email,
							role: inviteRole,
							message: inviteMessage,
						}),
					),
				);
				dispatch({ type: 'SET_FIELD', payload: { invitesSent: true } });
			} catch {
				// Non-blocking — advance even if some invites failed
			}
		}

		advanceStep();
	};

	const isWorkspaceLoading = createWorkspace.isPending || switchWorkspace.isPending;

	return {
		handleFileSelect,
		handleNextStep,
		isWorkspaceLoading,
		sendInvitationPending: sendInvitation.isPending,
		uploadAvatarPending: uploadAvatar.isPending,
	};
};
