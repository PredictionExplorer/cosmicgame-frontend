import { Typography } from "@mui/material";

import {
  CounterWrapper,
  CounterItem,
  GradientText,
  CounterItemWrapper,
} from "./styled";

const Counter = ({ days, hours, minutes, seconds }) => {
  const padZero = (x) => x.toString().padStart(2, "0");

  return (
    <CounterWrapper>
      <CounterItem>
        <CounterItemWrapper>
          <GradientText align="center" variant="h5" fontSize={31}>
            {padZero(days)}
          </GradientText>
        </CounterItemWrapper>
        <Typography align="center" variant="subtitle1" fontSize={14}>
          DAYS
        </Typography>
      </CounterItem>
      <CounterItem>
        <CounterItemWrapper>
          <GradientText align="center" variant="h5" fontSize={31}>
            {padZero(hours)}
          </GradientText>
        </CounterItemWrapper>
        <Typography align="center" variant="subtitle1" fontSize={14}>
          HOURS
        </Typography>
      </CounterItem>
      <CounterItem>
        <CounterItemWrapper>
          <GradientText align="center" variant="h5" fontSize={31}>
            {padZero(minutes)}
          </GradientText>
        </CounterItemWrapper>
        <Typography align="center" variant="subtitle1" fontSize={14}>
          MIN
        </Typography>
      </CounterItem>
      <CounterItem>
        <CounterItemWrapper>
          <GradientText align="center" variant="h5" fontSize={31}>
            {padZero(seconds)}
          </GradientText>
        </CounterItemWrapper>
        <Typography align="center" variant="subtitle1" fontSize={14}>
          SEC
        </Typography>
      </CounterItem>
    </CounterWrapper>
  );
};

export default Counter;
