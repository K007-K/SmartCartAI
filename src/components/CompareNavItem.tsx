
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const CompareNavItem = () => {
  const { comparedProducts } = useComparison();
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => navigate("/compare")}
      className="flex items-center relative"
    >
      <GitCompare size={18} className="mr-2" />
      Compare
      {comparedProducts.length > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
          variant="destructive"
        >
          {comparedProducts.length}
        </Badge>
      )}
    </Button>
  );
};

export default CompareNavItem;
