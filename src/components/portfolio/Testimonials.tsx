import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getCollection<Testimonial>('testimonials', 'order');
      setTestimonials(data);
    }
    load();
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-[#02040a] relative">
       <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
             <div className="inline-flex p-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4 items-center gap-2 px-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">Industry Feedback</span>
             </div>
             <h2 className="text-4xl font-bold tracking-tight">Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Validation</span></h2>
          </div>

          <div className="relative max-w-5xl mx-auto overflow-hidden px-4 md:px-12">
             <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {testimonials.map((item) => (
                  <div key={item.id} className="w-full flex-shrink-0">
                     <div className="bg-[#050816] border border-white/5 rounded-[3rem] p-8 md:p-16 relative group">
                        <Quote className="absolute top-12 left-12 w-24 h-24 text-white/[0.03] -z-0" />
                        
                        <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                           <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-4 h-4", i < item.rating ? "text-yellow-500 fill-current" : "text-white/10")} />
                              ))}
                           </div>
                           
                           <p className="text-xl md:text-3xl font-medium leading-relaxed italic text-white/90 font-serif">
                              "{item.content}"
                           </p>

                           <div className="space-y-2">
                              <div className="text-lg font-bold text-white tracking-tight">{item.name}</div>
                              <div className="text-sm font-medium text-gray-500">{item.role} @ <span className="text-blue-400 font-bold">{item.company}</span></div>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {/* Controls */}
             <div className="flex justify-center mt-12 gap-8 items-center">
                <button onClick={prev} className="p-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                   <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                   {testimonials.map((_, i) => (
                     <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "w-8 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" : "w-3 bg-white/10")} />
                   ))}
                </div>
                <button onClick={next} className="p-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                   <ChevronRight className="w-6 h-6" />
                </button>
             </div>
          </div>
       </div>
    </section>
  );
}
