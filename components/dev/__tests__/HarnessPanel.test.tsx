import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HarnessPanel from '@/components/dev/HarnessPanel';

const controlMock = {
  status: {
    ready: true,
    scenario: 'quiet',
    pace: 'demo',
    paused: false,
    cycle: {
      index: '7',
      active: true,
      opened: true,
      secondsUntilActivation: '-5',
      secondsUntilFinalization: '95',
      finalizationTime: '1780000000',
      lastGestureAddress: '0x1111111111111111111111111111111111111111',
      nextEthGestureCost: '1000',
      nextCstGestureCost: '0',
    },
    personas: [{ name: 'Nova', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }],
    scenarios: ['ambient', 'quiet', 'final-ten'],
  },
  error: null as string | null,
  switchScenario: jest.fn().mockResolvedValue(undefined),
  makeGesture: jest.fn().mockResolvedValue(undefined),
  finalizeCycle: jest.fn().mockResolvedValue(undefined),
  setPaused: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/hooks/useHarnessControl', () => ({
  useHarnessControl: () => controlMock,
}));

jest.mock('wagmi', () => ({
  useConfig: () => ({ mockWagmiConfig: true }),
}));

const burnerMock = {
  harnessPersonaOptions: jest.fn(() => [
    { name: 'Nova', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    { name: 'Lyra', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
  ]),
  connectHarnessBurner: jest.fn().mockResolvedValue('Nova'),
  setHarnessPersona: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/components/wallet/harness-burner', () => burnerMock);

describe('HarnessPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts collapsed and connects the burner wallet on mount', async () => {
    render(<HarnessPanel />);
    expect(screen.getByTestId('harness-open')).toBeInTheDocument();
    await waitFor(() =>
      expect(burnerMock.connectHarnessBurner).toHaveBeenCalledWith({ mockWagmiConfig: true }),
    );
  });

  it('opens, shows live cycle facts, and drives scenario + gestures', async () => {
    const user = userEvent.setup();
    render(<HarnessPanel />);

    await user.click(screen.getByTestId('harness-open'));
    expect(screen.getByTestId('harness-panel')).toBeInTheDocument();
    expect(screen.getByTestId('harness-cycle-index')).toHaveTextContent('7');
    expect(screen.getByTestId('harness-finalization-in')).toHaveTextContent('1m 35s');

    await user.selectOptions(screen.getByTestId('harness-scenario-select'), 'final-ten');
    expect(controlMock.switchScenario).toHaveBeenCalledWith('final-ten');

    await user.click(screen.getByTestId('harness-gesture-eth'));
    await waitFor(() =>
      expect(controlMock.makeGesture).toHaveBeenCalledWith({ persona: 'Nova', kind: 'eth' }),
    );

    await user.click(screen.getByTestId('harness-finalize'));
    await waitFor(() => expect(controlMock.finalizeCycle).toHaveBeenCalled());

    await user.click(screen.getByTestId('harness-pause'));
    await waitFor(() => expect(controlMock.setPaused).toHaveBeenCalledWith(true));
  });

  it('switches burner personas from the selector', async () => {
    const user = userEvent.setup();
    render(<HarnessPanel />);
    await user.click(screen.getByTestId('harness-open'));

    await waitFor(() => expect(screen.getByTestId('harness-persona-select')).toContainHTML('Lyra'));
    await user.selectOptions(screen.getByTestId('harness-persona-select'), 'Lyra');
    await waitFor(() =>
      expect(burnerMock.setHarnessPersona).toHaveBeenCalledWith({ mockWagmiConfig: true }, 'Lyra'),
    );
  });

  it('surfaces director errors as an alert', async () => {
    const user = userEvent.setup();
    controlMock.error = 'director offline';
    render(<HarnessPanel />);
    await user.click(screen.getByTestId('harness-open'));
    expect(screen.getByRole('alert')).toHaveTextContent('director offline');
    controlMock.error = null;
  });
});
