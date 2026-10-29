import type { JsonSchema, JsonSchema7, UISchemaElement } from '@jsonforms/core';
import type { FieldDef } from './types';

/** Translate the builder's field list into a JSON Schema + UI Schema pair. */
export function buildSchemas(fields: FieldDef[]): {
  schema: JsonSchema;
  uischema: UISchemaElement;
} {
  const properties: Record<string, JsonSchema7> = {};
  const required: string[] = [];

  for (const f of fields) {
    const prop: JsonSchema7 = {};
    switch (f.type) {
      case 'number':
        prop.type = 'number';
        break;
      case 'integer':
        prop.type = 'integer';
        break;
      case 'boolean':
        prop.type = 'boolean';
        break;
      case 'date':
        prop.type = 'string';
        prop.format = 'date';
        break;
      case 'email':
        prop.type = 'string';
        prop.format = 'email';
        break;
      case 'select':
      case 'radio':
        prop.type = 'string';
        if (f.options?.length) prop.enum = f.options;
        break;
      default:
        prop.type = 'string';
    }
    if (f.description) prop.description = f.description;
    properties[f.key] = prop;
    if (f.required) required.push(f.key);
  }

  const schema: JsonSchema = { type: 'object', properties };
  if (required.length) schema.required = required;

  const uischema = {
    type: 'VerticalLayout',
    elements: fields.map((f) => {
      const options: Record<string, unknown> = {};
      if (f.type === 'textarea') options.multi = true;
      if (f.type === 'radio') options.format = 'radio';
      return {
        type: 'Control',
        scope: `#/properties/${f.key}`,
        label: f.label,
        ...(Object.keys(options).length ? { options } : {}),
      };
    }),
  } as UISchemaElement;

  return { schema, uischema };
}
