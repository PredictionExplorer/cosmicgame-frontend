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
    if (field === "restake") {
      if (!stakeState.unstake) {
        return true;
      }
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
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);
  const [isAllSelected, setAllSelected] = useState({
    unstake: true,
    claim: true,
    restake: true,
  });
  const updateStakeState = (index, param) => {
    const newArray = [...stakeState];
    newArray[index] = param;
    setStakeState(newArray);
  };
  const handleSelectUnstakeAll = () => {
    const newArray = stakeState.map((x) => ({
      ...x,
      unstake:
        !stakedActionIds.includes(x.StakeActionId) || isAllSelected.unstake,
      claim: x.claim && isAllSelected.unstake,
      restake: x.restake && isAllSelected.unstake,
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      unstake: !isAllSelected.unstake,
    });
  };
  const handleSelectClaimAll = () => {
    const newArray = stakeState.map((x) => ({
      ...x,
      claim: isAllSelected.claim && x.unstake,
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      claim: !isAllSelected.claim,
    });
  };
  const handleSelectRestakeAll = () => {
    const newArray = stakeState.map((x) => ({
      ...x,
      restake: isAllSelected.restake && x.unstake,
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      restake: !isAllSelected.restake,
    });
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
        <Button size="small" onClick={handleSelectUnstakeAll} sx={{ mr: 1 }}>
          Unstake All
        </Button>
        <Button size="small" onClick={handleSelectClaimAll} sx={{ mr: 1 }}>
          Claim All
        </Button>
        <Button size="small" onClick={handleSelectRestakeAll}>
          Restake All
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
  const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSendTransaction = async () => {
    handleClose();
    handleUnstakeClaimRestake(
      "unstaked, claimed and restaked",
      stakeState
        .filter((x) => x.unstake && stakedTokenIds.includes(x.TokenId))
        .map((x) => x.StakeActionId),
      stakeState.filter((x) => x.restake).map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.DepositId)
    );
  };
  const canSendTransaction = () => {
    const unstakeActionIds = stakeState
      .filter((x) => x.unstake && stakedTokenIds.includes(x.TokenId))
      .map((X) => X.StakeActionId);
    const claimActionIds = stakeState
      .filter((x) => x.claim)
      .map((x) => x.StakeActionId);
    const restakeActionIds = stakeState
      .filter((x) => x.restake)
      .map((x) => x.StakeActionId);
    if (
      unstakeActionIds.length === 0 &&
      claimActionIds.length === 0 &&
      restakeActionIds.length === 0
    ) {
      return true;
    }
    return false;
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
          <Button
            disabled={canSendTransaction()}
            onClick={handleSendTransaction}
          >
            Send Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
