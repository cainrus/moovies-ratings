/**
 * djb2 algorithm
 * @param str
 */
export function hash(str: string){
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash;
}
