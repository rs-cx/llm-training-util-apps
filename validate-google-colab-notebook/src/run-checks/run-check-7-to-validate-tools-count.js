// Check if there are at least 5 functions

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS, INFO } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck7ToValidateFunctionCount(content, fileDest) {
    const isWebSearch = fileDest.includes('web-search');

    const isLessFunctions = fileDest.includes('less-functions');
    const level = isLessFunctions ? INFO : ERROR;

    try {
        const tools = parseJson(content.cells.find(cell => cell.metadata?.tags?.[0] == 'tools'));

        if (isWebSearch) {
            if (tools.length > 1) {
                return returnMessageWrapper(`There are more than 1 tools available! Please remove the extra tools from the notebook.`, ERROR);
            }
        }
        else {
            if (tools.length < 5) {
                return returnMessageWrapper(`There are less than 5 tools available! Please add more tools to the notebook.`, level);
            }
        }

    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }


    return returnMessageWrapper(`Function count is valid!`, SUCCESS);
}
