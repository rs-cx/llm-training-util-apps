import anyPlagiarismMultiReferences from "../utils/any-plagiarism-multi-references.js";
import parseJson from "../utils/parse-json.js";
import { ERROR, INFO } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck16ToValidateNoPlagiarism(content, fileDest) {

    const isWebSearch = fileDest.includes('web-search');
    const skipPlagiarism = fileDest.includes('skip-plagiarism');

    if (skipPlagiarism) {
        return returnMessageWrapper(`Plagiarism check is skipped for this notebook`, INFO);
    }

    const allowPlagiarism = fileDest.includes('allow-plagiarism');

    // This check is only applicable for web-search notebooks.
    if (isWebSearch) {
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

        const assistantCellNums = toolOutputsLists.map(cell => (Number(cell.metadata.tags[1]) + 1).toString());
        const assistantCells = content.cells.filter(cell => assistantCellNums.includes(cell.metadata.tags[1]));

        if (toolOutputsLists.length != assistantCells.length) {
            return returnMessageWrapper(`Number of assistant cells is not equal to number of tool-output cells ${toolOutputsLists.length} != ${assistantCells.length}`, ERROR);
        }

        for (let i = 0; i < assistantCells.length; i++) {
            const assistantCell = assistantCells[i].source.join('');
            const plagiarism = anyPlagiarismMultiReferences(assistantCell, allOutputs, allowPlagiarism);

            if (plagiarism) {
                return returnMessageWrapper(`Plagiarism detected in cell ${assistantCells[i].metadata.tags} with words "${plagiarism}"`, ERROR);
            }
        }
    }
}
