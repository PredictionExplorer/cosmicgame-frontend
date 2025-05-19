import { Typography } from "@mui/material";
import {
  CounterWrapper,
  CounterItem,
  GradientText,
  CounterItemWrapper,
} from "./styled";

/**
 * Interface defining the props for the Counter component
 */
interface CounterProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Interface defining the structure of a time unit display item
 */
interface TimeUnit {
  value: number;
  label: string;
}

/**
 * Counter component displays a countdown timer with days, hours, minutes, and seconds
 * Each time unit is displayed with a gradient text effect and a label below
 */
const Counter: React.FC<CounterProps> = ({ days, hours, minutes, seconds }) => {
  // Helper function to pad single digits with leading zero
  const padZero = (value: number): string => value.toString().padStart(2, "0");

  // Define time units for consistent rendering
  let timeUnits: TimeUnit[] = [
    { value: days, label: "DAYS" },
    { value: hours, label: "HOURS" },
    { value: minutes, label: "MIN" },
    { value: seconds, label: "SEC" },
  ];

  // Apply visibility rules
  if (days === 0) {
    timeUnits = timeUnits.filter((unit) => unit.label !== "DAYS");
  }
  if (days === 0 && hours === 0) {
    timeUnits = timeUnits.filter((unit) => unit.label !== "HOURS");
  }

  return (
    <CounterWrapper>
      {timeUnits.map(({ value, label }) => (
        <CounterItem key={label}>
          <CounterItemWrapper>
            <GradientText align="center" variant="h5" fontSize={31}>
              {padZero(value)}
            </GradientText>
          </CounterItemWrapper>
          <Typography align="center" variant="subtitle1" fontSize={14}>
            {label}
          </Typography>
        </CounterItem>
      ))}
    </CounterWrapper>
  );
};

export default Counter;
