import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RecordHearingResult from '../pages/RecordHearingResult';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    recordHearingResult: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHearing = {
  id: 'hearing-1',
  date: new Date('2026-01-25').toISOString(),
  heure: '14:00',
  type: 'PLAIDOIRIE',
  statut: 'A_VENIR',
  affaireId: 'case-1',
  affaire: {
    id: 'case-1',
    reference: 'AFF-2026-001',
    titre: 'Test Case',
    juridiction: 'TJ Paris',
    chambre: '1ère chambre',
    parties: [],
  },
  resultat: null,
};

describe('RecordHearingResult - Appeal Reminder Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue(mockHearing);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/audiences/:id/renseigner" element={<RecordHearingResult />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should display appeal reminder checkbox for DELIBERE type', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Case')).toBeInTheDocument();
    });

    // Select DELIBERE
    const delibereOption = screen.getByLabelText('Délibéré');
    fireEvent.click(delibereOption);

    await waitFor(() => {
      expect(screen.getByText('Créer un rappel de recours (recommandé)')).toBeInTheDocument();
    });
  });

  it('should have appeal reminder checkbox checked by default', async () => {
    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /Créer un rappel de recours/ });
      expect(checkbox).toBeChecked();
    });
  });

  it('should show appeal reminder fields when checkbox is checked', async () => {
    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    await waitFor(() => {
      expect(screen.getByText('Date limite du recours')).toBeInTheDocument();
      expect(screen.getByText('Notes sur le recours (optionnel)')).toBeInTheDocument();
      expect(screen.getByText('Par défaut : 10 jours après le délibéré')).toBeInTheDocument();
    });
  });

  it('should hide appeal reminder fields when checkbox is unchecked', async () => {
    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /Créer un rappel de recours/ });
      fireEvent.click(checkbox); // Uncheck
    });

    await waitFor(() => {
      expect(screen.queryByText('Date limite du recours')).not.toBeInTheDocument();
    });
  });

  it('should not show appeal reminder for RENVOI type', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Case')).toBeInTheDocument();
    });

    // RENVOI is selected by default
    expect(screen.queryByText('Créer un rappel de recours')).not.toBeInTheDocument();
  });

  it('should not show appeal reminder for RADIATION type', async () => {
    renderComponent();

    await waitFor(() => {
      const radiationOption = screen.getByLabelText('Radiation');
      fireEvent.click(radiationOption);
    });

    await waitFor(() => {
      expect(screen.queryByText('Créer un rappel de recours')).not.toBeInTheDocument();
    });
  });

  it('should submit with appeal reminder data when DELIBERE is selected', async () => {
    vi.mocked(api.recordHearingResult).mockResolvedValue({
      id: 'result-1',
      type: 'DELIBERE',
      texteDelibere: 'Test deliberation',
    });

    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    // Fill in deliberation text
    const textarea = screen.getByPlaceholderText(/Ex: Condamnation/);
    fireEvent.change(textarea, { target: { value: 'Test deliberation' } });

    // Submit form
    const submitButton = screen.getByText('Enregistrer le résultat');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.recordHearingResult).toHaveBeenCalledWith(
        'hearing-1',
        expect.objectContaining({
          type: 'DELIBERE',
          texteDelibere: 'Test deliberation',
          creerRappelRecours: true,
          dateLimiteRecours: expect.any(String),
        })
      );
    });
  });

  it('should not submit appeal reminder data when checkbox is unchecked', async () => {
    vi.mocked(api.recordHearingResult).mockResolvedValue({
      id: 'result-1',
      type: 'DELIBERE',
      texteDelibere: 'Test deliberation',
    });

    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    // Uncheck appeal reminder
    const checkbox = screen.getByRole('checkbox', { name: /Créer un rappel de recours/ });
    fireEvent.click(checkbox);

    // Fill in deliberation text
    const textarea = screen.getByPlaceholderText(/Ex: Condamnation/);
    fireEvent.change(textarea, { target: { value: 'Test deliberation' } });

    // Submit form
    const submitButton = screen.getByText('Enregistrer le résultat');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.recordHearingResult).toHaveBeenCalledWith(
        'hearing-1',
        expect.objectContaining({
          type: 'DELIBERE',
          texteDelibere: 'Test deliberation',
        })
      );

      // Should not include appeal reminder fields
      const call = vi.mocked(api.recordHearingResult).mock.calls[0][1];
      expect(call).not.toHaveProperty('creerRappelRecours');
    });
  });

  it('should include custom notes when provided', async () => {
    vi.mocked(api.recordHearingResult).mockResolvedValue({
      id: 'result-1',
      type: 'DELIBERE',
      texteDelibere: 'Test deliberation',
    });

    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    // Fill in deliberation text
    const deliberationTextarea = screen.getByPlaceholderText(/Ex: Condamnation/);
    fireEvent.change(deliberationTextarea, { target: { value: 'Test deliberation' } });

    // Fill in appeal notes
    const notesTextarea = screen.getByPlaceholderText(/Ex: Vérifier les délais/);
    fireEvent.change(notesTextarea, { target: { value: 'Custom appeal notes' } });

    // Submit form
    const submitButton = screen.getByText('Enregistrer le résultat');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.recordHearingResult).toHaveBeenCalledWith(
        'hearing-1',
        expect.objectContaining({
          type: 'DELIBERE',
          texteDelibere: 'Test deliberation',
          creerRappelRecours: true,
          notesRecours: 'Custom appeal notes',
        })
      );
    });
  });

  it('should validate required fields before submission', async () => {
    renderComponent();

    await waitFor(() => {
      const delibereOption = screen.getByLabelText('Délibéré');
      fireEvent.click(delibereOption);
    });

    // Try to submit without filling deliberation text
    const submitButton = screen.getByText('Enregistrer le résultat');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.recordHearingResult).not.toHaveBeenCalled();
    });
  });
});
