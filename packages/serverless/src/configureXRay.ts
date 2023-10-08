import AWSXRay from "aws-xray-sdk";

export function configureXRay() {
    if (process.env.NODE_ENV === 'development' && !process.env.NO_TRACE) {
        console.debug('Enabling verbose X-Ray tracing');
        AWSXRay.middleware.setSamplingRules({
            rules: [
            ],
            default: {
                fixed_target: 0,
                rate: 1
            },
            version: 2
        });
        AWSXRay.middleware.disableCentralizedSampling();
    }
}
