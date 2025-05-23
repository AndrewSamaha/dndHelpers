import { getDiceTool } from './dice/dice';
// import { getStatBlockTool } from './fillStatBlock/fillStatBlock';
import { getStatBlockTool } from './fillStatBlockV2/fillStatBlock';
/**
 * Collection of tools available for use with LLMs
 */
export const tools = [getDiceTool, getStatBlockTool];
