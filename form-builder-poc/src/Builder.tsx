import { useRef, useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { PALETTE, uid } from './types';
import type { FieldDef, FieldType, FormDef } from './types';

const PALETTE_MIME = 'application/x-palette-type';
const FIELD_MIME = 'application/x-field-id';

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'champ';

function uniqueKey(base: string, fields: FieldDef[], ignoreId?: string) {
  let key = base;
  let i = 2;
  while (fields.some((f) => f.key === key && f.id !== ignoreId)) key = `${base}_${i++}`;
  return key;
}

function createField(type: FieldType, fields: FieldDef[]): FieldDef {
  const meta = PALETTE.find((p) => p.type === type)!;
  const field: FieldDef = {
    id: uid(),
    type,
    label: meta.label,
    key: uniqueKey(slug(meta.label), fields),
    required: false,
  };
  if (type === 'select' || type === 'radio') field.options = ['Option 1', 'Option 2'];
  return field;
}

interface Props {
  initial: FormDef | null;
  onSave: (form: FormDef) => void;
  onCancel: () => void;
}

export function Builder({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? 'Nouveau formulaire');
  const [fields, setFields] = useState<FieldDef[]>(initial?.fields ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [tab, setTab] = useState<'props' | 'preview'>('props');
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = fields.find((f) => f.id === selectedId) ?? null;

  const update = (id: string, patch: Partial<FieldDef>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addField = (type: FieldType, index = fields.length) => {
    const field = createField(type, fields);
    setFields((fs) => [...fs.slice(0, index), field, ...fs.slice(index)]);
    setSelectedId(field.id);
    setTab('props');
  };

  const moveField = (id: string, index: number) => {
    setFields((fs) => {
      const from = fs.findIndex((f) => f.id === id);
      if (from < 0) return fs;
      const next = fs.filter((f) => f.id !== id);
      next.splice(index > from ? index - 1 : index, 0, fs[from]);
      return next;
    });
  };

  const computeDropIndex = (clientY: number) => {
    const items = canvasRef.current?.querySelectorAll<HTMLElement>('[data-field]') ?? [];
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return items.length;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const index = computeDropIndex(e.clientY);
    const type = e.dataTransfer.getData(PALETTE_MIME) as FieldType;
    const fieldId = e.dataTransfer.getData(FIELD_MIME);
    if (type) addField(type, index);
    else if (fieldId) moveField(fieldId, index);
    setDropIndex(null);
  };

  const remove = (id: string) => {
    setFields((fs) => fs.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const save = () =>
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim() || 'Sans titre',
      fields,
      updatedAt: Date.now(),
    });

  return (
    <div className="builder">
      <header className="toolbar">
        <input
          className="title-input"
          aria-label="Nom du formulaire"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="spacer" />
        <button onClick={onCancel}>Annuler</button>
        <button className="primary" onClick={save}>
          Enregistrer
        </button>
      </header>

      <div className="builder-grid">
        <aside className="panel">
          <h3>Champs</h3>
          <p className="muted small">Glissez un champ vers le canevas (ou cliquez).</p>
          {PALETTE.map((p) => (
            <div
              key={p.type}
              className="palette-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(PALETTE_MIME, p.type);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addField(p.type)}
            >
              <span className="icon">{p.icon}</span>
              {p.label}
            </div>
          ))}
        </aside>

        <main
          ref={canvasRef}
          className={`canvas ${dropIndex !== null ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDropIndex(computeDropIndex(e.clientY));
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null);
          }}
          onDrop={onDrop}
        >
          {fields.length === 0 && (
            <div className="empty">Déposez des champs ici pour construire le formulaire</div>
          )}
          {fields.map((f, i) => (
            <div key={f.id}>
              {dropIndex === i && <div className="drop-line" />}
              <div
                data-field
                className={`field-card ${f.id === selectedId ? 'selected' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(FIELD_MIME, f.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDropIndex(null)}
                onClick={() => {
                  setSelectedId(f.id);
                  setTab('props');
                }}
              >
                <span className="handle">⋮⋮</span>
                <div className="field-info">
                  <strong>
                    {f.label}
                    {f.required && <span className="req"> *</span>}
                  </strong>
                  <span className="muted small">
                    {PALETTE.find((p) => p.type === f.type)?.label} · {f.key}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Supprimer ${f.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(f.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {dropIndex === fields.length && fields.length > 0 && <div className="drop-line" />}
        </main>

        <aside className="panel">
          <div className="tabs">
            <button className={tab === 'props' ? 'active' : ''} onClick={() => setTab('props')}>
              Propriétés
            </button>
            <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>
              Aperçu
            </button>
          </div>

          {tab === 'preview' ? (
            <DynamicForm fields={fields} data={previewData} onChange={(d) => setPreviewData(d)} />
          ) : selected ? (
            <div className="props">
              <label>
                Libellé
                <input value={selected.label} onChange={(e) => update(selected.id, { label: e.target.value })} />
              </label>
              <label>
                Clé (nom dans les données)
                <input
                  value={selected.key}
                  onChange={(e) =>
                    update(selected.id, { key: uniqueKey(slug(e.target.value), fields, selected.id) })
                  }
                />
              </label>
              <label>
                Description
                <input
                  value={selected.description ?? ''}
                  onChange={(e) => update(selected.id, { description: e.target.value })}
                />
              </label>
              <label className="inline">
                <input
                  type="checkbox"
                  checked={selected.required}
                  onChange={(e) => update(selected.id, { required: e.target.checked })}
                />
                Obligatoire
              </label>
              {(selected.type === 'select' || selected.type === 'radio') && (
                <label>
                  Options (une par ligne)
                  <textarea
                    rows={5}
                    value={(selected.options ?? []).join('\n')}
                    onChange={(e) =>
                      update(selected.id, {
                        options: e.target.value.split('\n').filter((o) => o.trim() !== ''),
                      })
                    }
                  />
                </label>
              )}
            </div>
          ) : (
            <p className="muted">Sélectionnez un champ pour modifier ses propriétés.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
