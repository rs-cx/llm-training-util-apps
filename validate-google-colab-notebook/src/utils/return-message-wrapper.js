import { ERROR, LOG } from "./return-message-types.js";

const returnMessageWrapper = (message, type) => {

    // if message is an error object
    if (message instanceof Error) {
        return [`${ERROR}::${message.message}`, `${LOG}::${message.stack}`];
    }

    return [`${type}::${message}`];

}

export default returnMessageWrapper;