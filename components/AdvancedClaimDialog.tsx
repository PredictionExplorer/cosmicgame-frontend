import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  TableBody,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
import { CustomPagination } from "./CustomPagination";

const TokenRow = ({ row, stakeState, setStakeState }) => {
  const [tokenName, setTokenName] = useState("");
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const isDisabled = (field) => {
    if (field === "unstake") {
      if (stakedActionIds.includes(row.StakeActionId)) {
        return false;
      }
      return true;
    }
    if (field === "claim" && !stakeState.unstake) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    const getTokenName = async () => {
      if (row.IsRandomWalk) {
        const res = await api.get_info(row.TokenId);
        setTokenName(res.CurName);
      } else {
        const names = await api.get_name_history(row.TokenId);
        if (names.length > 0) {
          setTokenName(names[names.length - 1].TokenName);
        }
      }
    };
    getTokenName();
  }, []);
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell align="center">
        <Link
          href={
            row.IsRandomWalk
              ? `https://randomwalknft.com/detail/${row.TokenId}`
              : `/detail/${row.TokenId}`
          }
          target="_blank"
          sx={{ color: "inherit", fontSize: "inherit" }}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {tokenName === "" ? " " : tokenName}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {!isDisabled("unstake") ? (
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
              })
            }
          />
        ) : (
          " "
        )}
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
  const { cstokens: stakedTokens } = useStakedToken();
  const stakedActionIds = stakedTokens.map((x) => x.TokenInfo.StakeActionId);
  const stakedTokenIds = stakedTokens.map((x) => x.TokenInfo.TokenId);
  const [isAllSelected, setAllSelected] = useState({
    unstake: true,
    claim: true,
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
    }));
    setStakeState(newArray);
    setAllSelected({
      ...isAllSelected,
      unstake: !isAllSelected.unstake,
      claim: !isAllSelected.unstake || isAllSelected.claim,
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
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={stakeState.length}
        perPage={perPage}
      />
      {stakeState.length > 1 && (
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
        </Box>
      )}
    </>
  );
};

export default function AdvancedClaimDialog({
  stakeState,
  setStakeState,
  open,
  setOpen,
  handleUnstakeClaim,
}) {
  const { cstokens: stakedCSTTokens } = useStakedToken();
  const stakedActionIds = stakedCSTTokens.map((x) => x.TokenInfo.StakeActionId);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSendTransaction = async () => {
    handleClose();
    handleUnstakeClaim(
      "unstaked, claimed",
      stakeState
        .filter((x) => x.unstake && stakedActionIds.includes(x.StakeActionId))
        .map((x) => x.StakeActionId),
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
    if (unstakeActionIds.length === 0 && claimActionIds.length === 0) {
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
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
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
