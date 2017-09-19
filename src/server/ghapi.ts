import * as GHA from 'github';

export default function (token: string) {
    const gha = new GHA();
    gha.authenticate({
        type: "oauth",
        token: token
    });

    return gha;
}