export function isObject<T>(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
