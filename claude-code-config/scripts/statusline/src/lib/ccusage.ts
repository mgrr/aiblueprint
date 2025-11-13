import { $ } from "bun";

interface CcusageBlock {
	isActive: boolean;
	costUSD: number;
	projection?: {
		remainingMinutes: number;
	};
}

interface CcusageBlocksResponse {
	blocks: CcusageBlock[];
}

interface CcusageData {
	blockCost: number | null;
	remainingMinutes: number | null;
}

export async function getCcusageData(): Promise<CcusageData> {
	try {
		// Use full path to ccusage binary
		const ccusagePath = "/usr/local/bin/ccusage";

		// Get active block data
		const result = await $`${ccusagePath} blocks --active --json`
			.quiet()
			.nothrow();

		if (result.exitCode !== 0) {
			return { blockCost: null, remainingMinutes: null };
		}

		const data: CcusageBlocksResponse = JSON.parse(result.text());

		// Find the active block
		const activeBlock = data.blocks.find((block) => block.isActive);

		if (!activeBlock) {
			return { blockCost: null, remainingMinutes: null };
		}

		return {
			blockCost: activeBlock.costUSD || 0,
			remainingMinutes: activeBlock.projection?.remainingMinutes || null,
		};
	} catch (_error) {
		// Fail silently - ccusage is optional
		return { blockCost: null, remainingMinutes: null };
	}
}
