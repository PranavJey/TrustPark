import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';

import Navbar from './components/Navbar.jsx';
import DriverView from './components/DriverView.jsx';
import ComparisonView from './components/ComparisonView.jsx';
import SimulatorView from './components/SimulatorView.jsx';
import OperatorView from './components/OperatorView.jsx';
import ApiDocsView from './components/ApiDocsView.jsx';

import { INITIAL_ZONES } from './mockData/initialZones.js';
import { rankParkingZones } from './engine/recommendationEngine.js';
import { updateUserTrustScore } from './engine/dataQualityEngine.js';

function App() {
  const [activeView, setActiveView] = useState('driver');
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);
  const [zones, setZones] = useState(() =>
    INITIAL_ZONES.map(z => ({ ...z }))
  );

  // User request defaults (guest mode — no mandatory registration)
  const userRequest = {
    desiredDurationMinutes: 60,
    hasResidentPermit: false,
    needsAccessible: false,
    isEV: false,
    vehicleType: 'sedan',
    arrivalTime: new Date(),
  };

  // Compute ranked zones whenever zones or demand change
  const rankedZones = rankParkingZones(zones, userRequest, demandMultiplier);

  // Count active conflicts for the Navbar badge
  const activeConflictCount = rankedZones.filter(
    z => z.pred.conflictAnalysis?.conflictStatus !== 'none'
  ).length;

  // Simulate live data: age all reports by 1 second every 5s tick to show freshness decay
  const tickRef = useRef(null);
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setZones(prev =>
        prev.map(z => ({
          ...z,
          lastVerifiedSecondsAgo: z.lastVerifiedSecondsAgo + 5,
        }))
      );
    }, 5000);
    return () => clearInterval(tickRef.current);
  }, []);

  // Handle user report submission from zone cards
  const handleReport = useCallback((zone, eventType) => {
    const reporterId = 'user-gamma-12'; // Guest session user
    setZones(prev =>
      prev.map(z => {
        if (z.id !== zone.id) return z;
        const newReport = {
          id: `rep-${zone.id}-${Date.now()}`,
          event: eventType,
          timestamp: new Date().toISOString(),
          userId: reporterId,
          userName: 'You (Guest)',
          userTrust: 0.62,
          confidence: 0.65,
          locationAccuracyMeters: 20,
          note: `Quick report: ${eventType}`,
        };
        return {
          ...z,
          lastVerifiedSecondsAgo: 0,
          reportsHistory: [newReport, ...z.reportsHistory].slice(0, 10),
        };
      })
    );
  }, []);

  // Handle driver feedback after parking attempt
  const handleFeedback = useCallback((zoneId, feedbackType) => {
    const wasCorrect = feedbackType === 'found';
    setZones(prev =>
      prev.map(z => {
        if (z.id !== zoneId) return z;
        const latestReport = z.reportsHistory?.[0];
        if (!latestReport) return z;

        const updatedTrust = updateUserTrustScore(
          latestReport.userTrust,
          wasCorrect,
          latestReport.locationAccuracyMeters
        );

        const updatedHistory = z.reportsHistory.map((r, i) =>
          i === 0 ? { ...r, userTrust: updatedTrust } : r
        );

        // Adjust base historical probability slightly based on feedback
        const probDelta = wasCorrect ? 0.02 : -0.05;
        const newBase = Math.max(0.1, Math.min(0.99, z.baseHistoricalProbability + probDelta));

        return {
          ...z,
          reportsHistory: updatedHistory,
          baseHistoricalProbability: newBase,
        };
      })
    );
  }, []);

  const viewProps = { rankedZones, demandMultiplier, allZones: zones };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        demandMultiplier={demandMultiplier}
        setDemandMultiplier={setDemandMultiplier}
        activeConflictCount={activeConflictCount}
      />

      <main className="flex-1 overflow-hidden">
        {activeView === 'driver' && (
          <DriverView
            {...viewProps}
            onReport={handleReport}
            onFeedback={handleFeedback}
          />
        )}
        {activeView === 'comparison' && (
          <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <ComparisonView {...viewProps} />
          </div>
        )}
        {activeView === 'simulator' && (
          <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <SimulatorView
              {...viewProps}
              onDemandChange={setDemandMultiplier}
            />
          </div>
        )}
        {activeView === 'operator' && (
          <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <OperatorView {...viewProps} />
          </div>
        )}
        {activeView === 'apiDocs' && (
          <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <ApiDocsView />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
