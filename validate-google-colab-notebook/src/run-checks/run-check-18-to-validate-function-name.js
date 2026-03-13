// Check naming convention if there are more than one naming convention in the same notebook

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from '../utils/return-message-types.js';
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck18ToValidateFunctionName(content, fileDest) {

    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools'))
        const fnNames = tools.map(tool => tool.function.name);

        for (let fnName of fnNames) {
            if (!fnName.match(/^[a-zA-Z0-9_-]{1,64}$/)) {
                return returnMessageWrapper(`Function name "${fnName}" is not valid! Please use only alphanumeric characters, hyphen and underscore. Max length is 64 characters.`, ERROR);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All function names are valid.', SUCCESS);
}
