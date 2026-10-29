import { JsonForms } from '@jsonforms/react';
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import { useMemo } from 'react';
import { buildSchemas } from './schema';
import type { FieldDef } from './types';

interface Props {
  fields: FieldDef[];
  data: Record<string, unknown>;
  showErrors?: boolean;
  onChange: (data: Record<string, unknown>, valid: boolean) => void;
}

/** Renders a form definition with JSON Forms. */
export function DynamicForm({ fields, data, showErrors, onChange }: Props) {
  const { schema, uischema } = useMemo(() => buildSchemas(fields), [fields]);

  if (fields.length === 0) {
    return <p className="muted">Ce formulaire n'a encore aucun champ.</p>;
  }

  return (
    <JsonForms
      schema={schema}
      uischema={uischema}
      data={data}
      renderers={vanillaRenderers}
      cells={vanillaCells}
      validationMode={showErrors ? 'ValidateAndShow' : 'ValidateAndHide'}
      onChange={({ data, errors }) =>
        onChange((data ?? {}) as Record<string, unknown>, !errors || errors.length === 0)
      }
    />
  );
}
