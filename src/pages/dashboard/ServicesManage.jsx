import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { apiFetch, uploadFiles } from '../../lib/api';
import { priceLabel, deliveryLabel } from '../../lib/format';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MediaPicker from '../../components/ui/MediaPicker';
import SafeImage from '../../components/ui/SafeImage';
import { useToast } from '../../context/ToastContext';

const EMPTY = {
  title: '',
  description: '',
  includes: '',
  category: '',
  priceType: 'FIXED',
  price: '',
  deliveryDays: '',
  status: 'ACTIVE',
};

export default function ServicesManage() {
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [files, setFiles] = useState([]);
  const [removeId, setRemoveId] = useState(null);

  async function load() {
    const data = await apiFetch('/api/me/services');
    setServices(data.services || []);
  }

  useEffect(() => {
    load().catch((err) => toast(err.message, 'error')).finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      let images = editing?.images || [];
      if (files.length) {
        const uploaded = await uploadFiles(files);
        images = uploaded.urls || [];
      }
      const payload = { ...form, images, price: form.priceType === 'NEGOTIABLE' ? null : form.price };
      if (editing) await apiFetch(`/api/services/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/api/services', { method: 'POST', body: JSON.stringify(payload) });
      toast(editing ? 'Serviço atualizado.' : 'Serviço criado.');
      setForm(EMPTY);
      setEditing(null);
      setFiles([]);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function pause(service) {
    await apiFetch(`/api/services/${service.id}/pause`, { method: 'POST' });
    await load();
  }

  async function remove() {
    await apiFetch(`/api/services/${removeId}`, { method: 'DELETE' });
    setRemoveId(null);
    toast('Serviço excluído.');
    await load();
  }

  if (loading) return <LoadingState />;

  return (
    <section className="perfil-section">
      <div className="section-heading">
        <div>
          <h2>Serviços</h2>
          <p>Crie, pause e edite ofertas reais. Nada de números inventados.</p>
        </div>
      </div>

      <form className="nidus-card composer" onSubmit={submit}>
        <h3>{editing ? 'Editar serviço' : 'Novo serviço'}</h3>
        <label>Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Descrição<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>O que está incluso<textarea rows={3} value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} /></label>
        <label>Categoria<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Desenvolvimento" /></label>
        <label>Tipo de preço
          <select value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}>
            <option value="FIXED">Preço fixo</option>
            <option value="STARTING_AT">A partir de</option>
            <option value="NEGOTIABLE">A combinar</option>
          </select>
        </label>
        {form.priceType !== 'NEGOTIABLE' ? (
          <label>Preço (R$)<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        ) : null}
        <label>Prazo (dias)<input type="number" min="1" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} /></label>
        <MediaPicker files={files} onChange={setFiles} multiple max={6} label="Adicionar mídia" />
        <div className="nidus-modal-actions">
          {editing ? <button type="button" className="home-btn ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancelar</button> : null}
          <button type="submit" className="home-btn">{editing ? 'Salvar' : 'Criar serviço'}</button>
        </div>
      </form>

      {!services.length ? (
        <EmptyState icon={<Package size={18} strokeWidth={1.75} />} title="Nenhum serviço ainda">
          Use o formulário acima para publicar sua primeira oferta.
        </EmptyState>
      ) : (
        <div className="nidus-grid">
          {services.map((service) => (
            <article key={service.id} className="nidus-card">
              <SafeImage src={service.images?.[0]} alt={service.title} className="thumb" />
              <h3>{service.title}</h3>
              <p>{service.status} · {priceLabel(service)} · {deliveryLabel(service.deliveryDays)}</p>
              <div className="home-hero__actions">
                <button type="button" className="home-btn ghost" onClick={() => { setEditing(service); setForm({ ...EMPTY, ...service, category: service.category?.name || '' }); }}>Editar</button>
                <button type="button" className="home-btn ghost" onClick={() => pause(service)}>{service.status === 'PAUSED' ? 'Ativar' : 'Pausar'}</button>
                <button type="button" className="home-btn danger" onClick={() => setRemoveId(service.id)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {removeId ? (
        <ConfirmDialog title="Excluir serviço?" danger confirmLabel="Excluir" onClose={() => setRemoveId(null)} onConfirm={remove}>
          <p>O serviço será arquivado e sai da listagem pública.</p>
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
