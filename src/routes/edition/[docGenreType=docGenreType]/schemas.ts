import { z } from 'zod';

export const validDictKeys = ['piccolo', 'eliminabile', 'all'];

export const SEARCH_PARAMS_DEFAULTS = {
    dict: 'all',
};

export const schema = z.object({
    dict: z.string().default(SEARCH_PARAMS_DEFAULTS.dict).optional(),
});

type Params = z.infer<typeof schema>;
type ParamKey = keyof typeof SEARCH_PARAMS_DEFAULTS;

export function resetParams(params: Params, keys: ParamKey[] = []) {
    keys.forEach((key) => {
        params[key] = SEARCH_PARAMS_DEFAULTS[key];
    });
}

export function resetParamsExcept(params: Params, excludeKeys: ParamKey[]) {
    (Object.keys(SEARCH_PARAMS_DEFAULTS) as ParamKey[]).forEach((key) => {
        if (!excludeKeys.includes(key)) {
            params[key] = SEARCH_PARAMS_DEFAULTS[key];
        }
    });
}
