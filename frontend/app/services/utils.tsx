export function renderSnapshotValue(value) {
    if (typeof value === "string") {
        return value;
    } else if (typeof value === "object") {
        let s = "";
        Object.keys(value).forEach(key => s += `${key}.${value[key]}`);
        return s;
    }
}