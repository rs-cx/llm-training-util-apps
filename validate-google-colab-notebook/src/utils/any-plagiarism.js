import isReferenceInSentence from "./is-reference-in-sentence.js";

export default function anyPlagiarism(assistantCell, toolOutput, skipCheck) {

    const doc = assistantCell.split('\n').filter((sentence) => sentence.includes('[REFERENCE_DOC_')).join('\n');

    const sentences = doc.split(/\[REFERENCE_DOC_\d{1,2}\]/);
    const references = doc.match(/\[REFERENCE_DOC_\d{1,2}\]/g);

    const sentencesWithReferences = [];

    const refNs = [];

    for (let i = 0; i < sentences.length; i++) {
        if (references?.[i] === undefined) {
            continue;
        }

        const refN = references[i].match(/\d{1,2}/)[0];

        if (!toolOutput[refN]) {
            return `Reference number ${refN} is not found in the tool output`;
        }

        const referencedSnippets = [...(toolOutput[refN].snippets || []), toolOutput[refN].description]
        if (sentences[i].match(/\w+/)) {
            sentencesWithReferences.push({ sentence: sentences[i], references: [referencedSnippets] });
            refNs.push([Number(refN)]);
        }
        else {
            if (sentencesWithReferences[sentencesWithReferences.length - 1]?.references) {
                sentencesWithReferences[sentencesWithReferences.length - 1].references.push(referencedSnippets);
                refNs[refNs.length - 1].push(Number(refN));
            }
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