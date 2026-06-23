import { useEffect, useMemo, useRef } from 'react';
import { useWorkflow, useWorkflowVersions } from '@/api/modules/workflows';
import { versionToExportedWorkflow } from '../_helper/workflowApiTransform.helper';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';

export const useWorkflowApiLoader = (workspaceId: string, workflowId: string) => {
	const { dispatch } = useWorkflowEditor();
	const loadedKey = useRef<string | null>(null);
	const workflowQuery = useWorkflow(workspaceId, workflowId);
	const versionsQuery = useWorkflowVersions(workspaceId, workflowId);

	const selectedVersion = useMemo(() => {
		const versions = versionsQuery.data ?? [];
		const currentVersionId = workflowQuery.data?.current_version_id;
		return (
			versions.find((version) => version.id === currentVersionId) ??
			versions.find((version) => version.is_published) ??
			versions[0]
		);
	}, [versionsQuery.data, workflowQuery.data?.current_version_id]);

	useEffect(() => {
		if (!workspaceId || !workflowId || !workflowQuery.data) return;
		if (versionsQuery.isLoading) return;

		const versionKey = selectedVersion?.id ?? 'empty';
		const loadKey = `${workspaceId}:${workflowId}:${versionKey}`;
		if (loadedKey.current === loadKey) return;
		loadedKey.current = loadKey;

		dispatch({
			type: 'LOAD_WORKFLOW',
			workflow: versionToExportedWorkflow(workflowQuery.data, selectedVersion, workspaceId),
		});
	}, [
		dispatch,
		selectedVersion,
		versionsQuery.isLoading,
		workflowId,
		workflowQuery.data,
		workspaceId,
	]);

	return {
		isApiWorkflow: Boolean(workspaceId && workflowId),
		isLoading: workflowQuery.isLoading || versionsQuery.isLoading,
		isError: workflowQuery.isError || versionsQuery.isError,
		workflow: workflowQuery.data,
		version: selectedVersion,
	};
};
