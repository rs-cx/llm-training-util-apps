export default function isReferenceInSentence(reference, sentence, skipCheck) {

    const referenceTrimmed = reference.replace(/[^a-zA-Z0-9]/g, ' ')
    const sentenceTrimmed = sentence.replace(/[^a-zA-Z0-9]/g, ' ');

    const referenceWords = referenceTrimmed.split(' ').map(word => word.toLowerCase()).filter(word => word.length > 0);
    const sentenceWords = sentenceTrimmed.split(' ').map(word => word.toLowerCase()).filter(word => word.length > 3);

    if (!skipCheck && (sentenceWords.length <= 3 || sentence.length < 35)) {
        return;
    }
    else if (sentenceWords.length <= 6 || sentence.length < 60) {
        return;
    }

    // check how many words are coming from the reference
    const commonWords = sentenceWords.filter(word => referenceWords.includes(word));

    const similarity = commonWords.length / sentenceWords.length;

    if (!skipCheck && similarity > 0.8) {
        return sentence + ' common words: "' + commonWords.join(', ') + '" similarity: "' + similarity + '"'
    }
    else if (similarity > 0.9) {
        return sentence + ' common words: "' + commonWords.join(', ') + '" similarity: "' + similarity + '"'
    }

    else if (similarity < 0.2) {
        return `Similarity is too low: ${similarity} for sentence: "${sentence}" and reference: "${reference}"`;
    }
}
