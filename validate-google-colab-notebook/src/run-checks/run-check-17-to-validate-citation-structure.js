import parseJson from "../utils/parse-json.js";
import { ERROR } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck17ToValidateCitationStructure(content, fileDest) {

    const isWebSearch = fileDest.includes('web-search');

    // This check is only applicable for web-search notebooks.
    if (isWebSearch) {
        const toolOutputsLists = content.cells.filter(cell => cell.metadata.tags[0] == 'tool_output');
        const assistantCellNums = toolOutputsLists.map(cell => (Number(cell.metadata.tags[1]) + 1).toString());

        const assistantCells = content.cells.filter(cell => assistantCellNums.includes(cell.metadata.tags[1]));

        if (toolOutputsLists.length != assistantCells.length) {
            return returnMessageWrapper(`Number of assistant cells is not equal to number of tool-output cells ${toolOutputsLists.length} != ${assistantCells.length}`, ERROR);
        }

        for (let i = 0; i < assistantCells.length; i++) {
            const assistantCell = assistantCells[i].source.join('');
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

            const doc = assistantCell.split('\n').filter((sentence) => sentence.includes('[REFERENCE_DOC_')).join('\n');

            const sentences = doc.split(/\[REFERENCE_DOC_\d{1,2}_\d{1,2}\]/);
            const references = doc.match(/\[REFERENCE_DOC_\d{1,2}\d{1,2}\]/g);

            const sentencesWithReferences = [];

            const refNMs = [];

            for (let i = 0; i < sentences.length; i++) {
                if (references?.[i] === undefined) {
                    continue;
                }

                const refNM = references[i].match(/\d{1,2}_\d{1,2}/)?.[0];

                if (refNM === undefined) {
                    return returnMessageWrapper(`No reference in format [REFERENCE_DOC_N_M] found in the references: "${references}"`, ERROR);
                }

                const [refN, refM] = refNM.slice(0, 2).split('_').map(Number);


                if (!allOutputs[refN]) {
                    return returnMessageWrapper(`${refN}th tool-output cell does not exist`, ERROR);
                }

                const referencedSnippets = [...(allOutputs[refN][refM].snippets || []), allOutputs[refN][refM].description]
                if (sentences[i].match(/\w+/)) {
                    sentencesWithReferences.push({ sentence: sentences[i], references: [referencedSnippets] });
                    refNMs.push([refNM]);
                }
                else {
                    if (!sentencesWithReferences[sentencesWithReferences.length - 1]?.references) {
                        return returnMessageWrapper(`The first sentence in the document is empty "${sentences[i]}" with reference ${references[i]}`, ERROR);
                    }

                    sentencesWithReferences[sentencesWithReferences.length - 1].references.push(referencedSnippets);
                    refNMs[refNMs.length - 1].push(Number(refNM));
                }
            }

            // check if refNs are unique and in increasing order
            for (let i = 0; i < refNMs.length; i++) {
                if (refNMs[i].length === 1) {
                    continue;
                }

                if (refNMs[i].length !== new Set(refNMs[i]).size) {

                    return returnMessageWrapper(`Reference numbers are not unique in the citation: "${refNs[i].join('-> ')}"`, ERROR);
                }

                if (refNMs[i].join('') !== JSON.parse(JSON.stringify(refNMs[i])).sort((a, b) => a - b).join('')) {
                    return returnMessageWrapper(`Reference numbers are not in increasing order in the citation: "${refNMs[i].join('-> ')}"`, ERROR);
                }
            }
        }
    }
}
