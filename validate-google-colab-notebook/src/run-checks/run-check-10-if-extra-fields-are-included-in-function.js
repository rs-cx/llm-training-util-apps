// Check if required fields are consistent with the function parameters

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

const allowedToolKeys = ['function', 'type'];
const allowedFunctionKeys = ['name', 'parameters', 'description'];
const allowedParametersKeys = ['type', 'properties', 'description', 'required', 'additionalProperties', 'oneOf', 'anyOf', 'allOf', 'dependencies', 'definitions'];

export default function runCheck10IfExtraFieldsAreIncludedInFunction(content) {
    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools'))

        for (let tool of tools) {

            // Check tools keys
            const toolKeys = Object.keys(tool);
            let extraKeys = toolKeys.filter(key => !allowedToolKeys.includes(key));
            if (extraKeys.length > 0) {
                return returnMessageWrapper(`Extra field(s) in tool: ${tool.function.name}! Some keys are not allowed in function: '${extraKeys.join(', ')}'`, ERROR);
            }

            // Check function keys
            const functionKeys = Object.keys(tool.function);
            extraKeys = functionKeys.filter(key => !allowedFunctionKeys.includes(key));
            if (extraKeys.length > 0) {
                return returnMessageWrapper(`Extra field(s) in tool->function: ${tool.function.name}! Some keys are not allowed in function: '${extraKeys.join(', ')}'`, ERROR);
            }

            // Check function keys
            const parametersKeys = Object.keys(tool.function.parameters);
            extraKeys = parametersKeys.filter(key => !allowedParametersKeys.includes(key));
            if (extraKeys.length > 0) {
                return returnMessageWrapper(`Extra field(s) in tool->function->parameters: ${tool.function.name}! Some keys are not allowed in function: '${extraKeys.join(', ')}'`, ERROR);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All fields are consistent with the function parameters.', SUCCESS);
}
