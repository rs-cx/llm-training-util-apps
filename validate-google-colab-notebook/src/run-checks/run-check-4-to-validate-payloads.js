// Check If the payload properties are included in the function

import { ERROR, INFO, SUCCESS, WARNING } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck4ToValidatePayloads(content, fileDest) {
    try {
        const isWebSearch = fileDest.includes('web-search');
        const toolsCell = content.cells.find(cell => cell.metadata.tags[0] == 'tools' || cell.metadata.tags[0] == 'tool');

        const toolsFunctions = JSON.parse(toolsCell?.source?.join('').replace(/[\w\W]*```json([\w\W]*?)```[\w\W]*/, '$1') || []);

        if (toolsFunctions.length == 0) {
            return returnMessageWrapper(`No tools are defined in the notebook.`, ERROR);
        }

        const toolUseCells = content.cells.filter(cell => cell.metadata.tags.map(t => t.replace('-', '_').toLowerCase())[0] == 'tool_use');

        if (toolUseCells.length == 0) {
            if (isWebSearch && fileDest.includes('allow-no-search')) {
                return returnMessageWrapper(`Skipping check 4 for web-search notebook.`, INFO);
            }

            return returnMessageWrapper(`No tool_use cells are defined in the notebook.`, ERROR);
        }

        for (let toolUseCell of toolUseCells) {
            const toolUseFunction = JSON.parse(toolUseCell?.source?.join('').replace(/[\w\W]*```json([\w\W]*?)```[\w\W]*/, '$1'));

            for (let individualToolUse of toolUseFunction.tool_use) {
                const individualToolUseKeys = Object.keys(individualToolUse.arguments || individualToolUse.parameters);
                const keysDefinedInFunction = Object.keys(toolsFunctions.find(f => f.function.name == individualToolUse.function_name).function.parameters.properties);
                for (let key of individualToolUseKeys) {
                    if (!keysDefinedInFunction.includes(key)) {
                        return returnMessageWrapper(`No such field [${key}] is defined in schema.`, ERROR);
                    }
                }
            }
        }

    }
    catch (error) {
        return returnMessageWrapper(error, ERROR)
    }

    return returnMessageWrapper('All payloads are consistent with the function parameters.', SUCCESS);
}