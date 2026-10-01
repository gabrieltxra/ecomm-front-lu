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
        "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  if (normalized === "retirado") {
    return {
      label: "Retirado",
      message: "Este pedido já foi retirado.",
      className:
        "border-[#473d35]/10 bg-[#eadfd4] text-[#4d443e]",
    };
  }

  return {
    label: "Aguardando retirada",
    message: "Entraremos em contato quando seu pedido estiver disponível para retirada.",
    className:
      "border-amber-200 bg-amber-50 text-amber-900",
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
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      };
    }
    if (key.includes("pending") || key.includes("pendente")) {
      return {
        label: "Pendente",
        className:
          "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
      };
    }
    if (key.includes("cancelled") || key.includes("cancelado")) {
      return {
        label: "Cancelado",
        className:
          "bg-[#f7e1df] text-[#8f4541] ring-1 ring-[#b45f5a]/20",
      };
    }
    return {
      label: (order as any)?.status || order?.payment_status || "Status",
      className:
        "bg-[#eadfd4] text-[#5e554e] ring-1 ring-[#473d35]/10",
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
      <div className="flex min-h-screen items-center justify-center bg-[#f8f4ed] pt-20">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#e5c7c2] border-t-[#b45f5a]" />
          <p className="text-sm text-[#746860]">
            Carregando pedido...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f4ed] px-4 pt-20">
        <div className="w-full max-w-md rounded-[1.5rem] border border-[#473d35]/10 bg-[#fffaf3] p-6 shadow-[0_20px_60px_rgba(61,45,36,0.1)]">
          <p className="text-[#5e554e]">
            Pedido não encontrado.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#302b27] px-4 py-3 font-semibold text-white transition hover:bg-[#b45f5a]"
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
    <div className="min-h-screen bg-[#f8f4ed] pb-16 pt-20 text-[#302b27]">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#a64f4a] transition hover:text-[#873c38]"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Header Card */}
        <div className="rounded-[1.5rem] border border-[#473d35]/10 bg-[#fffaf3] shadow-[0_18px_55px_rgba(61,45,36,0.07)]">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-elegant text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#302b27] md:text-4xl">
                    Pedido <span className="break-all text-[#a64f4a]">#{order.id}</span>
                  </h1>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#746860]">
                  Revise os detalhes do pedido, itens e documentos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {nfePdfUrl ? (
                  <a
                    href={nfePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#eadfd4] px-4 py-2.5 text-sm font-semibold text-[#8f4541] ring-1 ring-[#b45f5a]/15 transition hover:bg-[#dfcec1]"
                  >
                    <FileText className="w-4 h-4" />
                    Baixar NF-e
                  </a>
                ) : null}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#473d35]/10 bg-[#f8f4ed] p-4">
                <div className="flex items-center gap-2 text-[#4d443e]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Data</span>
                </div>
                <p className="mt-1 text-sm text-[#746860]">
                  {formatDateTimeBr(order.created_at)}
                </p>
              </div>

              <div className="rounded-xl border border-[#473d35]/10 bg-[#f8f4ed] p-4">
                <div className="flex items-center gap-2 text-[#4d443e]">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium">Pagamento</span>
                </div>
                <p className="mt-1 text-sm text-[#746860]">
                  {order.payment_method}{" "}
                  <span className="text-[#9a8d84]">
                    ({order.payment_status})
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-[#473d35]/10 bg-[#f8f4ed] p-4">
                <div className="flex items-center gap-2 text-[#4d443e]">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Entrega</span>
                </div>
                <p className="mt-1 text-sm text-[#746860]">
                  {order.shipping_method || "—"}
                </p>
              </div>
            </div>

            {/* Endereço / Retirada */}
            <div className="mt-4 rounded-2xl border border-[#473d35]/10 bg-[#f8f4ed] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#4d443e]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isPickup ? "Endereço para retirada" : "Endereço de entrega"}
                  </span>
                </div>

                {isPickup ? (
                  <span className="rounded-full bg-[#eadfd4] px-2.5 py-1 text-xs text-[#5e554e]">
                    Retirada
                  </span>
                ) : (
                  <span className="rounded-full bg-[#ead2c9] px-2.5 py-1 text-xs text-[#8f4541] ring-1 ring-[#b45f5a]/15">
                    Entrega
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm text-[#4d443e]">
                <p className="font-medium">
                  {address.street || "—"}
                  {address.number ? `, ${address.number}` : ""}
                  {(address.city || address.state)
                    ? ` — ${address.city ?? ""}/${address.state ?? ""}`
                    : ""}
                </p>

                <p className="text-[#746860]">
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
                  <div className="mt-3 rounded-xl border border-[#b45f5a]/15 bg-[#ead2c9]/55 px-3 py-3 text-[#743c38]">
                    <p className="text-xs font-semibold uppercase tracking-wide">Codigo de rastreio</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="break-all font-semibold">{trackingCode}</span>
                      <button
                        type="button"
                        onClick={copyTrackingCode}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fffaf3] px-3 py-2 text-sm font-semibold text-[#8f4541] ring-1 ring-[#b45f5a]/15 transition hover:bg-white"
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#a64f4a] transition hover:text-[#873c38]"
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
          <div className="rounded-[1.5rem] border border-[#473d35]/10 bg-[#fffaf3] shadow-[0_18px_55px_rgba(61,45,36,0.07)] lg:col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-elegant text-xl font-semibold text-[#302b27]">
                  <Package className="h-5 w-5 text-[#b45f5a]" />
                  Itens do pedido
                </h2>

                {canRequestReturn && (
                  <button
                    onClick={() => navigate(`/order/${order.id}/support`)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#a64f4a] transition hover:text-[#873c38]"
                    title="Abrir solicitação de devolução/troca"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Solicitar devolução
                  </button>
                )}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#473d35]/10 divide-y divide-[#473d35]/10">
                {order.items?.map((it: any) => {
                  const img = getItemImage(it);

                  return (
                    <div
                      key={it.id ?? `${it.product_id}-${it.price}`}
                      className="flex items-start justify-between gap-3 bg-[#f8f4ed]/70 p-4"
                    >
                      {/* left */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#473d35]/10 bg-[#eadfd4]">
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
                            <ImageIcon className="h-5 w-5 text-[#9a8d84]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#302b27]">
                            {it.product_name}
                          </p>
                          <p className="text-sm text-[#746860]">
                            Quantidade:{" "}
                            <span className="font-medium">{it.quantity}</span>
                          </p>
                        </div>
                      </div>

                      {/* right */}
                      <div className="text-right shrink-0">
                        <p className="font-sans text-sm tabular-nums text-[#746860]">
                          R$ {formatMoney(it.price)}
                        </p>
                        <p className="font-sans font-bold tabular-nums text-[#302b27]">
                          R$ {formatMoney(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(order.items?.length ?? 0) === 0 && (
                  <div className="p-4 text-sm text-[#746860]">
                    Nenhum item encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#473d35]/10 bg-[#efe5dc] shadow-[0_18px_55px_rgba(61,45,36,0.07)]">
            <div className="p-6">
              <h3 className="font-elegant text-xl font-semibold text-[#302b27]">
                Resumo
              </h3>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#746860]">
                  <span>Subtotal</span>
                  <span>R$ {formatMoney(order.total ?? 0)}</span>
                </div>

                <div className="flex justify-between text-[#746860]">
                  <span>Frete</span>
                  <span>R$ {formatMoney(order.shipping_cost ?? 0)}</span>
                </div>

                <div className="mt-3 flex justify-between border-t border-[#473d35]/15 pt-3">
                  <span className="font-semibold text-[#302b27]">
                    Total
                  </span>
                  <span className="font-sans font-bold tabular-nums text-[#302b27]">
                    R$ {formatMoney(totalFinal)}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => navigate(`/order/${order.id}/support`)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b45f5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9f4e49]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Abrir ticket de devolução/troca
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#473d35]/15 bg-[#fffaf3] px-4 py-3 text-sm font-semibold text-[#302b27] transition hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para pedidos
                </button>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#7b6f66]">
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
