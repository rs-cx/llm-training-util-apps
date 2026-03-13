// Check if required fields are consistent with the function parameters

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck8ValidateRequiredParams(content) {
    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools' || cell.metadata?.tags?.[0] == 'tool'))

        for (let tool of tools) {
            const { function: fn } = tool;
            const { name, parameters } = fn;

            const { required } = parameters;

            if (!required) continue;

            const params = Object.keys(parameters.properties);

            for (let req of required) {
                if (!params.includes(req)) {
                    return returnMessageWrapper(`The field ${req} is required but not found in the parameters of the function ${name}!`, ERROR);
                }
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All required fields are consistent with the function parameters.', SUCCESS);
}
