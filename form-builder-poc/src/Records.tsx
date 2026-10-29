import { useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { uid } from './types';
import type { FormDef, RecordItem } from './types';

const display = (v: unknown) =>
  v === undefined || v === null || v === '' ? '—' : typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : String(v);

export function RecordList({
  form,
  records,
  onNew,
  onEdit,
  onDelete,
  onBack,
}: {
  form: FormDef;
  records: RecordItem[];
  onNew: () => void;
  onEdit: (r: RecordItem) => void;
  onDelete: (r: RecordItem) => void;
  onBack: () => void;
}) {
  return (
    <div className="page">
      <header className="toolbar">
        <button onClick={onBack}>← Formulaires</button>
        <h2>{form.name}</h2>
        <div className="spacer" />
        <button className="primary" onClick={onNew}>
          + Nouvelle saisie
        </button>
      </header>
      {records.length === 0 ? (
        <p className="muted">Aucune donnée pour l'instant.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {form.fields.map((f) => (
                  <th key={f.id}>{f.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  {form.fields.map((f) => (
                    <td key={f.id}>{display(r.data[f.key])}</td>
                  ))}
                  <td className="actions">
                    <button onClick={() => onEdit(r)}>Éditer</button>
                    <button
                      className="danger"
                      onClick={() => confirm('Supprimer cette entrée ?') && onDelete(r)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function RecordEditor({
  form,
  record,
  onSave,
  onCancel,
}: {
  form: FormDef;
  record: RecordItem | null;
  onSave: (r: RecordItem) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(record?.data ?? {});
  const [valid, setValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    if (!valid) return;
    const now = Date.now();
    onSave({
      id: record?.id ?? uid(),
      formId: form.id,
      data,
      createdAt: record?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="page narrow">
      <header className="toolbar">
        <h2>
          {record ? 'Éditer' : 'Nouvelle saisie'} — {form.name}
        </h2>
      </header>
      <DynamicForm
        fields={form.fields}
        data={data}
        showErrors={submitted}
        onChange={(d, v) => {
          setData(d);
          setValid(v);
        }}
      />
      <div className="toolbar">
        <button onClick={onCancel}>Annuler</button>
        <button className="primary" onClick={submit}>
          Enregistrer
        </button>
        {submitted && !valid && <span className="error">Corrigez les erreurs ci-dessus.</span>}
      </div>
    </div>
  );
}
