import { useEffect, useState } from "react";
import { init } from "../fhevmjs";

export const useAppState = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showElection, setShowElection] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await init();
        console.log("Inicialización completada");
        setIsInitialized(true);
      } catch (error) {
        console.error("Error al inicializar:", error);
        setIsInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const showElectionScreen = () => setShowElection(true);
  const hideElectionScreen = () => setShowElection(false);

  return {
    isInitialized,
    loading,
    showElection,
    showElectionScreen,
    hideElectionScreen,
  };
};
