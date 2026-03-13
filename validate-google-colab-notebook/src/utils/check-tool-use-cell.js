const checkToolUseCell = (toolUseCellContent) => {
    if (!toolUseCellContent.tool_use || !toolUseCellContent.tool_use.length) {
        return [`Tool use is empty: ${JSON.stringify(toolUseCellContent)}`];
    }
}

export { checkToolUseCell };