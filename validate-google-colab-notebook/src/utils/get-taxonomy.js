function getTaxonomy({ isSingleTurn, isSingleCall, isMultipleCalls, isSingleParallel, isMultipleParallel, isSingleConsecutive, isMultipleConsecutive }) {
    let part1 = isSingleTurn ? 'single-turn' : 'multi-turns';

    let part2 = ''
    let part3 = ''
    let part4 = ''

    if (isSingleCall) {
        part2 = 'single-call'
    }
    else if (isMultipleCalls) {
        part2 = 'multi-calls'
    }
    else {
        part2 = 'no-call';
    }

    if (isSingleConsecutive) {
        part3 = 'single-consecutive'
    }
    else if (isMultipleConsecutive) {
        part3 = 'multi-consecutive'
    }
    else {
        part3 = 'non-consecutive';
    }

    if (isSingleParallel) {
        part4 = 'single-parallel-call'
    }
    else if (isMultipleParallel) {
        part4 = 'multi-parallel-calls'
    }
    else {
        part4 = 'non-parallel-call'
    }

    return `${part1}+${part2}+${part3}+${part4}`
}

export default getTaxonomy;
