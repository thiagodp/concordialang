export function hasSomeOptionThatRequiresAPlugin(o) {
    return o.script || o.run || o.result;
}
