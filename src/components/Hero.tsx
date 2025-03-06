
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const parallaxElements = heroRef.current.querySelectorAll('.parallax');
      
      parallaxElements.forEach((element, index) => {
        const speed = (index + 1) * 0.05;
        const yPos = scrollY * speed;
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl parallax" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-100/20 blur-3xl parallax" />
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto text-center pt-24">
        <span className="inline-block px-3 py-1 mb-6 text-xs font-medium bg-secondary rounded-full animate-fade-in">
          Discover the future of design
        </span>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
          <span className="block">Beautiful design</span>
          <span className="block mt-2">meets functionality</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up delay-200">
          Experience the perfect balance of form and function. Crafted with precision and care for those who appreciate the details.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
          <Button size="lg" className="rounded-full px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">
            Learn More
          </Button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-slide-up delay-500">
          <span className="text-sm font-medium mb-2 text-muted-foreground">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
