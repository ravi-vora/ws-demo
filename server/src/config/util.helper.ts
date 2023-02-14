export const isJson = (data: string) => {
    try {
        JSON.parse(data)
    } catch(e) {
        return false;
    }
    return true;
}