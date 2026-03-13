// Check if there are at least 5 functions

import { ERROR, SUCCESS, INFO } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck14ToValidateNoHyperLinksInAssistant(content, fileDest) {
    const isWebSearch = fileDest.includes('web-search');
    try {
        if (isWebSearch) {
            const isAllowed = fileDest.includes('allow-hyperlinks');

            if (isAllowed) {
                return returnMessageWrapper(`Hyperlinks are allowed in assistant!`, INFO);
            }

            const assistantCells = content.cells.filter(cell => cell.metadata?.tags[0] == 'assistant').map(cell => cell.source.join(''));

            // check if any assistant cell contains hyperlink full
            for (let cell of assistantCells) {

                const match = cell.match(/https?:\/\/^\s+/g) || cell.match(/www\.\S+/g) || cell.match(/http?:\/\/\S+/g) || cell.match(/\.com/g) || cell.match((/ftp?:\/\/\S+/g));

                if (match !== null) {
                    return returnMessageWrapper(`Hyperlinks found in assistant: ${match.join(', ')}!`, ERROR);
                }
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper(`Passed or skipped check for hyperlinks in assistant!`, SUCCESS);
}
