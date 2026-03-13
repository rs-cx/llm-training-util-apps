// Check if required fields are consistent with the function parameters

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck15ValidateToolUseCount(content, fileDest) {
    try {
        const isWebSearch = fileDest.includes('web-search');

        if (isWebSearch) {
            const toolUses = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tool_use'));

            // check if there are more than one tool_use

            if (toolUses.length > 1) {
                return returnMessageWrapper(`There are more than one tool_use cell found! Please ensure there is only one tool_use cell.`, ERROR);
            }

            // check if there is only one tool call in tool use
            if (toolUses.tool_use.length > 1) {
                return returnMessageWrapper(`There are more than one tool call in tool_use! Please ensure there is only one tool call in tool_use.`, ERROR);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All required fields are consistent with the function parameters.', SUCCESS);
}
