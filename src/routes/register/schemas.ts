import { z } from 'zod';
import { dict_register as dictReg } from '$lib/dictionaries/dict_register.json';
import type { TRegTypes } from '$lib/types/register/TRegister';

// Individual schemas per register type
const REG_TYPE_SCHEMAS = {
	people: z.object({ filter: z.enum(Object.keys(dictReg.people.groups) as any).default('') }),
	places: z.object({ filter: z.enum(Object.keys(dictReg.places.groups) as any).default('') }),
	events: z.object({ filter: z.enum(Object.keys(dictReg.events.groups) as any).default('') }),
	orgs: z.object({ filter: z.enum(Object.keys(dictReg.orgs.groups) as any).default('') }),
	bibls: z.object({ filter: z.enum(Object.keys(dictReg.bibls.groups) as any).default('') }),
	keywords: z.object({ filter: z.enum(Object.keys(dictReg.keywords.groups) as any).default('') })
} as const satisfies Record<TRegTypes, z.ZodObject<{ filter: z.ZodDefault<any> }>>;

// Export type union for the filter value
export type FilterValue = z.infer<(typeof REG_TYPE_SCHEMAS)[TRegTypes]>['filter'];

// Factory function to get schema + type for a regType
export function getSchemaForRegType<T extends TRegTypes>(regType: T) {
	return {
		schema: REG_TYPE_SCHEMAS[regType],
		type: regType
	} as const;
}
