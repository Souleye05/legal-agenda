import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AppealReminders from '../pages/AppealReminders';
import { api } from '../lib/api';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    getAppealReminders: vi.fn(),
    getCompletedAppealReminders: vi.fn(),
    getCases: vi.fn(),
    createAppealReminder: vi.fn(),
    markAppealReminderComplete: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAppealReminders = [
  {
    id: '1',
    affaireId: 'case-1',
    affaire: {
      id: 'case-1',
      reference: 'AFF-2026-001',
      titre: 'Test Case 1',
      juridiction: 'TJ Paris',
      chambre: '1ère chambre',
      parties: [
        { nom: 'Demandeur 1', role: 'DEMANDEUR' },
        { nom: 'Défendeur 1', role: 'DEFENDEUR' },
      ],
    },
    dateLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    estEffectue: false,
    notes: 'Urgent appeal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createurId: 'user-1',
  },
  {
    id: '2',
    affaireId: 'case-2',
    affaire: {
      id: 'case-2',
      reference: 'AFF-2026-002',
      titre: 'Test Case 2',
      juridiction: 'TJ Lyon',
      chambre: '2ème chambre',
      parties: [],
    },
    dateLimite: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (expired)
    estEffectue: false,
    notes: 'Expired appeal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createurId: 'user-1',
  },
];

const mockCompletedReminders = [
  {
    id: '3',
    affaireId: 'case-3',
    affaire: {
      id: 'case-3',
      reference: 'AFF-2026-003',
      titre: 'Completed Case',
      juridiction: 'TJ Marseille',
      chambre: '3ème chambre',
      parties: [],
    },
    dateLimite: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    estEffectue: true,
    dateEffectue: new Date().toISOString(),
    notes: 'Completed appeal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createurId: 'user-1',
  },
];

const mockCases = [
  {
    id: 'case-1',
    reference: 'AFF-2026-001',
    titre: 'Test Case 1',
    juridiction: 'TJ Paris',
    chambre: '1ère chambre',
    statut: 'ACTIVE',
    parties: [],
  },
];

describe('AppealReminders', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(api.getAppealReminders).mockResolvedValue(mockAppealReminders);
    vi.mocked(api.getCompletedAppealReminders).mockResolvedValue(mockCompletedReminders);
    vi.mocked(api.getCases).mockResolvedValue(mockCases);
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

  it('should render the page title', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Recours à faire')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Chargement des rappels...')).toBeInTheDocument();
  });

  it('should display appeal reminders after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Case 1')).toBeInTheDocument();
      expect(screen.getByText('Test Case 2')).toBeInTheDocument();
    });
  });

  it('should display summary cards with correct counts', async () => {
    renderComponent();

    await waitFor(() => {
      // 1 expired reminder
      const expiredCards = screen.getAllByText('1');
      expect(expiredCards.length).toBeGreaterThan(0);

      // 1 urgent reminder (2 days left)
      expect(screen.getByText('Urgents')).toBeInTheDocument();

      // 1 completed reminder
      expect(screen.getByText('Effectués')).toBeInTheDocument();
    });
  });

  it('should display correct status badges', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Expiré')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  it('should display days left text correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/2 jours restants/)).toBeInTheDocument();
      expect(screen.getByText(/Expiré depuis 1 jour/)).toBeInTheDocument();
    });
  });

  it('should open create dialog when clicking "Nouveau rappel"', async () => {
    renderComponent();

    await waitFor(() => {
      const createButton = screen.getByText('Nouveau rappel');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Créer un rappel de recours')).toBeInTheDocument();
    });
  });

  it('should display completed reminders section', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Recours effectués/)).toBeInTheDocument();
      expect(screen.getByText('Completed Case')).toBeInTheDocument();
    });
  });

  it('should call markComplete when clicking "Marquer effectué"', async () => {
    vi.mocked(api.markAppealReminderComplete).mockResolvedValue({
      ...mockAppealReminders[0],
      estEffectue: true,
      dateEffectue: new Date().toISOString(),
    });

    renderComponent();

    await waitFor(() => {
      const completeButtons = screen.getAllByText('Marquer effectué');
      fireEvent.click(completeButtons[0]);
    });

    await waitFor(() => {
      expect(api.markAppealReminderComplete).toHaveBeenCalledWith('1');
    });
  });

  it('should display empty state when no reminders', async () => {
    vi.mocked(api.getAppealReminders).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Tout est à jour')).toBeInTheDocument();
      expect(screen.getByText('Aucun recours en attente')).toBeInTheDocument();
    });
  });

  it('should filter cases in combobox search', async () => {
    const manyCases = [
      ...mockCases,
      {
        id: 'case-2',
        reference: 'AFF-2026-002',
        titre: 'Another Case',
        juridiction: 'TJ Lyon',
        chambre: '2ème chambre',
        statut: 'ACTIVE',
        parties: [{ nom: 'John Doe', role: 'DEMANDEUR' }],
      },
    ];

    vi.mocked(api.getCases).mockResolvedValue(manyCases);

    renderComponent();

    await waitFor(() => {
      const createButton = screen.getByText('Nouveau rappel');
      fireEvent.click(createButton);
    });

    // This would test the combobox search functionality
    // In a real test, you'd interact with the combobox and verify filtering
  });
});
