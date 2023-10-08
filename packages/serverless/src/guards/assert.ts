export function assert(condition: unknown, msg?: string, options: { Error?: new ()=>Error } = {}): asserts condition {
    if (condition === false) {
        const Err = options?.Error || Error;
        throw new Err(msg)
    }
}
