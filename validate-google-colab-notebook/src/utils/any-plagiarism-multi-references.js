import isReferenceInSentence from "./is-reference-in-sentence.js";
import returnMessageWrapper from "./return-message-wrapper.js";
import { ERROR } from "./return-message-types.js";

export default function anyPlagiarismMultiReferences(assistantCell, toolOutputs, skipCheck) {

    const doc = assistantCell.split('\n').filter((sentence) => sentence.includes('[REFERENCE_DOC_')).join('\n');

    const sentences = doc.split(/\[REFERENCE_DOC_\d{1,2}_\d{1,2}\]/);
    const references = doc.match(/\[REFERENCE_DOC_\d{1,2}_\d{1,2}\]/g);

    const sentencesWithReferences = [];

    const refNs = [];

    for (let i = 0; i < sentences.length; i++) {
        if (references?.[i] === undefined) {
            continue;
        }

        const ref = references[i].match(/\d{1,2}_\d{1,2}/)[0]

        const idx = Number(ref.split('_')[0]);
        const refN = ref.split('_')[1];

        if (toolOutputs.length <= idx) {
            return returnMessageWrapper(`Can not check plagiarism for the reference number ${ref} as the tool output ${idx} is not found in the tool outputs`, ERROR);
        }

        if (!toolOutputs[idx][refN]) {
            return returnMessageWrapper(`Reference number ${refN} is not found in the tool output ${idx}`, ERROR);
        }

        const referencedSnippets = [...(toolOutputs[idx][refN].snippets || []), toolOutputs[idx][refN].description]
        if (sentences[i].match(/\w+/)) {
            sentencesWithReferences.push({ sentence: sentences[i], references: [referencedSnippets] });
            refNs.push([[Number(idx), Number(refN)]]);
        }
        else {
            if (sentencesWithReferences[sentencesWithReferences.length - 1]?.references) {
                sentencesWithReferences[sentencesWithReferences.length - 1].references.push(referencedSnippets);
                refNs[refNs.length - 1].push([Number(idx), Number(refN)]);
            }
        }
    }

    const refNsStr = refNs.map(refN => refN.map(r => r.join('_')));

    // check if refNs are unique and in increasing order
    for (let i = 0; i < refNsStr.length; i++) {
        if (refNsStr[i].length === 1) {
            continue;
        }

        if (refNsStr[i].length !== new Set(refNsStr[i]).size) {
            returnMessageWrapper(`Reference numbers are not unique in the citation: "${refNsStr[i].join('->')}"`, ERROR);
        }

        if (refNsStr[i].join('') !== JSON.parse(JSON.stringify(refNsStr[i])).sort((a, b) => a > b ? 1 : -1).join('')) {
            returnMessageWrapper(`Reference numbers are not in increasing order in the citation: "${refNsStr[i].join('->')}"`, ERROR);
        }
    }

    for (const { sentence, references } of sentencesWithReferences) {
        for (const reference of references) {
            const res = isReferenceInSentence(reference.join(' '), sentence, skipCheck);
            if (res) {
                return res;
            }
        }
    }

    return false;
}
