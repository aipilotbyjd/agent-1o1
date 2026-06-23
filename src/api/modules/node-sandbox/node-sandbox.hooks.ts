import { useMutation } from '@tanstack/react-query';
import { notify } from '@/api/core';
import { NodeSandboxService } from './node-sandbox.service';
import type { INodeSandboxRequest, INodeSandboxResult } from './node-sandbox.service';

export const useNodeSandbox = (ws: string) =>
	useMutation<INodeSandboxResult, Error, INodeSandboxRequest>({
		mutationFn: (body) =>
			NodeSandboxService.run(ws, { ...body, input_data: body.input_data ?? {} }),
		onError: notify.fromError('Sandbox execution failed'),
	});
