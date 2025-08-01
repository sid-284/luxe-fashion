import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroSlides = [
    {
      id: 1,
      title: "9ty two",
      subtitle: "Where Craftsmanship Meets Contemporary Elegance",
      description: "Discover timeless pieces that transcend seasons, crafted with meticulous attention to detail and sustainable practices. Each creation tells a story of passion, precision, and purpose.",
      image: "https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      cta: "Explore Collection",
      link: "/collection-universe",
      accent: "Handcrafted Bliss"
    },
    {
      id: 2,
      title: "9ty two",
      subtitle: "Behind Every Thread, A Story of Excellence",
      description: "Meet the master craftspeople who bring our vision to life, creating pieces that honor tradition while embracing innovation. Experience the artistry that defines luxury.",
      image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?w=1920&h=1080&fit=crop&crop=center",
      cta: "Discover Artisans",
      link: "/collection-universe",
      accent: "Master Crafted"
    },
    {
      id: 3,
      title: "9ty two",
      subtitle: "Luxury with Purpose, Style with Conscience",
      description: "Experience luxury that respects our planet, with ethically sourced materials and responsible production practices. Beauty that doesn't compromise our world.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&crop=center",
      cta: "Learn Our Story",
      link: "/collection-universe",
      accent: "Sustainable Luxury"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-background">
      {/* Hero Slides */}
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-[10s] ease-out hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Enhanced Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <div className="space-y-8 text-white">
                    {/* Accent Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent/20 to-amber-400/20 backdrop-blur-sm rounded-full border border-accent/30">
                      <span className="text-sm font-medium tracking-wider uppercase text-accent">
                        {slide.accent}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                      <p className="text-lg font-medium tracking-wide uppercase opacity-90 text-accent">
                        {slide.subtitle}
                      </p>
                      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
                        <span className="bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
                          {slide.title}
                        </span>
                      </h1>
                    </div>

                    <p className="text-xl sm:text-2xl leading-relaxed opacity-95 max-w-2xl font-light">
                      {slide.description}
                    </p>

                    {/* Enhanced CTA */}
                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                      <Link to={slide.link}>
                        <Button
                          variant="default"
                          size="lg"
                          className="bg-gradient-to-r from-accent to-amber-400 text-black hover:from-accent/90 hover:to-amber-400/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                        >
                          {slide.cta}
                          <Icon name="ArrowRight" size={24} className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </Link>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-md rounded-full px-6 py-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-accent to-amber-400 scale-125 shadow-lg'
                  : 'bg-white/40 hover:bg-white/70 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Arrow Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-gradient-to-r from-accent/20 to-amber-400/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:from-accent/30 hover:to-amber-400/30 transition-all duration-300 border border-white/20 group"
        aria-label="Previous slide"
      >
        <Icon name="ChevronLeft" size={28} className="group-hover:-translate-x-1 transition-transform duration-300" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-gradient-to-r from-accent/20 to-amber-400/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:from-accent/30 hover:to-amber-400/30 transition-all duration-300 border border-white/20 group"
        aria-label="Next slide"
      >
        <Icon name="ChevronRight" size={28} className="group-hover:translate-x-1 transition-transform duration-300" />
      </button>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-12 right-8 z-20">
        <div className="flex flex-col items-center space-y-3 text-white">
          <span className="text-sm font-medium tracking-wider uppercase opacity-90 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent relative">
            <div className="absolute top-0 w-full h-6 bg-gradient-to-b from-accent to-amber-400 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Floating Brand Elements */}
      <div className="absolute top-1/4 right-8 z-10 opacity-10">
        <div className="text-9xl font-display font-bold text-white transform rotate-90 select-none">
          9tyTwo
        </div>
      </div>
    </section>
  );
};

export default HeroSection;