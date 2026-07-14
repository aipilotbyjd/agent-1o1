import { getNodeDefinition } from './nodeCatalog.constants';
import type { TCanvasEdge, TCanvasNode } from '../_types/canvas.type';

export const getRunOrder = (nodes: TCanvasNode[], edges: TCanvasEdge[]): TCanvasNode[] => {
	const indegree = new Map(nodes.map((node) => [node.id, 0]));
	const byId = new Map(nodes.map((node) => [node.id, node]));

	edges.forEach((edge) => indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1));
	const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
	const orderedIds: string[] = [];

	while (queue.length) {
		const id = queue.shift();
		if (!id) continue;
		orderedIds.push(id);
		edges
			.filter((edge) => edge.source === id)
			.forEach((edge) => {
				indegree.set(edge.target, (indegree.get(edge.target) ?? 1) - 1);
				if (indegree.get(edge.target) === 0) queue.push(edge.target);
			});
	}

	const unresolved = nodes.filter((node) => !orderedIds.includes(node.id));
	return [
		...orderedIds.map((id) => byId.get(id)).filter(Boolean),
		...unresolved,
	] as TCanvasNode[];
};

export const createMockNodeOutput = (node: TCanvasNode): unknown => {
	const def = getNodeDefinition(node.data.defKey, node.data.definition);
	if (!def) return null;
	if (def.category === 'output') return node.data.values.name ?? 'result';
	if (def.category === 'logic') return { branch: 'true' };
	if (def.category === 'integration') return { sent: true };
	if (def.category === 'extract') return { title: 'Example', confidence: 0.92 };
	if (def.category === 'ai') return 'Generated AI response preview.';
	if (def.category === 'scrape') return 'Fetched markdown content preview.';
	return node.data.values;
};
