// Check output if they are valid jsons

import parseJson from '../utils/parse-json.js';
import { ERROR, SUCCESS } from '../utils/return-message-types.js';
import returnMessageWrapper from '../utils/return-message-wrapper.js';

export default function runCheck13ToValidateToolOutputSource(content, fileDest) {
    try {
        const isWebSearch = fileDest.includes('web-search');

        if (isWebSearch) {
            let outputCells = content.cells.filter(cell => cell.metadata?.tags.includes('tool_output'));

            if (outputCells.length < 1) {
                return returnMessageWrapper(`No tool_output cell found!`, ERROR);
            }

            let outputJsonsList = outputCells.map(parseJson);
            for (let i = 0; i < outputJsonsList.length; i++) {
                const outputCell = outputCells[i];
                let outputJsons = outputJsonsList[i];
                // if it's array
                if (!Array.isArray(outputJsons)) {
                    outputJsons = [outputJsons];
                }

                for (let j = 0; j < outputJsons.length; j++) {
                    let outputJson = outputJsons[j];

                    const sourcesUsed = Array.from(new Set(Object.values(outputJson).map(v => v.source)));
                    const sourcesAllowed = ['bing', 'brave', 'google', 'kagi'];

                    // checck if source is valid
                    if (!sourcesUsed.every(source => sourcesAllowed.includes(source))) {
                        return returnMessageWrapper(`Invalid source found in tool_output! ${outputCell.metadata.tags[1]}`, ERROR);
                    }
                }
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('All tool outputs are valid!', SUCCESS);
}
