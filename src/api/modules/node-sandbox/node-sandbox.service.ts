import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import { NodeSandboxEndpoints as E } from './node-sandbox.endpoints';

export interface INodeSandboxRequest {
	code: string;
	input_data?: Record<string, unknown>;
}

export interface INodeSandboxResult {
	output: Record<string, unknown>;
	logs: string[];
	duration_ms: number;
	error?: string;
}

export const NodeSandboxService = {
	run: (ws: string, body: INodeSandboxRequest) =>
		axiosClient
			.post<TApiResponse<INodeSandboxResult>>(E.run(ws), body)
			.then(unwrap<INodeSandboxResult>),
};
