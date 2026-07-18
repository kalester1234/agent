import { create } from 'zustand';

interface PipelineState {
  jobId: string | null;
  status: 'idle' | 'started' | 'running' | 'completed' | 'failed';
  events: any[];
  companyInfo: any | null;
  tasks: string[];
  analyses: any[];
  painPoints: any[];
  opportunities: any[];
  recommendations: any[];
  report: any | null;
  error: string | null;
  startJob: (domain: string) => Promise<void>;
  reset: () => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  jobId: null,
  status: 'idle',
  events: [],
  companyInfo: null,
  tasks: [],
  analyses: [],
  painPoints: [],
  opportunities: [],
  recommendations: [],
  report: null,
  error: null,

  reset: () => set({
    jobId: null,
    status: 'idle',
    events: [],
    companyInfo: null,
    tasks: [],
    analyses: [],
    painPoints: [],
    opportunities: [],
    recommendations: [],
    report: null,
    error: null,
  }),

  startJob: async (domain: string) => {
    get().reset();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      
      if (!res.ok) throw new Error('Failed to start job');
      
      const { job_id } = await res.json();
      set({ jobId: job_id, status: 'started' });

      // Start SSE
      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/stream/${job_id}`);

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        set((state) => {
          const newEvents = [...state.events, data];
          const updates: Partial<PipelineState> = { events: newEvents, status: 'running' };

          if (data.event === 'agent.completed') {
            if (data.data.agent === 'CompanyResolution') {
              updates.companyInfo = data.data.result;
            } else if (data.data.agent === 'ResearchPlanning') {
              updates.tasks = data.data.tasks;
            } else if (data.data.agent === 'PainPointDetection') {
              updates.painPoints = data.data.results;
            } else if (data.data.agent === 'OpportunityDetection') {
              updates.opportunities = data.data.results;
            } else if (data.data.agent === 'RecommendationEngine') {
              updates.recommendations = data.data.results;
            }
          } else if (data.event === 'layer.completed') {
             if (data.data.layer === 'ParallelAnalysis') {
                 updates.analyses = data.data.results;
             }
          } else if (data.event === 'report.completed') {
            updates.report = data.data.report;
            updates.status = 'completed';
            eventSource.close();
          } else if (data.event === 'pipeline.failed') {
            updates.error = data.data.error;
            updates.status = 'failed';
            eventSource.close();
          }

          return updates;
        });
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err: any) {
      set({ error: err.message, status: 'failed' });
    }
  },
}));
