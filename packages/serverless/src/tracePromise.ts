import AWSXRay from "aws-xray-sdk";

export const tracePromise = <
    P extends Promise<unknown>
>(promise: P, name: string): P => {
    if (process.env.NO_TRACE) return promise;
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment(name);
    return promise.finally(() => {
        subsegment?.close();
    }) as P;
}
