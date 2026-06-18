import { useEffect, useRef } from 'react';
import { AUTOSAVE_DEBOUNCE_MS } from '../_helper/builder.constants';
import { exportWorkflow } from '../_helper/importExport.helper';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';

export const useAutosave = () => {
	const { state, dispatch } = useWorkflowEditor();
	const timer = useRef<number | null>(null);

	useEffect(() => {
		if (state.workflow.savingState !== 'dirty') return;
		if (timer.current) window.clearTimeout(timer.current);

		timer.current = window.setTimeout(() => {
			dispatch({ type: 'SET_SAVE_STATE', savingState: 'saving' });
			try {
				localStorage.setItem(`workflow-editor:${state.workflow.id}`, exportWorkflow(state));
				dispatch({ type: 'SET_SAVE_STATE', savingState: 'saved' });
			} catch {
				dispatch({ type: 'SET_SAVE_STATE', savingState: 'error' });
			}
		}, AUTOSAVE_DEBOUNCE_MS);

		return () => {
			if (timer.current) window.clearTimeout(timer.current);
		};
	}, [dispatch, state]);
};
