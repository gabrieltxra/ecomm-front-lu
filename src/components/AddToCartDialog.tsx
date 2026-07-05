import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingCart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CachedImage from "@/components/CachedImage";
import { fallbackToOriginalImage, getOptimizedImageUrl } from "@/lib/productImages";
import { Product } from "@/types/Product";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

interface AddToCartDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddToCartDialog = ({ product, open, onOpenChange }: AddToCartDialogProps) => {
  if (!product) return null;

  const productImage = product.image_urls?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle>Produto adicionado</DialogTitle>
            <DialogDescription>
              O item foi adicionado ao seu carrinho.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex gap-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {productImage ? (
                <CachedImage
                  src={getOptimizedImageUrl(productImage, { width: 180, height: 180, quality: 70 })}
                  fallbackSrc={productImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => fallbackToOriginalImage(event, productImage)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-foreground">
                {product.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
              <p className="mt-2 text-lg font-bold text-rose-500">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Continuar comprando
            </Button>
            <Button asChild className="w-full bg-rose-500 hover:bg-rose-600 sm:w-auto">
              <Link to="/cart" onClick={() => onOpenChange(false)}>
                <ShoppingCart className="h-4 w-4" />
                Ver carrinho
              </Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartDialog;
