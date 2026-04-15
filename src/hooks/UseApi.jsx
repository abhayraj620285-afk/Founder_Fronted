import { useState, useEffect, useCallback } from "react";
import { fetchDashboardApi, fetchBenchmarkApi, getMyStartupsApi } from "../api/api";

// Generic async hook
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      setState({ data: null, loading: false, error: err.message });
      throw err;
    }
  }, deps);

  return { ...state, run };
}

// Dashboard data hook
export function useDashboard(startupId) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await fetchDashboardApi(id);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(startupId); }, [startupId]);

  return { data, loading, error, reload: load };
}

// Benchmark data hook
export function useBenchmark(startupId) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const res = await fetchBenchmarkApi(id);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(startupId); }, [startupId]);

  return { data, loading, error, reload: load };
}

// Startups list hook
export function useStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyStartupsApi();
      setStartups(list);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  return { startups, loading, reload: load };
}