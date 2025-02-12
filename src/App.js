import React, { useState, useEffect } from 'react';
import TimelineChart from './components/TimelineChart';
import WaveformChart from './components/WaveformChart';
import { ChordDiagram } from './components/ChordDiagram';
import NetworkGraph from './components/NetworkGraph';
import BubbleChart from './components/BubbleChart';
import StreamGraph from './components/StreamGraph';
import './App.css';
import { motion } from 'framer-motion';

const App = () => {
  const [progress, setProgress] = useState(0);

  const sections = [
    {
      title: 'Timeline of Music Genre Popularity',
      description:
        'Explore how your favorite genres have evolved over time. This timeline chart reveals the highs and lows of genre popularity across decades, showcasing how societal trends and cultural movements have influenced the music we love.',
      component: <TimelineChart />,
    },
    {
      title: 'Waveform Chart of Popularity',
      description:
        'Delve into the sonic landscape of music genres. The waveform chart lets you compare how genres differ in energy, danceability, and more—revealing their distinct auditory identities.',
      component: <WaveformChart />,
    },
    {
      title: 'Chord Diagram: Genre Relationships',
      description:
        'Uncover the web of musical connections. The chord diagram illustrates how genres influence and collaborate, revealing the interconnected nature of the music industry.',
      component: <ChordDiagram />,
    },
    {
      title: 'Network Graph of Artists and Genres',
      description:
        'Navigate the vibrant world of artist collaborations. This network graph highlights the intricate connections between artists and genres, showcasing how creativity thrives in music.',
      component: <NetworkGraph />,
    },
    {
      title: 'Interactive Bubble Chart of Genre Metrics',
      description:
        'Get a snapshot of genre dominance and diversity. The bubble chart visualizes genre metrics like song count and average popularity, offering a comparative view of music’s rich landscape.',
      component: <BubbleChart />,
    },
    {
      title: 'Stream Graph of Genre Popularity',
      description:
        'Immerse yourself in the flowing dynamics of music trends with this stream graph. It visualizes the rise and fall of genre popularity over time, offering a unique perspective on how genres compete and collaborate for dominance.',
      component: <StreamGraph />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      {/* Progress Bar */}
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>

      <header className="app-header">
        <h1 className="main-title">Evolution of Popular Music Genres</h1>
        <div className="author-info">
          <p>
            By <span className="author">Yashwant Gadhave, Yash Sawant, and Daniel Aguilera</span>
          </p>
          <p className="update-date"> December 6, 2024 </p>
        </div>
      </header>

      <div className="scrollytelling-container">
        {sections.map((section, index) => (
          <div
            key={index}
            id={`section-${index}`}
            className="scrollytelling-section"
            style={{ marginBottom: '50px', padding: '20px 0' }}
          >
            {/* Section Title and Description */}
            <motion.div
              className="section-text"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8 }}
              style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
              }}
            >
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </motion.div>

            {/* Section Visualization */}
            <motion.div
              className="section-visualization"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8 }}
            >
              {section.component}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
