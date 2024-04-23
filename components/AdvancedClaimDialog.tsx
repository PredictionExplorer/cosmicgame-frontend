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
import { useEffect, useState } from "react";
import { useStakedToken } from "../contexts/StakedTokenContext";
import api from "../services/api";

const TokenRow = ({ row, stakeState, setStakeState }) => {
  const [namesHistory, setNamesHistory] = useState([]);
  const { data: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);
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
      if (
        !stakeState.unstake ||
        !stakeState.claim ||
        (!stakedActionIds.includes(row.StakeActionId) &&
          stakedTokenIds.includes(row.TokenId))
      ) {
        return true;
      }
    }
    return false;
  };
  useEffect(() => {
    const fetchNamesHistory = async () => {
      const names = await api.get_name_history(row.TokenId);
      setNamesHistory(names);
    };
    fetchNamesHistory();
  }, []);
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${row.TokenId}`}
          target="_blank"
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {namesHistory.length > 0 ? namesHistory[namesHistory.length - 1] : " "}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          sx={{ p: 0 }}
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
          sx={{ p: 0 }}
          checked={stakeState.claim}
          disabled={isDisabled("claim")}
          onChange={(e) =>
            setStakeState({
              ...stakeState,
              claim: e.target.checked,
              restake: stakeState.restake && e.target.checked,
            })
          }
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Checkbox
          size="small"
          sx={{ p: 0 }}
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
      claim: !isAllSelected.unstake || isAllSelected.claim,
      restake: !isAllSelected.unstake || isAllSelected.restake,
    });
  };
  const handleSelectClaimAll = () => {
    const newArray = stakeState.map((x) => ({
      ...x,
      claim: isAllSelected.claim && x.unstake,
      restake: isAllSelected.claim && x.restake,
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      claim: !isAllSelected.claim,
      restake:
        !isAllSelected.unstake || !isAllSelected.claim || isAllSelected.restake,
    });
  };
  const handleSelectRestakeAll = () => {
    const newArray = stakeState.map((x) => ({
      ...x,
      restake:
        isAllSelected.restake &&
        x.unstake &&
        x.claim &&
        (stakedActionIds.includes(x.StakeActionId) ||
          !stakedTokenIds.includes(x.TokenId)),
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      restake: !isAllSelected.restake,
    });
  };
  const isDisabled = (type) => {
    if (type === "unstake") {
      const filtered = stakeState.filter((x) =>
        stakedActionIds.includes(x.StakeActionId)
      );
      return filtered.length === 0;
    }
    if (type === "claim") {
      const filtered = stakeState.filter((x) => x.unstake);
      return filtered.length === 0;
    }
    if (type === "restake") {
      const filtered = stakeState.filter(
        (x) =>
          x.unstake &&
          x.claim &&
          (stakedActionIds.includes(x.StakeActionId) ||
            !stakedTokenIds.includes(x.TokenId))
      );
      return filtered.length === 0;
    }
  };

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
              <TablePrimaryHeadCell style={{ maxWidth: "100px" }}>
                Token Name
              </TablePrimaryHeadCell>
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
        <Button
          size="small"
          onClick={handleSelectUnstakeAll}
          sx={{ textTransform: "none", mr: 1 }}
          disabled={isDisabled("unstake")}
        >
          Unstake All
        </Button>
        <Button
          size="small"
          onClick={handleSelectClaimAll}
          sx={{ textTransform: "none", mr: 1 }}
          disabled={isDisabled("claim")}
        >
          Claim All
        </Button>
        <Button
          size="small"
          onClick={handleSelectRestakeAll}
          disabled={isDisabled("restake")}
          sx={{ textTransform: "none" }}
        >
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
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  // const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSendTransaction = async () => {
    handleClose();
    handleUnstakeClaimRestake(
      "unstaked, claimed and restaked",
      stakeState
        .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
        .map((x) => x.StakeActionId),
      stakeState.filter((x) => x.restake).map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.StakeActionId),
      stakeState.filter((x) => x.claim).map((x) => x.DepositId)
    );
  };
  const canSendTransaction = () => {
    const unstakeActionIds = stakeState
      .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
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
            sx={{ textTransform: "none" }}
          >
            Send Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
