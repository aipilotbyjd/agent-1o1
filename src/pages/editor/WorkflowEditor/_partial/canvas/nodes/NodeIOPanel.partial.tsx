import { Link2 } from 'lucide-react';
import { PORT_TYPE_COLOR } from '../../../_helper/builder.constants';
import NodeHelpTip from './NodeHelpTip.partial';
import type { TNodePort } from '../../../_types/node.type';

type Props = {
	inputs: TNodePort[];
	outputs: TNodePort[];
	/** True when at least one edge already feeds this node. */
	hasIncoming?: boolean;
};

const portLabel = (port: TNodePort) =>
	port.name.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

/**
 * Side cards mirroring Gumloop: an "connect an input" hint while nothing is wired
 * up, and the node's real output ports tinted by port type.
 */
const NodeIOPanel = ({ inputs, outputs, hasIncoming }: Props) => (
	<>
		<div className='pointer-events-auto absolute top-0 left-[360px] z-10 flex w-[200px] flex-col gap-1 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 p-3 text-zinc-500 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/30'>
			{hasIncoming ? (
				<>
					<div className='flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300'>
						<Link2 size={11} />
						{inputs.length} {inputs.length === 1 ? 'Input' : 'Inputs'}
					</div>
					<div className='mt-0.5 flex flex-col gap-1.5'>
						{inputs.map((port) => (
							<div
								key={port.id}
								className='flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[9px] font-bold'
								style={{
									color: PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any,
									borderColor: `${PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any}33`,
									backgroundColor: `${PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any}0d`,
								}}>
								<span className='truncate'>{portLabel(port)}</span>
								<span className='ml-1.5 shrink-0 opacity-60'>{port.type}</span>
							</div>
						))}
					</div>
				</>
			) : (
				<>
					<div className='text-[11px] font-bold text-zinc-700 dark:text-zinc-300'>
						Connect an input
					</div>
					<div className='text-[9px] leading-normal font-medium text-zinc-450 dark:text-zinc-500'>
						Drag outputs from other nodes to use them in this node.
					</div>
				</>
			)}
		</div>

		{outputs.length > 0 && (
			<div className='pointer-events-auto absolute top-[95px] left-[360px] z-10 flex w-[200px] flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='flex items-center justify-between'>
					<span className='text-[11px] font-bold text-zinc-800 dark:text-white'>
						{outputs.length} {outputs.length === 1 ? 'Output' : 'Outputs'}
					</span>
					<NodeHelpTip text='Values this node produces. Drag one onto another node to feed it as an input.' />
				</div>
				<div className='flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-1'>
					{outputs.map((port) => (
						<div
							key={port.id}
							title={`${port.name}: ${port.type}`}
							className='flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[9px] font-bold'
							style={{
								color: PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any,
								borderColor: `${PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any}33`,
								backgroundColor: `${PORT_TYPE_COLOR[port.type] ?? PORT_TYPE_COLOR.any}0d`,
							}}>
							<span className='truncate'>{portLabel(port)}</span>
							<Link2 size={11} className='ml-1.5 shrink-0 opacity-70' />
						</div>
					))}
				</div>
			</div>
		)}
	</>
);

export default NodeIOPanel;
