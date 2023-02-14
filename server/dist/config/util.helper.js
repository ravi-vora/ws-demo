export const isJson = (data) => {
    try {
        JSON.parse(data);
    }
    catch (e) {
        return false;
    }
    return true;
};
//# sourceMappingURL=util.helper.js.map