import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import {
	WorkflowGovernanceService as Service,
	IApproval,
	IRelease,
	IContract,
	ITemplate,
} from './governance.service';
import { workflowKeys } from './workflows.keys';

// Query keys extension helper
const govKeys = {
	approvals: (ws: string, id: string) => ['workflows', ws, 'approvals', id] as const,
	releases: (ws: string, id: string) => ['workflows', ws, 'releases', id] as const,
	contracts: (ws: string, id: string) => ['workflows', ws, 'contracts', id] as const,
	templates: (ws: string) => ['workflow-templates', ws] as const,
	templateDetail: (ws: string, id: string) => ['workflow-templates', ws, id] as const,
};

// Approvals
export const useWorkflowApprovals = (ws: string, workflowId: string) =>
	useQuery({
		queryKey: govKeys.approvals(ws, workflowId),
		queryFn: () => Service.listApprovals(ws, workflowId),
		enabled: !!ws && !!workflowId,
	});

export const useRequestApproval = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (notes?: string) => Service.requestApproval(ws, workflowId, notes),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: govKeys.approvals(ws, workflowId) });
			notify.success('Approval requested successfully');
		},
		onError: notify.fromError('Failed to request approval'),
	});
};

export const useApproveRequest = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ approvalId, notes }: { approvalId: string; notes?: string }) =>
			Service.approveRequest(ws, workflowId, approvalId, notes),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: govKeys.approvals(ws, workflowId) });
			notify.success('Request approved');
		},
		onError: notify.fromError('Failed to approve request'),
	});
};

export const useRejectRequest = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ approvalId, notes }: { approvalId: string; notes?: string }) =>
			Service.rejectRequest(ws, workflowId, approvalId, notes),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: govKeys.approvals(ws, workflowId) });
			notify.success('Request rejected');
		},
		onError: notify.fromError('Failed to reject request'),
	});
};

// Releases
export const useWorkflowReleases = (ws: string, workflowId: string) =>
	useQuery({
		queryKey: govKeys.releases(ws, workflowId),
		queryFn: () => Service.listReleases(ws, workflowId),
		enabled: !!ws && !!workflowId,
	});

export const useDeployRelease = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: { environment_id: string; version_id: string; notes?: string }) =>
			Service.deployRelease(ws, workflowId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: govKeys.releases(ws, workflowId) });
			notify.success('Workflow released successfully');
		},
		onError: notify.fromError('Failed to deploy release'),
	});
};

// Contracts
export const useWorkflowContracts = (ws: string, workflowId: string) =>
	useQuery({
		queryKey: govKeys.contracts(ws, workflowId),
		queryFn: () => Service.listContracts(ws, workflowId),
		enabled: !!ws && !!workflowId,
	});

export const useGenerateContract = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => Service.generateContract(ws, workflowId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: govKeys.contracts(ws, workflowId) });
			notify.success('Contract snapshot generated');
		},
		onError: notify.fromError('Failed to generate contract snapshot'),
	});
};

export const useRunContractTest = (ws: string, workflowId: string) => {
	return useMutation({
		mutationFn: (contractId: string) => Service.runContractTest(ws, workflowId, contractId),
		onSuccess: (res) => {
			if (res.status === 'passed') {
				notify.success('Contract verification passed successfully!');
			} else {
				notify.error('Contract verification failed.');
			}
		},
		onError: notify.fromError('Failed to run contract test'),
	});
};

// AI Workflow Builder
export const useBuildWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ prompt, save }: { prompt: string; save?: boolean }) =>
			Service.buildWorkflow(ws, prompt, save),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
		},
		onError: notify.fromError('Failed to generate workflow'),
	});
};

// Templates
export const useWorkflowTemplates = (ws: string) =>
	useQuery({
		queryKey: govKeys.templates(ws),
		queryFn: () => Service.listTemplates(ws),
		enabled: !!ws,
	});

export const useWorkflowTemplateDetail = (ws: string, templateId: string) =>
	useQuery({
		queryKey: govKeys.templateDetail(ws, templateId),
		queryFn: () => Service.getTemplateDetail(ws, templateId),
		enabled: !!ws && !!templateId,
	});

export const useDeployWorkflowTemplate = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (templateId: string) => Service.deployTemplate(ws, templateId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Template deployed successfully');
		},
		onError: notify.fromError('Failed to deploy template'),
	});
};
