import { useState } from 'react';
import { Builder } from './Builder';
import { RecordEditor, RecordList } from './Records';
import { usePersistedState } from './storage';
import type { FormDef, RecordItem } from './types';

type View =
  | { name: 'home' }
  | { name: 'builder'; formId: string | null }
  | { name: 'records'; formId: string }
  | { name: 'record'; formId: string; recordId: string | null };

export default function App() {
  const [forms, setForms] = usePersistedState<FormDef[]>('fb.forms', []);
  const [records, setRecords] = usePersistedState<RecordItem[]>('fb.records', []);
  const [view, setView] = useState<View>({ name: 'home' });

  const formOf = (id: string) => forms.find((f) => f.id === id);

  if (view.name === 'builder') {
    return (
      <Builder
        key={view.formId ?? 'new'}
        initial={view.formId ? (formOf(view.formId) ?? null) : null}
        onCancel={() => setView({ name: 'home' })}
        onSave={(form) => {
          setForms((fs) => (fs.some((f) => f.id === form.id) ? fs.map((f) => (f.id === form.id ? form : f)) : [...fs, form]));
          setView({ name: 'home' });
        }}
      />
    );
  }

  if (view.name === 'records' || view.name === 'record') {
    const form = formOf(view.formId);
    if (!form) return <button onClick={() => setView({ name: 'home' })}>Formulaire introuvable</button>;
    const formRecords = records.filter((r) => r.formId === form.id);

    if (view.name === 'record') {
      const current = formRecords.find((r) => r.id === view.recordId) ?? null;
      return (
        <RecordEditor
          key={view.recordId ?? 'new'}
          form={form}
          record={current}
          onCancel={() => setView({ name: 'records', formId: form.id })}
          onSave={(rec) => {
            setRecords((rs) => (rs.some((r) => r.id === rec.id) ? rs.map((r) => (r.id === rec.id ? rec : r)) : [...rs, rec]));
            setView({ name: 'records', formId: form.id });
          }}
        />
      );
    }

    return (
      <RecordList
        form={form}
        records={formRecords}
        onBack={() => setView({ name: 'home' })}
        onNew={() => setView({ name: 'record', formId: form.id, recordId: null })}
        onEdit={(r) => setView({ name: 'record', formId: form.id, recordId: r.id })}
        onDelete={(r) => setRecords((rs) => rs.filter((x) => x.id !== r.id))}
      />
    );
  }

  return (
    <div className="page">
      <header className="toolbar">
        <h2>Form Builder POC</h2>
        <div className="spacer" />
        <button className="primary" onClick={() => setView({ name: 'builder', formId: null })}>
          + Nouveau formulaire
        </button>
      </header>
      {forms.length === 0 ? (
        <p className="muted">Aucun formulaire. Créez-en un par glisser-déposer.</p>
      ) : (
        <div className="cards">
          {forms.map((f) => (
            <div className="card" key={f.id}>
              <h3>{f.name}</h3>
              <p className="muted small">
                {f.fields.length} champ(s) · {records.filter((r) => r.formId === f.id).length} entrée(s)
              </p>
              <div className="actions">
                <button className="primary" onClick={() => setView({ name: 'records', formId: f.id })}>
                  Données
                </button>
                <button onClick={() => setView({ name: 'builder', formId: f.id })}>Modifier</button>
                <button
                  className="danger"
                  onClick={() => {
                    if (!confirm(`Supprimer « ${f.name} » et ses données ?`)) return;
                    setForms((fs) => fs.filter((x) => x.id !== f.id));
                    setRecords((rs) => rs.filter((r) => r.formId !== f.id));
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
