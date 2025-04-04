export const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
        return new Date(date).toLocaleDateString("en-US");
    }
    return date.toLocaleDateString("en-US");
}

export function formatStringToCamelCase(str: string) {
    return str
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\s(.)/g, (match) => match.toUpperCase())
        .replace(/\s/g, "");
}