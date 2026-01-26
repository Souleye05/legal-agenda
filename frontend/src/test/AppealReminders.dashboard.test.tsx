import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppealReminders } from '../components/dashboard/AppealReminders';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    getAppealReminders: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AppealReminders Dashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppealReminders />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should not render when no urgent reminders', async () => {
    vi.mocked(api.getAppealReminders).mockResolvedValue([]);

    const { container } = renderComponent();

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render urgent reminders', async () => {
    const urgentReminders = [
      {
        id: '1',
        affaireId: 'case-1',
        affaire: {
          id: 'case-1',
          reference: 'AFF-2026-001',
          titre: 'Urgent Case',
          juridiction: 'TJ Paris',
          chambre: '1ère chambre',
          parties: [],
        },
        dateLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        estEffectue: false,
        notes: 'Urgent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createurId: 'user-1',
      },
    ];

    vi.mocked(api.getAppealReminders).mockResolvedValue(urgentReminders);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Recours urgents')).toBeInTheDocument();
      expect(screen.getByText('Urgent Case')).toBeInTheDocument();
    });
  });

  it('should display expired badge for expired reminders', async () => {
    const expiredReminders = [
      {
        id: '1',
        affaireId: 'case-1',
        affaire: {
          id: 'case-1',
          reference: 'AFF-2026-001',
          titre: 'Expired Case',
          juridiction: 'TJ Paris',
          chambre: '1ère chambre',
          parties: [],
        },
        dateLimite: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        estEffectue: false,
        notes: 'Expired',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createurId: 'user-1',
      },
    ];

    vi.mocked(api.getAppealReminders).mockResolvedValue(expiredReminders);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Expiré')).toBeInTheDocument();
    });
  });

  it('should display today badge for reminders due today', async () => {
    const todayReminders = [
      {
        id: '1',
        affaireId: 'case-1',
        affaire: {
          id: 'case-1',
          reference: 'AFF-2026-001',
          titre: 'Today Case',
          juridiction: 'TJ Paris',
          chambre: '1ère chambre',
          parties: [],
        },
        dateLimite: new Date().toISOString(), // Today
        estEffectue: false,
        notes: 'Today',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createurId: 'user-1',
      },
    ];

    vi.mocked(api.getAppealReminders).mockResolvedValue(todayReminders);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    });
  });

  it('should display urgent badge for reminders within 3 days', async () => {
    const urgentReminders = [
      {
        id: '1',
        affaireId: 'case-1',
        affaire: {
          id: 'case-1',
          reference: 'AFF-2026-001',
          titre: 'Urgent Case',
          juridiction: 'TJ Paris',
          chambre: '1ère chambre',
          parties: [],
        },
        dateLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        estEffectue: false,
        notes: 'Urgent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createurId: 'user-1',
      },
    ];

    vi.mocked(api.getAppealReminders).mockResolvedValue(urgentReminders);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  it('should limit display to 3 reminders', async () => {
    const manyReminders = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      affaireId: `case-${i + 1}`,
      affaire: {
        id: `case-${i + 1}`,
        reference: `AFF-2026-00${i + 1}`,
        titre: `Case ${i + 1}`,
        juridiction: 'TJ Paris',
        chambre: '1ère chambre',
        parties: [],
      },
      dateLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      estEffectue: false,
      notes: `Reminder ${i + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createurId: 'user-1',
    }));

    vi.mocked(api.getAppealReminders).mockResolvedValue(manyReminders);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Case 1')).toBeInTheDocument();
      expect(screen.getByText('Case 2')).toBeInTheDocument();
      expect(screen.getByText('Case 3')).toBeInTheDocument();
      expect(screen.queryByText('Case 4')).not.toBeInTheDocument();
      expect(screen.getByText(/Voir tous les recours \(5\)/)).toBeInTheDocument();
    });
  });

  it('should not display non-urgent reminders', async () => {
    const reminders = [
      {
        id: '1',
        affaireId: 'case-1',
        affaire: {
          id: 'case-1',
          reference: 'AFF-2026-001',
          titre: 'Not Urgent Case',
          juridiction: 'TJ Paris',
          chambre: '1ère chambre',
          parties: [],
        },
        dateLimite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
        estEffectue: false,
        notes: 'Not urgent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createurId: 'user-1',
      },
    ];

    vi.mocked(api.getAppealReminders).mockResolvedValue(reminders);

    const { container } = renderComponent();

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
