import { CounterWrapper, CounterItem, GradientText, CounterItemWrapper } from '@/components/styled';

interface CounterProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeUnit {
  value: number;
  label: string;
}

const Counter = ({ days, hours, minutes, seconds }: CounterProps) => {
  const padZero = (value: number): string => value.toString().padStart(2, '0');

  let timeUnits: TimeUnit[] = [
    { value: days, label: 'DAYS' },
    { value: hours, label: 'HOURS' },
    { value: minutes, label: 'MIN' },
    { value: seconds, label: 'SEC' },
  ];

  if (days === 0) {
    timeUnits = timeUnits.filter((unit) => unit.label !== 'DAYS');
  }
  if (days === 0 && hours === 0) {
    timeUnits = timeUnits.filter((unit) => unit.label !== 'HOURS');
  }

  return (
    <CounterWrapper>
      {timeUnits.map(({ value, label }) => (
        <CounterItem key={label}>
          <CounterItemWrapper>
            <GradientText className="block text-center text-[31px]">{padZero(value)}</GradientText>
          </CounterItemWrapper>
          <p className="text-center text-sm">{label}</p>
        </CounterItem>
      ))}
    </CounterWrapper>
  );
};

export default Counter;
