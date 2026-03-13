// Check output if they are valid jsons

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from '../utils/return-message-types.js';
import returnMessageWrapper from '../utils/return-message-wrapper.js';

export default function runCheck3ToValidateOutputs(content) {
    try {
        let outputCells = content.cells.filter(cell => cell.metadata?.tags?.map(o => o.replace('-', '_').toLowerCase()).includes('tool_output'));
        for (let outputCell of outputCells) {
            try {
                const outputJson = parseJson(outputCell);
                const toolUseCellNum = Number(outputCell.metadata.tags[1]) - 1;
                const toolUseCell = parseJson(content.cells.find(cell => cell.metadata.tags[1] == toolUseCellNum.toString()));

                if (!toolUseCell.tool_use) {
                    return returnMessageWrapper(`Tool use not found for cell ${outputCell.metadata.tags}`, ERROR);
                }

                if (toolUseCell.tool_use.length > 1) {
                    if (Array.isArray(outputJson)) {
                        if (outputJson.length != toolUseCell.tool_use.length) {
                            return returnMessageWrapper(`tool_output length and tool_use are not equal! ${outputCell.metadata.tags}`, ERROR);
                        }
                    }
                    else {
                        return returnMessageWrapper(`Found object in tool_output but array is expected! ${outputCell.metadata.tags[1]}`, ERROR);
                    }
                }
            }
            catch (error) {
                return [
                    ...returnMessageWrapper(error, ERROR),
                    ...returnMessageWrapper(`Tool output validation failed for cell ${outputCell.metadata.tags}! ${error.message}`, ERROR)
                ]
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All tool outputs are valid!', SUCCESS);
}
