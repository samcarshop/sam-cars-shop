import { useRef, useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  vehicle?: string;
  date: string;
  is_visible: boolean;
  sort_order: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? 'fill-gold text-gold' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const titleRef = useReveal();
  const { settings } = useSiteSettings();

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });
        if (data) setReviews(data);
      } catch (e) {
        console.error('Error loading reviews');
      }
    }
    loadReviews();
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const bg = settings.section_reviews_bg;

  return (
    <section className="py-24 relative overflow-hidden" style={bg ? { background: bg } : { background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="reveal text-center mb-16">
          <p className="section-subtitle mb-4">{settings.reviews_section_subtitle}</p>
          <h2 className="section-title mb-6">
            {settings.reviews_section_title.split(' ').slice(0, -2).join(' ')}<br />
            <span className="gold-gradient-text">{settings.reviews_section_title.split(' ').slice(-2).join(' ')}</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gold/40" />
            <div className="w-1 h-1 bg-gold rotate-45" />
            <div className="h-px w-16 bg-gold/40" />
          </div>

          {/* Global rating */}
          <div className="inline-flex items-center gap-3 bg-black-700 border border-gold/20 px-6 py-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className="fill-gold text-gold" />
              ))}
            </div>
            <span className="font-serif text-gold text-xl">{avgRating}</span>
            <span className="font-sans text-xs text-gray-400">/ 5 — {reviews.length} avis vérifiés</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} delay={i * 100} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}

function ReviewCard({ review, delay }: { review: Review; delay: number }) {
  const ref = useReveal(delay);

  return (
    <div ref={ref} className="reveal review-card p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <StarRating rating={review.rating} />
        <Quote size={20} className="text-gold/30" />
      </div>

      <p className="font-serif text-gray-300 font-light leading-relaxed text-sm flex-grow mb-5">
        "{review.text}"
      </p>

      {review.vehicle && (
        <p className="font-sans text-xs text-gold/60 tracking-wider uppercase mb-4">
          {review.vehicle}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-black-400">
        <div>
          <p className="font-sans text-sm text-white font-medium">{review.name}</p>
          <p className="font-sans text-xs text-gray-500">{review.location}</p>
        </div>
        <p className="font-sans text-xs text-gray-600">{review.date}</p>
      </div>
    </div>
  );
}
