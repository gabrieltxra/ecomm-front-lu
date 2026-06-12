import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Headset,
  Package,
  RotateCcw,
  Send,
  Mail,
  Phone,
  MessageSquareText,
} from "lucide-react";

import { getOrderById, Order } from "@/services/ordersService";
import {
  createSupportTicket,
  getSupportTicketByOrderId,
  SupportTicket,
} from "@/services/supportTicket";

type SelectedItem = {
  order_item_id: string;
  product_id: string;
  product_name: string;
  maxQuantity: number;
  quantity: number;
  checked: boolean;
  unitPrice: number;
};

export default function OrderSupport() {
  const { id } = useParams<{ id: string }>(); // orderId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<SelectedItem[]>([]);

  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [existingTicket, setExistingTicket] = useState<SupportTicket | null>(null);

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDateBR = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("pt-BR");
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;

        // 1) tenta pegar ticket existente primeiro
        const ticket = await getSupportTicketByOrderId(id);
        if (ticket) {
          setExistingTicket(ticket);
          toast.info("Já existe um ticket para esse pedido. Aguarde nosso retorno.");
        }

        // 2) carrega pedido
        const data = await getOrderById(id);
        setOrder(data);

        const mapped: SelectedItem[] =
          data.items?.map((it: any) => ({
            order_item_id: String(it.id ?? ""),
            product_id: String(it.product_id),
            product_name: String(it.product_name),
            maxQuantity: Number(it.quantity ?? 1),
            quantity: 1,
            checked: false,
            unitPrice: Number(it.price ?? 0),
          })) ?? [];

        setItems(mapped);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao carregar pedido");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const selected = useMemo(() => items.filter((i) => i.checked), [items]);

  const selectedTotal = useMemo(() => {
    return selected.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  }, [selected]);

  const isLocked = !!existingTicket; // ✅ trava tudo se já existe ticket

  const isValid = useMemo(() => {
    if (!order?.id) return false;
    if (isLocked) return false; // ✅ não deixa enviar se já tem ticket
    if (selected.length === 0) return false;
    if (details.trim().length < 10) return false;
    if (!contactEmail.trim() && !contactPhone.trim()) return false;

    for (const it of selected) {
      if (it.quantity < 1 || it.quantity > it.maxQuantity) return false;
    }
    return true;
  }, [order, selected, details, contactEmail, contactPhone, isLocked]);

  const toggleItem = (order_item_id: string) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((it) =>
        it.order_item_id === order_item_id ? { ...it, checked: !it.checked } : it
      )
    );
  };

  const setQty = (order_item_id: string, qty: number) => {
    if (isLocked) return;
    setItems((prev) =>
      prev.map((it) =>
        it.order_item_id === order_item_id
          ? { ...it, quantity: Math.max(1, Math.min(it.maxQuantity, qty)) }
          : it
      )
    );
  };

  const handleSubmit = async () => {
    if (!order?.id) return;

    if (existingTicket?.id) {
      toast.info("Esse pedido já possui um ticket. Aguarde nosso retorno.");
      return;
    }

    if (!isValid) {
      toast.error("Preencha tudo certinho antes de enviar.");
      return;
    }

    // ✅ aviso de irreversibilidade
    const ok = window.confirm(
      "Depois de enviar, os dados do ticket não poderão ser editados.\n\nDeseja continuar?"
    );
    if (!ok) return;

    try {
      setSending(true);

      const itensTexto = selected
        .map(
          (it) =>
            `- ${it.product_name} (qtd: ${it.quantity}) — ${formatBRL(it.unitPrice)}`
        )
        .join("\n");

      const message = [
        `Solicitação de suporte/devolução`,
        `Pedido: #${order.id}`,
        ``,
        `Itens selecionados:`,
        itensTexto,
        ``,
        `Total estimado dos itens selecionados: ${formatBRL(selectedTotal)}`,
        ``,
        `Detalhes:`,
        details.trim(),
      ].join("\n");

      const contact_values = {
        email: contactEmail.trim() || null,
        phone: contactPhone.trim() || null,
        items: selected.map((it) => ({
          order_item_id: it.order_item_id,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: it.unitPrice,
        })),
        selected_total: selectedTotal,
      };

      const created = await createSupportTicket({
        order_id: order.id,
        message,
        contact_values,
      });

      // ✅ trava a tela e mostra o ticket criado
      setExistingTicket(created);

      toast.success("Ticket enviado! Em breve entraremos em contato.");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao enviar ticket");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Carregando suporte...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-200">Pedido não encontrado.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-white hover:bg-rose-600 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-950 dark:to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm mb-6 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Headset className="w-7 h-7 text-rose-500" />
                  Suporte / Devolução
                </h1>

                {existingTicket ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Já recebemos sua solicitação para o pedido{" "}
                    <span className="font-medium text-slate-900 dark:text-white">
                      #{order.id}
                    </span>
                    . Agora é só aguardar — entraremos em contato assim que analisarmos.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Abra um ticket para suporte/devolução do pedido{" "}
                    <span className="font-medium text-slate-900 dark:text-white">
                      #{order.id}
                    </span>
                    . A gente entra em contato assim que analisar.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 px-4 py-3 text-sm text-rose-800 dark:bg-white/5 dark:text-rose-200 dark:ring-white/10">
                <div className="flex items-center gap-2 font-medium">
                  <RotateCcw className="w-4 h-4" />
                  Prazo e análise
                </div>
                <div className="mt-1 text-xs opacity-90">
                  Você envia a solicitação, nós confirmamos e mandamos o próximo passo.
                </div>
              </div>
            </div>

            {/* ✅ Card do ticket existente */}
            {existingTicket && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Ticket já criado</p>
                    <p className="mt-1 text-sm opacity-90">
                      Status: <b className="uppercase">{existingTicket.status}</b> •
                      Criado em: <b>{formatDateBR(existingTicket.created_at)}</b>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="rounded-xl bg-white/70 px-3 py-2 text-sm font-medium ring-1 ring-emerald-200 hover:bg-white transition dark:bg-white/5 dark:ring-white/10"
                  >
                    Voltar ao pedido
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-white/70 p-4 ring-1 ring-emerald-200 text-sm whitespace-pre-wrap dark:bg-white/5 dark:ring-white/10">
                  {existingTicket.message}
                </div>

                <p className="mt-3 text-xs opacity-90">
                  Você não consegue editar esse ticket pelo site. Caso precise complementar
                  algo, responda nosso contato quando retornarmos.
                </p>
              </div>
            )}

            {/* Grid */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Itens */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 flex items-center gap-2">
                    <Package className="w-5 h-5 text-rose-500" />
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Selecione os itens
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-white/10">
                    {items.map((it) => (
                      <div key={it.order_item_id} className="p-4 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={it.checked}
                          onChange={() => toggleItem(it.order_item_id)}
                          disabled={isLocked}
                          className="mt-1 h-4 w-4 accent-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {it.product_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Máx: {it.maxQuantity} • Unit: {formatBRL(it.unitPrice)}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              Quantidade
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={it.maxQuantity}
                              value={it.quantity}
                              disabled={!it.checked || isLocked}
                              onChange={(e) =>
                                setQty(it.order_item_id, Number(e.target.value))
                              }
                              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatBRL(it.unitPrice * (it.checked ? it.quantity : 1))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descrição */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                  <div>
                    <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4 text-rose-500" />
                      Descreva o problema
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={5}
                      disabled={isLocked}
                      placeholder="Explique o que aconteceu, como recebeu, se testou, etc..."
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Mínimo de 10 caracteres. Quanto mais detalhes, mais rápido resolvemos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Contato
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Informe pelo menos um (email ou telefone).
                  </p>

                  <label className="mt-4 block text-sm font-medium text-slate-900 dark:text-white">
                    Email
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <Mail className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    <input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      type="email"
                      disabled={isLocked}
                      placeholder="seu@email.com"
                      className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <label className="mt-4 block text-sm font-medium text-slate-900 dark:text-white">
                    Telefone / WhatsApp
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      disabled={isLocked}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                    <b>Atenção:</b> ao enviar, os dados do ticket não poderão ser editados.
                  </div>

                  <button
                    disabled={!isValid || sending || isLocked}
                    onClick={handleSubmit}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm
                               bg-rose-500 text-white hover:bg-rose-600 transition
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLocked ? (
                      "Ticket já enviado"
                    ) : sending ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar ticket
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Resumo da solicitação
                  </h4>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Itens selecionados</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selected.length}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Total estimado</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatBRL(selectedTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-8 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Atendimento: responderemos o quanto antes.</span>
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
              >
                Voltar ao pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
