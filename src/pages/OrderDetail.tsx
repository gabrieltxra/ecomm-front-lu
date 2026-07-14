// src/pages/OrderDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, Order } from "@/services/ordersService";
import { toast } from "sonner";
import {
  ArrowLeft,
  Truck,
  Calendar,
  CreditCard,
  FileText,
  RotateCcw,
  Package,
  MapPin,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import CachedImage from "@/components/CachedImage";
import { getOptimizedImageUrl } from "@/lib/productImages";
import { formatDateTimeBr } from "@/utils/dateTime";

const PICKUP_ADDRESS = {
  street: "R. Jurunas",
  number: "398",
  city: "Santa Bárbara d'Oeste",
  state: "SP",
  cep: "13457-038",
  phone: "",
};

const PICKUP_FULL =
  "R. Jurunas, 398 - São Francisco, Santa Bárbara d'Oeste - SP, 13457-038";

function getPickupStatusMeta(status?: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "pronto_para_retirada") {
    return {
      label: "Pronto para retirada",
      message: "Seu pedido está pronto para retirada em nossa loja.",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    };
  }

  if (normalized === "retirado") {
    return {
      label: "Retirado",
      message: "Este pedido já foi retirado.",
      className:
        "border-slate-200 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    };
  }

  return {
    label: "Aguardando retirada",
    message: "Entraremos em contato quando seu pedido estiver disponível para retirada.",
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100",
  };
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveNfePdfUrl = (pathOrUrl?: string | null) => {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    const base =
      import.meta.env.VITE_FOCUS_BASE_URL || "https://api.focusnfe.com.br";
    return `${base}${pathOrUrl}`;
  };

  // ✅ resolve imagem (se vier relativa)
  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    // se você salvar no supabase storage como path tipo: /storage/v1/object/public/...
    const sb = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (sb) return `${sb}${url}`;

    // fallback: tenta usar a API como base (caso você sirva assets por lá)
    const api = import.meta.env.VITE_API_URL as string | undefined;
    if (api) return `${api}${url}`;

    return url;
  };

  // ✅ pega imagem do item
  const getItemImage = (it: any) => {
    const one = it?.image_url;
    const many = Array.isArray(it?.image_urls) ? it.image_urls[0] : undefined;
    return resolveImageUrl(one || many || "");
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await getOrderById(id);
        setOrder(data);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao carregar pedido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatMoney = (n: number) => (n ?? 0).toFixed(2).replace(".", ",");

  const nfePdfUrl = resolveNfePdfUrl((order as any)?.nfe_pdf_url);

  const statusBadge = useMemo(() => {
    const ps = order?.payment_status?.toLowerCase?.() || "";
    const st = (order as any)?.status?.toLowerCase?.() || "";
    const key = st || ps;

    if (key.includes("paid") || key.includes("pago")) {
      return {
        label: "Pago",
        className:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20",
      };
    }
    if (key.includes("pending") || key.includes("pendente")) {
      return {
        label: "Pendente",
        className:
          "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20",
      };
    }
    if (key.includes("cancelled") || key.includes("cancelado")) {
      return {
        label: "Cancelado",
        className:
          "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20",
      };
    }
    return {
      label: (order as any)?.status || order?.payment_status || "Status",
      className:
        "bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10",
    };
  }, [order]);

  const canRequestReturn = useMemo(() => {
    const ps = order?.payment_status?.toLowerCase?.() || "";
    return ps.includes("paid") || ps.includes("pago") || ps === "succeeded";
  }, [order]);

  const isPickup = useMemo(() => {
    const sm = (order?.shipping_method ?? "").toLowerCase();
    return sm.includes("retirada");
  }, [order?.shipping_method]);

  const pickupStatus = useMemo(
    () => getPickupStatusMeta(order?.shipping?.status),
    [order?.shipping?.status]
  );

  const address = useMemo(() => {
    if (isPickup) return PICKUP_ADDRESS;

    return (
      (order as any)?.address ?? {
        cep: "",
        city: "",
        phone: "",
        state: "",
        number: "",
        street: "",
      }
    );
  }, [order, isPickup]);

  const totalFinal = useMemo(
    () => (order?.total ?? 0) + (order?.shipping_cost ?? 0),
    [order?.total, order?.shipping_cost]
  );

  const trackingCode = order?.shipping?.tracking_code?.trim();

  const copyTrackingCode = async () => {
    if (!trackingCode) return;

    try {
      await navigator.clipboard.writeText(trackingCode);
      toast.success("Codigo de rastreio copiado.");
    } catch {
      toast.error("Nao foi possivel copiar o codigo.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Carregando pedido...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-200">
            Pedido não encontrado.
          </p>
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

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    isPickup
      ? PICKUP_FULL
      : `${address.street}, ${address.number} - ${address.city} - ${address.state}, ${address.cep}`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-950 dark:to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm mb-6 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                    Pedido <span className="text-rose-500">#{order.id}</span>
                  </h1>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Revise os detalhes do pedido, itens e documentos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {nfePdfUrl ? (
                  <a
                    href={nfePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm
                               bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 transition
                               dark:bg-white/5 dark:text-rose-200 dark:ring-white/10"
                  >
                    <FileText className="w-4 h-4" />
                    Baixar NF-e
                  </a>
                ) : null}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Data</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {formatDateTimeBr(order.created_at)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium">Pagamento</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {order.payment_method}{" "}
                  <span className="text-slate-400 dark:text-slate-400">
                    ({order.payment_status})
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Entrega</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {order.shipping_method || "—"}
                </p>
              </div>
            </div>

            {/* Endereço / Retirada */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isPickup ? "Endereço para retirada" : "Endereço de entrega"}
                  </span>
                </div>

                {isPickup ? (
                  <span className="text-xs rounded-full px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    Retirada
                  </span>
                ) : (
                  <span className="text-xs rounded-full px-2.5 py-1 bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-white/5 dark:text-rose-200 dark:ring-white/10">
                    Entrega
                  </span>
                )}
              </div>

              <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                <p className="font-medium">
                  {address.street || "—"}
                  {address.number ? `, ${address.number}` : ""}
                  {(address.city || address.state)
                    ? ` — ${address.city ?? ""}/${address.state ?? ""}`
                    : ""}
                </p>

                <p className="text-slate-600 dark:text-slate-300">
                  {address.cep ? `CEP: ${address.cep}` : "CEP: —"}
                  {" • "}
                  {address.phone
                    ? `Tel: ${address.phone}`
                    : isPickup
                    ? "Telefone para contato de retirada: (19) 99189-3513"
                    : "Telefone: —"}
                </p>

                {isPickup && (
                  <div className={`mt-3 rounded-xl border px-3 py-3 ${pickupStatus.className}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide">{pickupStatus.label}</p>
                    <p className="mt-1 text-sm">{pickupStatus.message}</p>
                  </div>
                )}

                {!isPickup && trackingCode && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-3 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                    <p className="text-xs font-semibold uppercase tracking-wide">Codigo de rastreio</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="break-all font-semibold">{trackingCode}</span>
                      <button
                        type="button"
                        onClick={copyTrackingCode}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 dark:bg-white/10 dark:text-rose-100 dark:ring-white/10 dark:hover:bg-white/15"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                  >
                    <MapPin className="w-4 h-4" />
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itens + Total */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-rose-500" />
                  Itens do pedido
                </h2>

                {canRequestReturn && (
                  <button
                    onClick={() => navigate(`/order/${order.id}/support`)}
                    className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                    title="Abrir solicitação de devolução/troca"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Solicitar devolução
                  </button>
                )}
              </div>

              <div className="mt-4 divide-y divide-slate-200 dark:divide-white/10 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                {order.items?.map((it: any) => {
                  const img = getItemImage(it);

                  return (
                    <div
                      key={it.id ?? `${it.product_id}-${it.price}`}
                      className="flex items-start justify-between gap-3 p-4 bg-white dark:bg-transparent"
                    >
                      {/* left */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0 dark:bg-white/5 dark:border-white/10">
                          {img ? (
                            <CachedImage
                              src={getOptimizedImageUrl(img, { width: 112, height: 112, quality: 66 })}
                              fallbackSrc={img}
                              alt={it.product_name ?? "Produto"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              width={112}
                              height={112}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {it.product_name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Quantidade:{" "}
                            <span className="font-medium">{it.quantity}</span>
                          </p>
                        </div>
                      </div>

                      {/* right */}
                      <div className="text-right shrink-0">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          R$ {formatMoney(it.price)}
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          R$ {formatMoney(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(order.items?.length ?? 0) === 0 && (
                  <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    Nenhum item encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Resumo
              </h3>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>R$ {formatMoney(order.total ?? 0)}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Frete</span>
                  <span>R$ {formatMoney(order.shipping_cost ?? 0)}</span>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/10 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    R$ {formatMoney(totalFinal)}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => navigate(`/order/${order.id}/support`)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm
                             bg-rose-500 text-white hover:bg-rose-600 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Abrir ticket de devolução/troca
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm
                             bg-slate-100 text-slate-900 hover:bg-slate-200 transition
                             dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para pedidos
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Dica: se o pedido estiver pago, você pode abrir uma solicitação
                de devolução/troca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
