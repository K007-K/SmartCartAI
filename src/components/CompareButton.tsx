
import { Button } from "@/components/ui/button";
import { useComparison, ComparedProduct } from "@/contexts/ComparisonContext";
import { GitCompare } from "lucide-react";
import { toast } from "sonner";

interface CompareButtonProps {
  product: ComparedProduct;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const CompareButton = ({ product, variant = "outline", size = "sm", className }: CompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();
  
  // Safety check - if product or product.id is invalid, don't render the button
  if (!product || !product.id) {
    console.error("Invalid product passed to CompareButton:", product);
    return null;
  }
  
  const inCompare = isInCompare(product.id);

  const handleToggleCompare = () => {
    if (!product || !product.id) {
      toast.error("Cannot add invalid product to comparison");
      return;
    }
    
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <Button
      variant={inCompare ? "default" : variant}
      size={size}
      onClick={handleToggleCompare}
      className={className}
    >
      <GitCompare size={16} className="mr-1" />
      {inCompare ? "Remove from Comparison" : "Compare"}
    </Button>
  );
};

export default CompareButton;
