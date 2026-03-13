// Check if roles included properly
import parseJson from "../utils/parse-json.js";
import { ERROR, SUCCESS, WARNING } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runcheck12ToValidateCitation(content, fileDest) {

    const isWebSearch = fileDest.includes('web-search');

    if (!isWebSearch) {
        return returnMessageWrapper(`This check is only applicable for web-search notebooks.`, WARNING);
    }

    try {
        const assistantCells = content.cells.filter(cell => cell.metadata.tags[0] == 'assistant');
        const toolOutputsLists = content.cells.filter(cell => cell.metadata.tags[0] == 'tool_output');
        const allOutputsJSON = toolOutputsLists.map(parseJson);

        const allOutputs = [];

        for (let output of allOutputsJSON) {
            if (Array.isArray(output)) {
                allOutputs.push(...output);
            }
            else {
                allOutputs.push(output);
            }
        }

        for (let i = 0; i < assistantCells.length; i++) {

            let assistantCell = assistantCells[i];
            const assistantCellStr = assistantCell.source.join('');

            const re = /.\[?[REFNC_DO\s]{11,15}\d{0,2}_\d{0,2}\]?./g;

            const matches = [];

            let match;

            while ((match = re.exec(assistantCellStr)) !== null) {
                if (match[0].match(/\s/g)?.length > 3) {
                    continue;
                }

                matches.push(match[0]);
                re.lastIndex -= 2;
            }

            if (matches) {
                for (let match of matches) {
                    if (!match[0].match(/[)a-zA-Z0-9À-Ÿ*%]/) && !match[0].match(/]/)) {
                        return returnMessageWrapper(`Citation "${match}" has invalid starting character`, ERROR);
                    }

                    if (match.startsWith(' ') || match.startsWith(',')) {
                        return returnMessageWrapper(`Citation "${match}" starts with a space or comma`, ERROR);
                    }

                    // if match does not end with comma, semi-colon, or full-stop
                    if (!match.endsWith(',') && !match.endsWith(';') && !match.endsWith(':') && !match.endsWith('.') && !match.endsWith('[') && !match.endsWith('?')) {
                        return returnMessageWrapper(`Citation "${match}" does not end with a comma, semi-colon, colon, full-stop or question mark`, ERROR);
                    }

                    match = match.slice(1, -1).trim();

                    if (!match.startsWith('[REFERENCE_DOC_')) {
                        return returnMessageWrapper(`Citation "${match}" does not start with [REFERENCE_DOC_`, ERROR);
                    }

                    if (!match.endsWith(']')) {
                        return returnMessageWrapper(`Citation "${match}" does not end with ]`, ERROR);
                    }

                    // if match is exactly [REFERENCE_DOC_N] where N is a number
                    if (!match.match(/\[REFERENCE_DOC_\d{1,2}_\d{1,2}\]/)) {
                        return returnMessageWrapper(`Citation is not included in the cell, instead it includes ${match}`, ERROR);
                    }

                    const [refN, refM] = match.match(/\d{1,2}_\d{1,2}/)?.[0].split('_').map(Number);

                    if (!allOutputs[refN]) {
                        return returnMessageWrapper(`Tool output ${refN} is not found in the tool outputs`, ERROR);
                    }

                    if (refN === undefined || refM === undefined) {
                        return returnMessageWrapper(`No [REFERENCE_N_M] number found in citation "${match}"`, ERROR);
                    }
                }
            }
            else {
                // if previous cell is tool-output
                const isPreviousCellToolOutput = content.cells.find(cell => cell.metadata.tags[0] == 'tool_output' && Number(cell.metadata.tags[1]) == Number(assistantCell.metadata.tags[1]) - 1);
                let level = ERROR;

                if (fileDest.includes('allow-no-citation')) {
                    level = WARNING;
                }

                if (isPreviousCellToolOutput) {
                    return returnMessageWrapper(`No citation is included properly. Please include at least one citation as [REFERENCE_DOC_idx]`, level);
                }
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper(`No issue is found in referincing/citation.`, SUCCESS);
}
