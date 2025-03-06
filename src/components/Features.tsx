
import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { 
  Layers, 
  Fingerprint, 
  Sparkles, 
  Zap, 
  Globe, 
  Shield
} from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "glass p-8 rounded-2xl opacity-0",
        `delay-${index * 100}`
      )}
    >
      <div className="bg-secondary/50 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Layers size={24} />,
      title: "Thoughtful Design",
      description: "Every detail meticulously crafted for a seamless user experience."
    },
    {
      icon: <Fingerprint size={24} />,
      title: "Unique Identity",
      description: "Stand out with a distinctive aesthetic that reflects your brand values."
    },
    {
      icon: <Sparkles size={24} />,
      title: "Refined Aesthetics",
      description: "Clean lines and balanced proportions create a sense of visual harmony."
    },
    {
      icon: <Zap size={24} />,
      title: "Optimal Performance",
      description: "Lightning-fast responsiveness ensures a smooth interaction at every step."
    },
    {
      icon: <Globe size={24} />,
      title: "Global Accessibility",
      description: "Designed to be inclusive and accessible to users worldwide."
    },
    {
      icon: <Shield size={24} />,
      title: "Robust Security",
      description: "Built with security best practices to protect your data and privacy."
    }
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div ref={sectionRef} className="text-center mb-16 opacity-0">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-secondary rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed with purpose</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our commitment to quality is evident in every interaction, combining beauty with intuitive functionality.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
