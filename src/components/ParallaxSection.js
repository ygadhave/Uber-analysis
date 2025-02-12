// src/components/ParallaxSection.js
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = ({ title, content, image }) => {
  const sectionRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=100',
          end: 'bottom center',
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="parallax-section" style={{ backgroundImage: `url(${image})` }}>
      <div className="content">
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    </section>
  );
};

export default ParallaxSection;
