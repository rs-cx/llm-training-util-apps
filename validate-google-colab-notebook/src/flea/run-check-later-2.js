// Check naming convention if there are more than one naming convention in the same notebook

import parseJson from '../utils/parse-json.js';
import { ERROR } from '../utils/return-message-types.js';
import returnMessageWrapper from "../utils/return-message-wrapper.js";

function getStringNamingConvention({ isCamelCase, isSnakeCase, isKebabCase, isPascalCase }) {
    let str = '';
    if (isCamelCase) {
        str += 'camelCase, ';
    }
    if (isSnakeCase) {
        str += 'snake_case, ';
    }
    if (isKebabCase) {
        str += 'kebab-case, ';
    }
    if (isPascalCase) {
        str += 'PascalCase, ';
    }
    return str.slice(0, -2);
}

export default function runCheck7ToValidateNamingConvention(content) {

    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools' || cell.metadata?.tags?.[0] == 'tool'))
        const fnNames = tools.map(tool => tool.function.name);

        let isCamelCase = false;
        let isSnakeCase = false;
        let isKebabCase = false;
        let isPascalCase = false;

        for (let fnName of fnNames) {
            if (!fnName.match(/^[a-zA-Z0-9_-]{1,64}$/)) {
                return returnMessageWrapper(`Function name "${fnName}" is not valid! Please use only alphanumeric characters, hyphen and underscore. Max length is 64 characters.`, ERROR);
            }

            if (fnName.includes('_')) {
                isSnakeCase = true;
            }
            else if (fnName.includes('-')) {
                isKebabCase = true;
            }
            else if (fnName[0] == fnName[0].toUpperCase()) {
                isPascalCase = true;
            }
            else {

                for (let i = 0; i < fnName.length; i++) {
                    if (fnName[i] == fnName[i].toUpperCase()) {
                        isCamelCase = true;
                        break;
                    }
                }
            }
        }

        if ([isCamelCase, isSnakeCase, isKebabCase, isPascalCase].filter(Boolean).length > 1) {
            return returnMessageWrapper(`Inconsistent function names! You used different naming conventions in the same notebook: ${getStringNamingConvention({ isCamelCase, isSnakeCase, isKebabCase, isPascalCase })}`, ERROR);
        }

    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }
}
