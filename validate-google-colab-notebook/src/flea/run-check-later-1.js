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

export default function runCheck11ToValidateNamingConventionForProperties(content) {

    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools' || cell.metadata?.tags?.[0] == 'tool'))

        for (let tool of tools) {

            let isCamelCase = false;
            let isSnakeCase = false;
            let isKebabCase = false;
            let isPascalCase = false;

            const properties = [tool.function.name, ...Object.keys(tool.function.parameters.properties)];

            for (let property of properties) {

                if (!property.match(/^[a-zA-Z0-9_-]{1,64}$/)) {
                    return returnMessageWrapper(`Peroperty name "${property}" in function "${tool.function.name}" is not valid! Please use only alphanumeric characters, hyphen and underscore. Max length is 64 characters.`, ERROR);
                }

                if (property.includes('_')) {
                    isSnakeCase = true;
                }
                else if (property.includes('-')) {
                    isKebabCase = true;
                }
                else if (property[0] == property[0].toUpperCase()) {
                    isPascalCase = true;
                }
                else {

                    for (let i = 0; i < property.length; i++) {
                        if (property[i] == property[i].toUpperCase()) {
                            isCamelCase = true;
                            break;
                        }
                    }
                }
            }

            if ([isCamelCase, isSnakeCase, isKebabCase, isPascalCase].filter(Boolean).length > 1) {
                return returnMessageWrapper(`Inconsistent property names! You used different naming conventions in the same function ${tool.function.name}: ${getStringNamingConvention({ isCamelCase, isSnakeCase, isKebabCase, isPascalCase })}`, ERROR)
            }
        }
    }
    catch (error) {
        return [error.message, error.stack]
    }
}
