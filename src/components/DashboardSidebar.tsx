
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, GitCompare, LogOut, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Only render the component on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Toggle - positioned in header */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="md:hidden rounded-full w-10 h-10 bg-primary text-primary-foreground"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile Sidebar - positioned at top right */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-40 w-64 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out md:hidden h-auto max-h-[80vh] overflow-y-auto rounded-bl-lg",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Menu</h3>
            <Button variant="ghost" size="sm" onClick={closeSidebar}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={() => {
                navigate("/compare");
                closeSidebar();
              }}
            >
              <GitCompare size={18} className="mr-2" />
              Compare
            </Button>
            
            <Button 
              variant="ghost"
              className="justify-start"
              onClick={() => {
                navigate("/watchlist");
                closeSidebar();
              }}
            >
              <ShoppingBag size={18} className="mr-2" />
              My Watchlist
            </Button>
            
            <Button 
              variant="ghost"
              className="justify-start mt-auto"
              onClick={() => {
                supabase.auth.signOut();
                closeSidebar();
              }}
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
