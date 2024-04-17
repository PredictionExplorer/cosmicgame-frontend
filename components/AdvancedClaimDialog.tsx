import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Pagination,
  TableBody,
  Typography,
} from "@mui/material";
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from "./styled";
import { Tr } from "react-super-responsive-table";
import { useState } from "react";
import { useStakedToken } from "../contexts/StakedTokenContext";

const TokenRow = ({ row, stakeState, setStakeState }) => {
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const isDisabled = (field) => {
    if (row.UnstakeEligibleTimeStamp > row.CurChainTimeStamp) {
      return true;
    }
    if (field === "unstake") {
      if (stakedActionIds.includes(row.StakeActionId)) {
        return false;
      }
      return true;
    }
    if (field === "claim" && !stakeState.unstake) {
      return true;
    }
    if (field === "restake" && !stakeState.unstake) {
      return true;
    }
    return false;
  };
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          href={`/detail/${row.TokenId}`}
          target="_blank"
          sx={{ color: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.unstake}
          disabled={isDisabled("unstake")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              unstake: e.target.checked,
              claim: stakeState.claim && e.target.checked,
              restake: stakeState.restake && e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.claim}
          disabled={isDisabled("claim")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              claim: e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          checked={stakeState.restake}
          disabled={isDisabled("restake")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              restake: e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const TokensTable = ({ stakeState, setStakeState }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const updateStakeState = (index, param) => {
    const newArray = [...stakeState];
    newArray[index] = param;
    setStakeState(newArray);
  };
  const handleUnstakeAll = () => {
    const newArray = stakeState.map((x) => ({ ...x, unstake: true }));
    setStakeState(newArray);
  };
  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell />
              <TablePrimaryHeadCell>Unstake</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Claim</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Restake</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {stakeState
              .slice((page - 1) * perPage, page * perPage)
              .map((row, index) => (
                <TokenRow
                  row={row}
                  key={row.RecordId}
                  stakeState={stakeState[(page - 1) * perPage + index]}
                  setStakeState={(param) =>
                    updateStakeState((page - 1) * perPage + index, param)
                  }
                />
              ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          color="primary"
          page={page}
          onChange={(_e, page) => setPage(page)}
          count={Math.ceil(stakeState.length / perPage)}
          hideNextButton
          hidePrevButton
          shape="rounded"
        />
      </Box>
      <Box mt={2}>
        <Button size="small" onClick={handleUnstakeAll}>
          Unstake All
        </Button>
      </Box>
    </>
  );
};

export default function AdvancedClaimDialog({
  stakeState,
  setStakeState,
  open,
  setOpen,
  handleUnstakeClaimRestake,
}) {
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSendTransaction = async () => {
    handleClose();
    console.log(stakeState
      .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
      .map((X) => X.StakeActionId));
    handleUnstakeClaimRestake(
      "unstaked, claimed and restaked",
      stakeState
        .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
        .map((X) => X.StakeActionId),
      stakeState.filter((x) => x.restake).map((X) => X.StakeActionId),
      stakeState.filter((x) => x.claim).map((X) => X.StakeActionId),
      stakeState.filter((x) => x.claim).map((X) => X.DepositId)
    );
  };

  return (
    <>
      <Dialog
        open={open}
        fullWidth
        maxWidth="md"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Advanced Transaction Build
        </DialogTitle>
        <DialogContent>
          <TokensTable stakeState={stakeState} setStakeState={setStakeState} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendTransaction}>Send Transaction</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
