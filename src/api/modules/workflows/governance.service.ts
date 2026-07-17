import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';

export interface IApproval {
	id: string;
	status: 'pending' | 'approved' | 'rejected';
	notes?: string;
	requested_by: { id: string; name: string };
	reviewed_by?: { id: string; name: string } | null;
	reviewed_at?: string | null;
	created_at: string;
}

export interface IRelease {
	id: string;
	environment_id: string;
	version_id: string;
	notes?: string;
	created_at: string;
}

export interface IContract {
	id: string;
	status?: 'passed' | 'failed';
	created_at: string;
}

export interface IContractRunResult {
	status: 'passed' | 'failed';
	results: {
		missing_nodes: string[];
		unexpected_nodes: string[];
	};
}

export interface ITemplate {
	id: string;
	name: string;
	slug: string;
	description: string;
	category: string;
	icon: string;
	color: string;
	tags: string[];
	is_featured: boolean;
	usage_count: number;
	node_count: number;
}

export const WorkflowGovernanceService = {
	// Approvals
	listApprovals: (ws: string, workflowId: string) =>
		axiosClient
			.get<TPaginatedResponse<IApproval>>(`/workspaces/${ws}/workflows/${workflowId}/approvals`)
			.then((r) => r.data),

	requestApproval: (ws: string, workflowId: string, notes?: string) =>
		axiosClient
			.post<TApiResponse<IApproval>>(`/workspaces/${ws}/workflows/${workflowId}/approvals`, { notes })
			.then(unwrap<IApproval>),

	approveRequest: (ws: string, workflowId: string, approvalId: string, notes?: string) =>
		axiosClient
			.post<TApiResponse<IApproval>>(
				`/workspaces/${ws}/workflows/${workflowId}/approvals/${approvalId}/approve`,
				{ notes },
			)
			.then(unwrap<IApproval>),

	rejectRequest: (ws: string, workflowId: string, approvalId: string, notes?: string) =>
		axiosClient
			.post<TApiResponse<IApproval>>(
				`/workspaces/${ws}/workflows/${workflowId}/approvals/${approvalId}/reject`,
				{ notes },
			)
			.then(unwrap<IApproval>),

	// Releases
	listReleases: (ws: string, workflowId: string) =>
		axiosClient
			.get<TPaginatedResponse<IRelease>>(`/workspaces/${ws}/workflows/${workflowId}/releases`)
			.then((r) => r.data),

	deployRelease: (
		ws: string,
		workflowId: string,
		body: { environment_id: string; version_id: string; notes?: string },
	) =>
		axiosClient
			.post<TApiResponse<IRelease>>(`/workspaces/${ws}/workflows/${workflowId}/releases`, body)
			.then(unwrap<IRelease>),

	// Contracts
	listContracts: (ws: string, workflowId: string) =>
		axiosClient
			.get<TPaginatedResponse<IContract>>(`/workspaces/${ws}/workflows/${workflowId}/contracts`)
			.then((r) => r.data),

	generateContract: (ws: string, workflowId: string) =>
		axiosClient
			.post<TApiResponse<IContract>>(`/workspaces/${ws}/workflows/${workflowId}/contracts`)
			.then(unwrap<IContract>),

	runContractTest: (ws: string, workflowId: string, contractId: string) =>
		axiosClient
			.post<TApiResponse<IContractRunResult>>(
				`/workspaces/${ws}/workflows/${workflowId}/contracts/${contractId}/run`,
			)
			.then(unwrap<IContractRunResult>),

	// AI Workflow Builder
	buildWorkflow: (ws: string, prompt: string, save = true) =>
		axiosClient
			.post<TApiResponse<any>>(`/workspaces/${ws}/workflow-builder`, { prompt, save })
			.then(unwrap<any>),

	// Templates
	listTemplates: (ws: string) =>
		axiosClient
			.get<TPaginatedResponse<ITemplate>>(`/workspaces/${ws}/workflow-templates`)
			.then((r) => r.data),

	getTemplateDetail: (ws: string, templateId: string) =>
		axiosClient
			.get<TApiResponse<any>>(`/workspaces/${ws}/workflow-templates/${templateId}`)
			.then(unwrap<any>),

	deployTemplate: (ws: string, templateId: string) =>
		axiosClient
			.post<TApiResponse<any>>(`/workspaces/${ws}/workflow-templates/${templateId}/deploy`)
			.then(unwrap<any>),
};
