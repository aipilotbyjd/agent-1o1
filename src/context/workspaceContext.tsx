import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useWorkspaces, useWorkspace, useSwitchWorkspace } from '@/api/modules/workspaces';
import { useFetchMembers } from '@/api/modules/workspace-members/workspace-members.hooks';
import { useWorkflowShellStore } from '@/store/workflowShell.store';
import type {
	TWorkspace,
	TWorkspaceDetail,
	TWorkspaceMember,
	TWorkspaceRole,
} from '@/types/workspace.type';

export interface IWorkspaceContextProps {
	// List of all accessible workspaces
	workspaces: TWorkspace[];
	isWorkspacesLoading: boolean;

	// Active workspace info
	activeWorkspaceId: string;
	activeWorkspace: TWorkspaceDetail | null;
	isActiveWorkspaceLoading: boolean;
	isActiveWorkspaceError: boolean;
	activeWorkspaceError: Error | null;

	// Active workspace settings, roles, members
	role: TWorkspaceRole | null;
	members: TWorkspaceMember[];
	isMembersLoading: boolean;

	// Utilities
	switchWorkspace: (idOrSlug: string) => void;
	refetchActiveWorkspace: () => void;
}

const WorkspaceContext = createContext<IWorkspaceContextProps>({} as IWorkspaceContextProps);

const IS_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const MOCK_WORKSPACE_DETAIL: TWorkspaceDetail = {
	id: 'mock-ws-1',
	name: 'Sahil Studio',
	slug: 'sahil-studio',
	created_at: new Date().toISOString(),
	role: 'owner',
	settings: {
		timezone: 'UTC',
		execution_retention_days: 30,
		default_max_retries: 3,
		default_timeout_seconds: 300,
		auto_activate_workflows: true,
		allow_public_sharing: false,
		error_workflow_id: null,
		allowed_ip_ranges: [],
		notification_preferences: null,
		git_repo_url: null,
		git_branch: null,
		git_auto_sync: false,
		last_git_sync_at: null,
	},
	owner: {
		id: 'mock-1',
		name: 'Dev User',
		email: 'dev@localhost',
		avatar: null,
	},
	members_count: 1,
	workflows_count: 8,
};

