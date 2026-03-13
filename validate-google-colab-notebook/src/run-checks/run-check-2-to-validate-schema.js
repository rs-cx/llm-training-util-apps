
// Check if the tools are valid json schema and if the payload is consistent with it

import getAjv from "../utils/get-ajv.js";
import { checkToolUseCell } from "../utils/check-tool-use-cell.js";
import functionStructureValidation from "../utils/function-structure-validation.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";
import { ERROR, SUCCESS } from "../utils/return-message-types.js";

function isJsonSchemaStrictlyValid(jsonSchemas) {
    const ajv = getAjv();

    let idx = 0;
    for (let jsonSchema of jsonSchemas) {

        idx++;

        try {
            functionStructureValidation(jsonSchema);
        }
        catch (err) {
            return [...returnMessageWrapper(err, ERROR), ...returnMessageWrapper(`Error on [${idx}]th json schema!`, ERROR)];
        }

        try {
            let valid = ajv.compile(jsonSchema.function.parameters);

            if (!valid) {
                returnMessageWrapper('Error on json schema compilation!', ERROR);
            }
        }
        catch (error) {
            return returnMessageWrapper(error, ERROR);
        }
    }
}

function isToolUseConsistentWithJsonSchema(jsonSchemas, tool_uses_list) {
    const ajv = getAjv();

    if (!jsonSchemas || jsonSchemas.length == 0) {
        return returnMessageWrapper('Tools not found.', ERROR);
    }

    let i = 0;
    for (let each_tool_use of tool_uses_list) {
        i++;
        let j = 0;
        for (let individual_tool_use of each_tool_use.tool_use) {
            try {
                j++;

                const schema = jsonSchemas.find(jsonSchema => jsonSchema.function.name == individual_tool_use.function_name)?.function.parameters;

                if (!schema) {
                    if (!individual_tool_use.function_name) {
                        return returnMessageWrapper(`Error on [${i}]th tool_use [${j}]th function call. function_name key is missing in tool_use!`, ERROR);
                    }
                    else {
                        return returnMessageWrapper(`Error on [${i}]th tool_use [${j}]th function call. Function "${individual_tool_use.function_name}" not found in schema!`, ERROR);
                    }
                }

                const validate = ajv.compile(schema)
                const valid = validate(individual_tool_use.arguments);

                if (!valid) {
                    return returnMessageWrapper(`Error on [${i}]th tool_use [${j}]th function call: ${JSON.stringify(validate.errors)}`, ERROR);
                }
            }
            catch (error) {
                return returnMessageWrapper(error, ERROR);
            }
        }
    }
}

export default function runCheck2ToValidateSchemaAndPayloadConsistency(content, fileDest) {
    let jsonSchemas, jsonSchemaStr;
    let tool_uses_list = [];
    let cell_tags;
    for (let cell of content.cells) {
        try {
            cell_tags = cell.metadata.tags;
            if (cell.metadata?.tags?.includes('tools') || cell.metadata?.tags?.includes('tool')) {
                jsonSchemaStr = cell.source.join('').replace(/[\w\W]*```json([\w\W]*?)```[\w\W]*/, '$1');

                if (jsonSchemaStr.trim() == '') {
                    return returnMessageWrapper(`Empty schema found!`, ERROR);
                }

                jsonSchemas = JSON.parse(jsonSchemaStr);
            }
            else if (cell.metadata?.tags?.includes('tool_use')) {
                const tool_uses_str = cell.source.join('').replace(/[\w\W]*```json([\w\W]*?)```[\w\W]*/, '$1');
                const tool_uses = JSON.parse(tool_uses_str);
                checkToolUseCell(tool_uses);
                tool_uses_list.push(tool_uses);
            }
        }
        catch (error) {
            return returnMessageWrapper(error, ERROR);
        }
    }

    try {
        if (!jsonSchemas?.length) {
            return returnMessageWrapper('No schema found!', ERROR);
        }

        const error1 = isJsonSchemaStrictlyValid(jsonSchemas);
        const error2 = isToolUseConsistentWithJsonSchema(jsonSchemas, tool_uses_list);

        if (error1 || error2) {
            if (error1 && error2) {
                return [...error1, ...error2]
            }

            return [...(error1 || error2)]
        }
        else {
            return returnMessageWrapper('JSON schema and payload consistency check successful', SUCCESS);
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }
}