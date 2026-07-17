import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { ITemplateFilters } from '@/types/template.type';
import { TemplateService } from './templates.service';
import { templateKeys } from './templates.keys';

export const useTemplates = (filters?: ITemplateFilters) =>
	useQuery({
		queryKey: templateKeys.list(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => TemplateService.list(filters, signal),
	});

export const useTemplate = (id: string) =>
	useQuery({
		queryKey: templateKeys.detail(id),
		queryFn: ({ signal }) => TemplateService.detail(id, signal),
		enabled: !!id,
	});

export const useUseTemplate = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ templateId, workflowName }: { templateId: string; workflowName?: string }) =>
			TemplateService.apply(ws, templateId, workflowName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['workflows', ws] });
			notify.success('Workflow created from template');
		},
		onError: notify.fromError('Failed to use template'),
	});
};

export const usePublishWorkflowAsTemplate = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			wfId,
			payload,
		}: {
			wfId: string;
			payload: {
				category: string;
				tags?: string[];
				instructions?: string;
				is_featured?: boolean;
				sort_order?: number;
			};
		}) => TemplateService.publishWorkflow(ws, wfId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: templateKeys.all() });
			notify.success('Workflow published as template successfully');
		},
		onError: notify.fromError('Failed to publish workflow as template'),
	});
};

// Agent Templates Hooks
export const useAgentTemplates = (filters?: ITemplateFilters) =>
	useQuery({
		queryKey: templateKeys.agentList(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => TemplateService.agentList(filters, signal),
	});

export const useAgentTemplate = (id: string) =>
	useQuery({
		queryKey: templateKeys.agentDetail(id),
		queryFn: ({ signal }) => TemplateService.agentDetail(id, signal),
		enabled: !!id,
	});

export const useDeployAgent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (agentTemplateId: string) => TemplateService.agentDeploy(ws, agentTemplateId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws] });
			notify.success('Agent deployed from template');
		},
		onError: notify.fromError('Failed to deploy agent template'),
	});
};

// Template Collections Hooks
export const useTemplateCollections = (filters?: ITemplateFilters) =>
	useQuery({
		queryKey: templateKeys.collectionList(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => TemplateService.collectionList(filters, signal),
	});

export const useTemplateCollection = (id: string) =>
	useQuery({
		queryKey: templateKeys.collectionDetail(id),
		queryFn: ({ signal }) => TemplateService.collectionDetail(id, signal),
		enabled: !!id,
	});