const MOCK_WORKSPACES: TWorkspace[] = [
	{
		id: 'mock-ws-1',
		name: 'Sahil Studio',
		slug: 'sahil-studio',
		created_at: new Date().toISOString(),
		role: 'owner',
		owner: {
			id: 'mock-1',
			name: 'Dev User',
			email: 'dev@localhost',
			avatar: null,
		},
	},
];

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, userData } = useAuth();
	const activeWorkspaceKey = useWorkflowShellStore((store) => store.activeWorkspaceId);
	const setActiveWorkspaceId = useWorkflowShellStore((store) => store.setActiveWorkspaceId);

	// Get all workspaces (only enabled when authenticated and not mocked)
	const { data: workspacesResponse, isLoading: isWorkspacesLoading } = useWorkspaces({
		enabled: isAuthenticated && !IS_MOCK_AUTH,
	});

	const workspaces = useMemo(() => {
		if (IS_MOCK_AUTH) return MOCK_WORKSPACES;
		return workspacesResponse?.data ?? [];
	}, [workspacesResponse?.data]);

	// Find workspace matched by active key in Zustand store
	const selectedWorkspace = useMemo(() => {
		if (workspaces.length === 0) return null;
		const matched = workspaces.find(
			(workspace) =>
				workspace.id === activeWorkspaceKey || workspace.slug === activeWorkspaceKey,
		);
		if (matched) return matched;

		// Fallback to current_workspace_id
		const currentId = userData?.current_workspace_id ?? userData?.current_workspace?.id;
		if (currentId) {
			const currentMatched = workspaces.find(
				(w) => w.id === currentId || w.slug === currentId,
			);
			if (currentMatched) return currentMatched;
		}

		return workspaces[0];
	}, [activeWorkspaceKey, workspaces, userData]);

	// Determine active workspace ID
	const workspaceId = useMemo(() => {
		if (IS_MOCK_AUTH) return 'mock-ws-1';
		if (!isAuthenticated || isWorkspacesLoading) return '';
		if (
			activeWorkspaceKey &&
			workspaces.some((w) => w.id === activeWorkspaceKey || w.slug === activeWorkspaceKey)
		) {
			const matched = workspaces.find(
				(w) => w.id === activeWorkspaceKey || w.slug === activeWorkspaceKey,
			);
			return matched?.id ?? '';
		}
		return (
			userData?.current_workspace_id ??
			userData?.current_workspace?.id ??
			selectedWorkspace?.id ??
			''
		);
	}, [
		isAuthenticated,
		isWorkspacesLoading,
		userData,
		selectedWorkspace,
		activeWorkspaceKey,
		workspaces,
	]);

	// Synchronize computed workspaceId back to Zustand store
	useEffect(() => {
		if (workspaceId && activeWorkspaceKey !== workspaceId) {
			setActiveWorkspaceId(workspaceId);
		}
	}, [workspaceId, activeWorkspaceKey, setActiveWorkspaceId]);

	// Fetch detailed active workspace details (disabled in mock mode)
	const {
		data: activeWorkspaceDetails,
		isLoading: isActiveWorkspaceLoading,
		isError: isActiveWorkspaceError,
		error: activeWorkspaceError,
		refetch: refetchActiveWorkspace,
	} = useWorkspace(IS_MOCK_AUTH ? '' : workspaceId);

	// Fetch active workspace members (disabled in mock mode)
	const { data: membersResponse = [], isLoading: isMembersLoading } = useFetchMembers(
		IS_MOCK_AUTH ? '' : workspaceId,
	);

	const activeWorkspace = useMemo(() => {
		if (IS_MOCK_AUTH) return MOCK_WORKSPACE_DETAIL;
		return activeWorkspaceDetails || null;
	}, [activeWorkspaceDetails]);

	// Determine user's role in active workspace
	const role = useMemo<TWorkspaceRole | null>(() => {
		if (IS_MOCK_AUTH) return 'owner';
		if (activeWorkspace?.role) {
			return activeWorkspace.role;
		}
		if (selectedWorkspace) {
			if (selectedWorkspace.role) return selectedWorkspace.role;
			return selectedWorkspace.owner?.id === userData?.id ? 'owner' : 'member';
		}
		if (userData?.current_workspace?.role) {
			return userData.current_workspace.role as TWorkspaceRole;
		}
		return null;
	}, [activeWorkspace, selectedWorkspace, userData]);

	const members = useMemo<TWorkspaceMember[]>(() => {
		if (IS_MOCK_AUTH) {
			return [
				{
					id: 'mock-member-1',
					user_id: 'mock-1',
					name: 'Sahil User',
					email: 'dev@localhost',
					avatar: null,
					role: 'owner',
					joined_at: new Date().toISOString(),
				},
			];
		}
		return membersResponse;
	}, [membersResponse]);

	const switchWorkspaceMutation = useSwitchWorkspace();

	// Callback to switch workspaces
	const switchWorkspace = useCallback(
		(idOrSlug: string) => {
			if (IS_MOCK_AUTH) return;
			const workspace = workspaces.find((w) => w.id === idOrSlug || w.slug === idOrSlug);
			const targetId = workspace?.id ?? idOrSlug;

			switchWorkspaceMutation.mutate(targetId, {
				onSuccess: () => {
					setActiveWorkspaceId(targetId);
				},
			});
		},
		[workspaces, switchWorkspaceMutation, setActiveWorkspaceId],
	);

	const value: IWorkspaceContextProps = useMemo(
		() => ({
			workspaces,
			isWorkspacesLoading: IS_MOCK_AUTH ? false : isWorkspacesLoading,
			activeWorkspaceId: workspaceId,
			activeWorkspace,
			isActiveWorkspaceLoading: IS_MOCK_AUTH ? false : (isWorkspacesLoading || isActiveWorkspaceLoading),
			isActiveWorkspaceError: IS_MOCK_AUTH ? false : isActiveWorkspaceError,
			activeWorkspaceError: IS_MOCK_AUTH ? null : (activeWorkspaceError as Error | null),
			role,
			members,
			isMembersLoading: IS_MOCK_AUTH ? false : isMembersLoading,
			switchWorkspace,
			refetchActiveWorkspace,
		}),
		[
			workspaces,
			isWorkspacesLoading,
			workspaceId,
			activeWorkspace,
			isActiveWorkspaceLoading,
			isActiveWorkspaceError,
			activeWorkspaceError,
			role,
			members,
			isMembersLoading,
			switchWorkspace,
			refetchActiveWorkspace,
		],
	);

	return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspaceContext = () => {
	const context = useContext(WorkspaceContext);
	if (context === undefined) {
		throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
	}
	return context;
};
