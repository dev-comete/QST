import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardViewer = ({ sessionId, agentId }) => {
  // States to manage the UI
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const startAnalysisFlow = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. OPEN THE LISTENER
      // We do this first so we don't miss the event if the backend is super fast
      const eventSource = new EventSource(`/api/v2/analyses/${sessionId}/only_notifications`);

      // 2. ATTACH THE EVENT LISTENER
      // We listen for the exact event name we sent from C#: "analysis.ready"
      eventSource.addEventListener("analysis.ready", async (event) => {
        console.log("🔔 Signal received! The AI is done.");
        const payload = JSON.parse(event.data);
    
    // 2. You can log or display the formal message!
        console.log(payload.message);
        
        try {
          // 4. FETCH THE FINAL DATA (SI BESOIN FA TSY VOATERY)
          // Now that we know it's ready, we can just GET it!
          const response = await axios.get(
            `/api/v2/analyses/${sessionId}/only_report_global_info?agentId=${agentId}`
          );
          
          setDashboardData(response.data);
          setStatus("success");
          
        } catch (fetchError) {
          console.error("Error fetching the final report:", fetchError);
          setErrorMessage("Failed to retrieve the final dashboard.");
          setStatus("error");
        } finally {
          // 5. CLEAN UP
          // Always close the connection once you have what you need
          eventSource.close();
        }
      });

      // Handle standard SSE connection errors
      eventSource.onerror = (err) => {
        console.error("SSE Connection Error", err);
        eventSource.close();
        setStatus("error");
        setErrorMessage("Lost connection to the server while waiting.");
      };

      // 3. TRIGGER THE BACKGROUND JOB
      // Now that our ears are open, tell the backend to start working.
      await axios.post(`/api/v2/analyses/${sessionId}/only_trigger_analysis?agentId=${agentId}`);
      
    } catch (error) {
      console.error("Failed to start analysis:", error);
      setStatus("error");
      setErrorMessage("Could not start the analysis.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Call Analysis Dashboard</h2>
      
      {status === "idle" && (
        <button onClick={startAnalysisFlow} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Lancer l'analyse
        </button>
      )}

      {status === "loading" && (
        <div style={{ color: 'blue' }}>
          <p>⏳ Analyse en cours en arrière-plan... Veuillez patienter.</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ color: 'red' }}>
          <p>❌ {errorMessage}</p>
          <button onClick={startAnalysisFlow}>Réessayer</button>
        </div>
      )}

      {status === "success" && dashboardData && (
        <div style={{ border: '1px solid green', padding: '15px', marginTop: '20px' }}>
          <h3>✅ Terminé ! (Agent: {dashboardData.agentName})</h3>
          <p><strong>Score:</strong> {dashboardData.performance?.score} / {dashboardData.performance?.totalPoints}</p>
          <p><strong>Résumé:</strong> {dashboardData.summary}</p>
          {/* Render your charts and steps here! */}
        </div>
      )}
    </div>
  );
};

export default DashboardViewer;