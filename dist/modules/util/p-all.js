import pMap from 'p-map';
export const pAll = (iterable, options) => pMap(iterable, (element) => element(), options);
export const runAllWithoutThrow = async (iterable, options, errors = []) => {
    try {
        await pAll(iterable, options);
    }
    catch (err) {
        if (err['_errors']) { // AggregateError - see https://github.com/sindresorhus/aggregate-error
            for (const individualError of err['_errors']) {
                errors.push(individualError.message);
            }
        }
        else {
            errors.push(err);
        }
    }
};
